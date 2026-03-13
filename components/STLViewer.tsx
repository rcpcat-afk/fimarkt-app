import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Colors } from "../constants";

interface STLViewerProps {
  uri: string;
  color?: string;
  height?: number;
  onVolumeCalculated?: (volumeCm3: number, weightGram: number) => void;
}

export function calculateVolumeCm3(geometry: any): number {
  const position = geometry.attributes.position;
  let volume = 0;
  for (let i = 0; i < position.count; i += 3) {
    const ax = position.getX(i),
      ay = position.getY(i),
      az = position.getZ(i);
    const bx = position.getX(i + 1),
      by = position.getY(i + 1),
      bz = position.getZ(i + 1);
    const cx = position.getX(i + 2),
      cy = position.getY(i + 2),
      cz = position.getZ(i + 2);
    volume +=
      (ax * (by * cz - bz * cy) -
        ay * (bx * cz - bz * cx) +
        az * (bx * cy - by * cx)) /
      6;
  }
  return Math.abs(volume) / 1000;
}

const PYTHON_URL = "https://astonishing-reprieve-production.up.railway.app";

export default function STLViewer({
  uri,
  color = "#cccccc",
  height = 260,
  onVolumeCalculated,
}: STLViewerProps) {
  const webViewRef = useRef<WebView>(null);
  const [vertices, setVertices] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVertices(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "model.stl",
      type: "application/octet-stream",
    } as any);

    fetch(`https://astonishing-reprieve-production.up.railway.app/viewer`, {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.vertices) {
          setVertices(data.vertices);
          if (onVolumeCalculated) {
            // Hacim Python'dan gelmiyor bu endpoint'te, analyze'dan gelsin
            // Şimdilik weightGram 0 — ileride /analyze ile birleştiririz
          }
        } else {
          setError("Model verisi alınamadı");
        }
      })
      .catch(() => setError("Sunucuya bağlanılamadı"));
  }, [uri]);

  useEffect(() => {
    if (webViewRef.current && vertices) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: "COLOR_CHANGE", color }),
      );
    }
  }, [color]);

  if (error) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!vertices) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator
          color={Colors.accent}
          style={{ flex: 1 }}
          size="large"
        />
        <Text style={styles.loadingText}>Model hazırlanıyor...</Text>
      </View>
    );
  }

  const verticesJson = JSON.stringify(vertices);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; overflow: hidden; width: 100vw; height: 100vh; }
    canvas { display: block; }
    #hint {
      position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.4); border-radius: 20px;
      padding: 4px 12px; color: rgba(255,255,255,0.6);
      font-size: 11px; font-family: sans-serif; pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="hint">↔ Döndür · ↕ Kaydır · 🤌 Zoom</div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    let scene, camera, renderer, mesh;
    let isDragging = false, lastX = 0, lastY = 0, lastDist = 0;
    let rotY = 0, camY = 1.5, camDist = 4;
    let modelColor = '${color}';
    let autoRotate = true;

    function init() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);
      camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, camY, camDist);
      camera.lookAt(0, 0, 0);
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      document.body.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
      dir1.position.set(5, 8, 5); scene.add(dir1);
      const dir2 = new THREE.DirectionalLight(0x8888ff, 0.3);
      dir2.position.set(-5, -2, -5); scene.add(dir2);

      const grid = new THREE.GridHelper(6, 12, 0x334455, 0x223344);
      grid.position.y = -1.2; scene.add(grid);

      const xMat = new THREE.LineBasicMaterial({ color: 0xff4444 });
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3,-1.2,0), new THREE.Vector3(3,-1.2,0)]), xMat));
      const yMat = new THREE.LineBasicMaterial({ color: 0x44ff44 });
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-1.2,0), new THREE.Vector3(0,2.5,0)]), yMat));
      const zMat = new THREE.LineBasicMaterial({ color: 0x4488ff });
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-1.2,-3), new THREE.Vector3(0,-1.2,3)]), zMat));

      setupTouch();
      animate();
      loadModel();
    }

    function loadModel() {
      const verticesArray = ${verticesJson};
      const positions = new Float32Array(verticesArray);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.computeVertexNormals();
      mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color: modelColor, shininess: 80, specular: new THREE.Color(0x333333)
      }));
      scene.add(mesh);
    }

    function setupTouch() {
      const el = renderer.domElement;
      el.addEventListener('touchstart', e => {
        e.preventDefault(); autoRotate = false;
        if (e.touches.length === 1) {
          isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          isDragging = false;
          lastDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
        }
      }, { passive: false });

      el.addEventListener('touchmove', e => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
          rotY += (e.touches[0].clientX - lastX) * 0.01;
          camY -= (e.touches[0].clientY - lastY) * 0.005;
          camera.position.set(0, camY, camDist);
          lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
          camDist = Math.max(1.5, Math.min(10, camDist + (lastDist-dist)*0.02));
          camera.position.set(0, camY, camDist);
          lastDist = dist;
        }
      }, { passive: false });

      el.addEventListener('touchend', () => { isDragging = false; });
    }

    function animate() {
      requestAnimationFrame(animate);
      if (mesh) { if (autoRotate) rotY += 0.008; mesh.rotation.y = rotY; }
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    function handleMsg(e) {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'COLOR_CHANGE' && mesh) mesh.material.color.set(msg.color);
      } catch {}
    }
    window.addEventListener('message', handleMsg);
    document.addEventListener('message', handleMsg);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    init();
  </script>
</body>
</html>`;

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "VOLUME" && onVolumeCalculated) {
        onVolumeCalculated(msg.volumeCm3, msg.weightGram);
      }
    } catch {}
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        key={uri}
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a2e",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingText: {
    color: Colors.text2,
    fontSize: 13,
    textAlign: "center",
    paddingBottom: 16,
  },
  errorText: {
    color: Colors.text2,
    fontSize: 13,
    textAlign: "center",
  },
});
