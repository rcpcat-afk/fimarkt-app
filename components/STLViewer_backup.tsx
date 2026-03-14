import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Colors } from "../constants";

interface STLViewerProps {
  uri: string;
  color?: string;
  height?: number;
  onVolumeCalculated?: (
    volumeCm3: number,
    weightGram: number,
    printHours: number,
  ) => void;
  onPriceCalculated?: (priceData: {
    unitPrice: number;
    totalPrice: number;
    discount: number;
    weightGram: number;
    printHours: number;
    source: string;
  }) => void;
  cachedVertices?: number[];
  cachedNormals?: number[];
  onNormalsReady?: (normals: number[]) => void;
  onVerticesReady?: (vertices: number[]) => void;
  priceParams?: {
    technologyId: string;
    infill: number;
    gramPrice: number;
    hourlyRate: number;
    fixedCost: number;
    profitMargin: number;
    quantity: number;
  };
}

export function calculateVolumeCm3(geometry: any): number {
  return 0;
}

const PYTHON_URL = "https://astonishing-reprieve-production.up.railway.app";

export default function STLViewer({
  uri,
  color = "#cccccc",
  height = 260,
  onVolumeCalculated,
  onPriceCalculated,
  cachedVertices,
  cachedNormals,
  onVerticesReady,
  onNormalsReady,
  priceParams,
}: STLViewerProps) {
  const webViewRef = useRef<WebView>(null);
  const [vertices, setVertices] = useState<number[] | null>(null);
  const [normals, setNormals] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedVertices && cachedNormals) {
      setVertices(cachedVertices);
      setNormals(cachedNormals);
      return;
    }
    setVertices(null);
    setNormals(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "model.stl",
      type: "application/octet-stream",
    } as any);

    if (priceParams) {
      formData.append("technology_id", priceParams.technologyId);
      formData.append("infill", String(priceParams.infill));
      formData.append("gram_price", String(priceParams.gramPrice));
      formData.append("hourly_rate", String(priceParams.hourlyRate));
      formData.append("fixed_cost", String(priceParams.fixedCost));
      formData.append("profit_margin", String(priceParams.profitMargin));
      formData.append("quantity", String(priceParams.quantity));
    }

    fetch(`${PYTHON_URL}/viewer`, {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((data: any) => {
        if (data.vertices) {
          setVertices(data.vertices);
          setNormals(data.normals);
          if (onVerticesReady) onVerticesReady(data.vertices);
          if (onNormalsReady) onNormalsReady(data.normals);

          if (onVolumeCalculated)
            onVolumeCalculated(
              data.volume_cm3,
              data.weight_gram,
              data.print_hours ?? 0,
            );
          if (onPriceCalculated && data.unit_price !== undefined) {
            onPriceCalculated({
              unitPrice: data.unit_price,
              totalPrice: data.total_price,
              discount: data.discount ?? 0,
              weightGram: data.weight_gram,
              printHours: data.print_hours,
              source: data.source,
            });
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

  if (!vertices || !normals) {
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
  const normalsJson = JSON.stringify(normals);

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
      const positions = new Float32Array(${verticesJson});
      const normals = new Float32Array(${normalsJson});
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
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
    } catch {}
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
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
