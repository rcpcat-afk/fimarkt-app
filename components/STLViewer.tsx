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
  onVerticesReady?: (vertices: number[]) => void;
  onNormalsReady?: (normals: number[]) => void;
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlReady, setHtmlReady] = useState(false);
  const [stlBase64, setStlBase64] = useState<string | null>(null);

  useEffect(() => {
    if (cachedVertices && cachedNormals) {
      setLoading(false);
      setHtmlReady(true);
      return;
    }
    setLoading(true);
    setError(null);
    setHtmlReady(false);
    setStlBase64(null);

    // STL dosyasını base64 olarak oku

    setHtmlReady(true);
    setLoading(true);

    fetch(uri)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          setStlBase64(base64);
        };
        reader.onerror = () => setError("Dosya okunamadı");
        reader.readAsDataURL(blob);
      })
      .catch(() => setError("Dosya okunamadı"));
  }, [uri]);

  useEffect(() => {
    if (webViewRef.current && htmlReady) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: "COLOR_CHANGE", color }),
      );
    }
  }, [color]);
  useEffect(() => {
    if (stlBase64) {
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.postMessage(
            JSON.stringify({ type: "STL_DATA", base64: stlBase64 }),
          );
        }
      }, 500);
    }
  }, [stlBase64]);
  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "LOADED") {
        setLoading(false);
        if (onVolumeCalculated) {
          onVolumeCalculated(msg.volumeCm3 ?? 0, msg.weightGram ?? 0, 0);
        }
        if (onVerticesReady && msg.vertices) onVerticesReady(msg.vertices);
        if (onNormalsReady && msg.normals) onNormalsReady(msg.normals);
      } else if (msg.type === "ERROR") {
        setError(msg.message);
        setLoading(false);
      }
    } catch {}
  };

  if (error) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const verticesJson = cachedVertices ? JSON.stringify(cachedVertices) : "null";
  const normalsJson = cachedNormals ? JSON.stringify(cachedNormals) : "null";
  const stlData = stlBase64 ?? "null";

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
    const MAX_TRIANGLES = 50000;

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
    }

    function parseSTLBinary(buffer) {
      const view = new DataView(buffer);
      const triangleCount = view.getUint32(80, true);
      const step = Math.max(1, Math.floor(triangleCount / MAX_TRIANGLES));
      const usedTriangles = Math.ceil(triangleCount / step);
      
      const positions = new Float32Array(usedTriangles * 9);
      const normals = new Float32Array(usedTriangles * 9);
      let idx = 0;

      for (let i = 0; i < triangleCount; i += step) {
        const offset = 84 + i * 50;
        if (offset + 50 > buffer.byteLength) break;
        
        const nx = view.getFloat32(offset, true);
        const ny = view.getFloat32(offset + 4, true);
        const nz = view.getFloat32(offset + 8, true);

        for (let v = 0; v < 3; v++) {
          const vOffset = offset + 12 + v * 12;
          positions[idx * 3] = view.getFloat32(vOffset, true);
          positions[idx * 3 + 1] = view.getFloat32(vOffset + 4, true);
          positions[idx * 3 + 2] = view.getFloat32(vOffset + 8, true);
          normals[idx * 3] = nx;
          normals[idx * 3 + 1] = ny;
          normals[idx * 3 + 2] = nz;
          idx++;
        }
      }

      return { positions: positions.slice(0, idx * 3), normals: normals.slice(0, idx * 3) };
    }

    function parseSTLAscii(text) {
      const lines = text.split('\\n');
      const positions = [];
      const normals = [];
      let nx = 0, ny = 0, nz = 0;
      let triCount = 0;

      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith('facet normal')) {
          const p = t.split(/\\s+/);
          nx = parseFloat(p[2]); ny = parseFloat(p[3]); nz = parseFloat(p[4]);
        } else if (t.startsWith('vertex')) {
          const p = t.split(/\\s+/);
          positions.push(parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3]));
          normals.push(nx, ny, nz);
          triCount++;
          if (triCount > MAX_TRIANGLES * 3) break;
        }
      }
      return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
    }

    function computeVolume(positions) {
      let volume = 0;
      for (let i = 0; i < positions.length; i += 9) {
        const ax = positions[i], ay = positions[i+1], az = positions[i+2];
        const bx = positions[i+3], by = positions[i+4], bz = positions[i+5];
        const cx = positions[i+6], cy = positions[i+7], cz = positions[i+8];
        volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
      }
      return Math.abs(volume);
    }

    function loadFromBase64(base64) {
      try {
        const binary = atob(base64);
        const buffer = new ArrayBuffer(binary.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);

        let parsed;
        const header = new Uint8Array(buffer, 0, 5);
        const isAscii = String.fromCharCode(...header) === 'solid';
        
        if (isAscii) {
          parsed = parseSTLAscii(binary);
        } else {
          parsed = parseSTLBinary(buffer);
        }

        buildMesh(parsed.positions, parsed.normals);

        const volumeMm3 = computeVolume(parsed.positions);
        const volumeCm3 = volumeMm3 / 1000;
        const weightGram = volumeCm3 * 1.24;

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LOADED',
          volumeCm3: Math.round(volumeCm3 * 10000) / 10000,
          weightGram: Math.round(weightGram * 10) / 10,
        }));
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: 'Parse hatası: ' + e.message }));
      }
    }

    function loadFromVertices(vertices, normals) {
      const positions = new Float32Array(vertices);
      const norms = new Float32Array(normals);
      buildMesh(positions, norms);
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOADED', volumeCm3: 0, weightGram: 0 }));
    }

    function buildMesh(positions, normals) {
      if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); }
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

      const center = new THREE.Vector3();
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);

      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const scale = 2.0 / Math.max(size.x, size.y, size.z);
      geometry.scale(scale, scale, scale);
      geometry.computeBoundingBox();
      geometry.translate(0, -geometry.boundingBox.min.y - 1.2, 0);

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
    if (msg.type === 'COLOR_CHANGE' && mesh) {
      mesh.material.color.set(msg.color);
    } else if (msg.type === 'STL_DATA') {
      loadFromBase64(msg.base64);
    }
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

    const cachedVertices = ${verticesJson};
const cachedNormals = ${normalsJson};

if (cachedVertices && cachedNormals) {
  loadFromVertices(cachedVertices, cachedNormals);
}
  </script>
</body>
</html>`;

  return (
    <View style={[styles.container, { height }]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.loadingText}>Model hazırlanıyor...</Text>
        </View>
      )}
      {htmlReady && (
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={styles.webview}
          onMessage={handleMessage}
          onLoad={() => {
            if (stlBase64 && webViewRef.current) {
              webViewRef.current.postMessage(
                JSON.stringify({ type: "STL_DATA", base64: stlBase64 }),
              );
            }
          }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
        />
      )}
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "#1a1a2e",
  },
  loadingText: {
    color: Colors.text2,
    fontSize: 13,
    textAlign: "center",
    paddingTop: 12,
  },
  errorText: {
    color: Colors.text2,
    fontSize: 13,
    textAlign: "center",
  },
});
