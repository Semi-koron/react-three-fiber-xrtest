import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";
import {
  XR,
  createXRStore,
  useXRInputSourceState,
  XROrigin,
} from "@react-three/xr";
import { useState, useRef } from "react";
import { Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from "three";
import { Group } from "three";

const store = createXRStore();

function App() {
  const [red, setRed] = useState(false);
  const [rightGrab, setRightGrab] = useState(false);
  const [isVR, setIsVR] = useState(false);
  const leftMeshRef = useRef<Mesh>(null);
  const rightMeshRef = useRef<Mesh>(null);

  const Locomotion = () => {
    const leftController = useXRInputSourceState("controller", "left");
    const rightController = useXRInputSourceState("controller", "right");
    const ref = useRef<Group>(null);
    useFrame((_, _delta) => {
      if (
        ref.current == null ||
        leftController == null ||
        rightController == null
      ) {
        return;
      }
      const leftSqueezeState = leftController.gamepad["xr-standard-squeeze"];
      const rightSqueezeState = rightController.gamepad["xr-standard-squeeze"];
      if (leftSqueezeState == null || rightSqueezeState == null) {
        return;
      }
      if (leftSqueezeState.state == "pressed") {
        setRed(true);
        // キューブをleftControllerの位置に移動
        const leftControllerPos = new Vector3();
        if (leftController.object) {
          leftController.object.getWorldPosition(leftControllerPos);
          if (leftMeshRef.current) {
            leftMeshRef.current.position.set(
              leftControllerPos.x,
              leftControllerPos.y,
              leftControllerPos.z
            );
          }
          console.log(leftControllerPos);
        }
      } else {
        setRed(false);
      }
      if (rightSqueezeState.state == "pressed") {
        // キューブをrightControllerの位置に移動
        const rightControllerPos = new Vector3();
        if (rightController.object) {
          rightController.object.getWorldPosition(rightControllerPos);
          if (rightMeshRef.current) {
            rightMeshRef.current.position.set(
              rightControllerPos.x,
              rightControllerPos.y,
              rightControllerPos.z
            );
          }
          console.log(rightControllerPos);
        }
        setRightGrab(true);
      } else {
        if (rightGrab) {
          setRightGrab(false);
        }
      }
      return;
    });
    return <XROrigin ref={ref} />;
  };

  return (
    <>
      <Suspense fallback={<span>loading...</span>}>
        <button
          onClick={() => {
            if (!isVR) {
              setIsVR(true);
              store.enterVR();
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
            <mesh
              pointerEventsType={{ deny: "grab" }}
              position={[0, 0, 0]}
              scale={[0.25, 0.25, 0.25]}
              ref={leftMeshRef}
            >
              <boxGeometry />
              <primitive
                object={
                  new MeshStandardMaterial({
                    color: "yellow",
                    metalness: 0,
                    roughness: 0.2,
                  })
                }
              />
            </mesh>
            <mesh
              pointerEventsType={{ deny: "grab" }}
              position={[0, 0, 0]}
              scale={[0.25, 0.25, 0.25]}
              ref={rightMeshRef}
            >
              <boxGeometry />
              <primitive
                object={
                  new MeshStandardMaterial({
                    color: "cyan",
                    metalness: 0,
                    roughness: 0.2,
                  })
                }
              />
            </mesh>
            <Locomotion />
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
