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
import { Mesh, Vector3 } from "three";
import { Group } from "three";
import { Physics, RigidBody } from "@react-three/rapier";
import { add } from "three/webgpu";

const store = createXRStore();

function App() {
  const [red, setRed] = useState(false);
  const [rightGrab, setRightGrab] = useState(false);
  const [isVR, setIsVR] = useState(false);
  const leftMeshRef = useRef<Mesh>(null);
  const rightMeshRef = useRef<Mesh>(null);
  const cubeRef = useRef<any>(null);
  const arrow = useRef<any>(null);
  const Locomotion = () => {
    const leftController = useXRInputSourceState("controller", "left");
    const rightController = useXRInputSourceState("controller", "right");
    const ref = useRef<Group>(null);
    useFrame(() => {
      if (!ref.current || !leftController || !rightController) return;

      const leftSqueezeState = leftController.gamepad["xr-standard-squeeze"];
      const rightSqueezeState = rightController.gamepad["xr-standard-squeeze"];
      if (!leftSqueezeState || !rightSqueezeState) return;

      if (leftSqueezeState.state === "pressed") {
        setRed(true);
        const leftControllerPos = new Vector3();
        leftController.object?.getWorldPosition(leftControllerPos);
        if (leftMeshRef.current) {
          leftMeshRef.current.position.copy(leftControllerPos);
        }
      } else {
        setRed(false);
      }

      if (rightSqueezeState.state === "pressed") {
        const rightControllerPos = new Vector3();
        rightController.object?.getWorldPosition(rightControllerPos);
        if (rightMeshRef.current) {
          rightMeshRef.current.position.copy(rightControllerPos);
        }
        setRightGrab(true);
      } else {
        if (rightGrab) {
          throwArrow();
          setRightGrab(false);
        }
      }
    });
    return <XROrigin ref={ref} />;
  };

  const throwArrow = () => {
    addForce();
    if (!leftMeshRef.current || !rightMeshRef.current || !arrow.current) return;
    //leftMeshRefのpositionをに移動
    const leftPos = new Vector3();
    leftMeshRef.current.getWorldPosition(leftPos);
    //rightMeshRefのpositionからleftMeshRefのpositionを引いて、normalizeして、それをarrowのvelocityにする
    const velocity = new Vector3();
    velocity.subVectors(
      rightMeshRef.current.position,
      leftMeshRef.current.position
    );
  };

  const addForce = () => {
    console.log("throwArrow");
    arrow.current.applyImpulse({ x: 1, y: 1, z: 1 });
  };

  return (
    <>
      <Suspense fallback={<span>loading...</span>}>
        <button
          onClick={() => {
            if (!isVR) {
              setIsVR(true);
              store.enterVR();
            }
          }}
        >
          Enter VR
        </button>
        <button onClick={addForce}>test</button>
        <Canvas style={{ height: "100vh" }}>
          {!isVR && <OrbitControls />}
          <XR store={store}>
            <Physics gravity={[0, -9.81, 0]}>
              <directionalLight position={[100, 60, 100]} intensity={15} />
              <RigidBody type="fixed">
                <mesh position={[0, -0.5, 0]} scale={[1000, 0.1, 1000]}>
                  <boxGeometry />
                  <meshStandardMaterial
                    color="green"
                    metalness={0}
                    roughness={1}
                  />
                </mesh>
              </RigidBody>

              <RigidBody ref={cubeRef} position={[0, 0.5, 0]}>
                <mesh scale={[0.5, 0.5, 0.5]}>
                  <boxGeometry />
                  <meshStandardMaterial
                    color={red ? "red" : "blue"}
                    metalness={0}
                    roughness={0.2}
                  />
                </mesh>
              </RigidBody>

              <mesh ref={leftMeshRef} scale={[0.25, 0.25, 0.25]}>
                <boxGeometry />
                <meshStandardMaterial
                  color="yellow"
                  metalness={0}
                  roughness={0.2}
                />
              </mesh>

              <mesh ref={rightMeshRef} scale={[0.25, 0.25, 0.25]}>
                <boxGeometry />
                <meshStandardMaterial
                  color="cyan"
                  metalness={0}
                  roughness={0.2}
                />
              </mesh>

              <RigidBody ref={arrow} position={[5, 1, 0]}>
                <mesh scale={[0.25, 0.25, 0.25]}>
                  <sphereGeometry />
                  <meshStandardMaterial
                    color="cyan"
                    metalness={0}
                    roughness={0.2}
                  />
                </mesh>
              </RigidBody>
              <Locomotion />
            </Physics>
          </XR>
          <Sky
            distance={450000}
            sunPosition={[100, 60, 100]}
            inclination={0}
            azimuth={0.25}
          />
        </Canvas>
      </Suspense>
    </>
  );
}

export default App;
