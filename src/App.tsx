import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import { useState } from "react";
import { MeshBasicMaterial, MeshStandardMaterial } from "three";

const store = createXRStore();

function App() {
  const [red, setRed] = useState(false);
  const [isVR, setIsVR] = useState(false);

  return (
    <>
      <Suspense fallback={<span>loading...</span>}>
        <button
          onClick={() => {
            if (!isVR) {
              setIsVR(true);
              return;
            }
          }}
        >
          Enter VR
        </button>
        <Canvas style={{ height: "100vh" }}>
          {!isVR && <OrbitControls />}
          <XR store={store}>
            {/* 太陽光を描画 */}
            <directionalLight position={[100, 60, 100]} intensity={15} />
            <mesh
              pointerEventsType={{ deny: "grab" }}
              onClick={() => setRed(!red)}
              position={[0, 0.5, -0]}
              scale={[0.5, 0.5, 0.5]}
            >
              <boxGeometry />
              <primitive
                object={
                  new MeshStandardMaterial({
                    color: red ? "red" : "blue",
                    metalness: 0,
                    roughness: 0.2,
                  })
                }
              />
            </mesh>
            {/* 地面を作成 */}
            <mesh
              pointerEventsType={{ deny: "grab" }}
              position={[0, 0, 0]}
              scale={[1000, 0.1, 1000]}
            >
              <boxGeometry />
              <primitive
                object={
                  new MeshStandardMaterial({
                    color: "green",
                    metalness: 0,
                    roughness: 1,
                  })
                }
              />
            </mesh>
            {/* 半透明な球 */}
            <mesh
              pointerEventsType={{ deny: "grab" }}
              position={[0, 0, 0]}
              scale={[3, 3, 3]}
            >
              <sphereGeometry />
              <primitive
                object={
                  new MeshBasicMaterial({
                    color: "red",
                    transparent: true,
                    opacity: 0.2,
                  })
                }
              />
            </mesh>
          </XR>
          <Sky
            distance={450000} // 表示距離
            sunPosition={[100, 60, 100]} // 太陽の位置
            inclination={0} // 天の赤道の傾き
            azimuth={0.25} // 方位角
          />
        </Canvas>
      </Suspense>
    </>
  );
}

export default App;
