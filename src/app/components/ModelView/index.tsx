import { Distances, Quaternions } from "@/types";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useEffect, useState} from "react";
import AngleView from "../AngleView";
import { Distance } from "@/classes";


type Props = {
  quaternionData:Quaternions;
  distanceData:Distances;
  modelUrl: string;
};

const ModelView = ({ quaternionData,distanceData,modelUrl }: Props) => {
  let canvas: HTMLElement;
  const [frameQuaternion, setQuaternion] = useState<THREE.Quaternion>();
  const [frameDistance,setDistance]=useState<Distance>();
  const [flag,setFlag]=useState<boolean>(false);

  useEffect(() => {
    if (!canvas) {
      canvas = document.getElementById("canvas")!;
    }
    if (modelUrl != "") {
      create();
    }
    function create() {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x999999); // 背景色を黒に設定
      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas || undefined,
        antialias: true,
        alpha: true,
      });

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(window.devicePixelRatio);

      // グリッドヘルパーを追加
      const gridHelper = new THREE.GridHelper(100, 500, 0xffffff, 0xffffff); // サイズ100、分割数10、色白
      // グリッドの線を薄くするために不透明度を設定
      (gridHelper.material as THREE.Material).opacity = 0.2;
      (gridHelper.material as THREE.Material).transparent = true;
      //gridHelper.rotation.x = Math.PI / 2; // X軸周りに90度回転してXY平面に配置
      scene.add(gridHelper);
      //軸の表示
      var axes = new THREE.AxesHelper(100);
      scene.add(axes);

      // カメラを作成
      const camera = new THREE.PerspectiveCamera(
        45,
        sizes.width / sizes.height,
        1,
        10000
      );
      camera.position.set(3, 5, 5);

      // カメラコントローラーを作成
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.2;

      const directionlLight = new THREE.DirectionalLight(0xe8d2cc, 4.5);
      directionlLight.position.set(20, 20, 60).normalize();
      scene.add(directionlLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.2);
      pointLight.position.set(1, 2, 3);
      scene.add(pointLight);

      const gltfLoader = new GLTFLoader();
      let model: THREE.Group<THREE.Object3DEventMap>;
      console.log(modelUrl);
      gltfLoader.load(modelUrl, (gltf) => {
        model = gltf.scene;
        model.scale.set(15.0, 15.0, 15.0); // Adjust scale as needed
        model.position.set(0, 0, 0);
        scene.add(model);
        let frameIndex = 0;

        let interval = (quaternionData[1].time-quaternionData[0].time)// フレームごとの時間間隔
        let startTime = 0; // 最後のフレームの時間

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const delta = timestamp - startTime;
          console.log("interval"+interval)
          console.log(timestamp)
          if (delta> interval) {
            if (frameIndex < quaternionData.length) {
              interval =(quaternionData[frameIndex].time-quaternionData[0].time)
              const { quaternion } = quaternionData[frameIndex];
              const { distance } = distanceData[frameIndex];
              setQuaternion(quaternion);
              setDistance(distance);
              // 時間に対応するクォータニオンを取得し、モデルに適用する
              model.setRotationFromQuaternion(quaternion);
              // 移動データをモデルに適用
              if (distance) {
                model.position.set(distance.x*10, distance.y*10, distance.z*10);
              }

              frameIndex++; // 次のフレームへ進む
            }
          }

          renderer.render(scene, camera);
          controls.update();
          requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);


      });

      const handleResize = () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(window.devicePixelRatio);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [modelUrl,quaternionData]);

  return (
    <>
      <AngleView quaternion={frameQuaternion!}/>
      <canvas id="canvas"></canvas>
    </>
  );
};

export default ModelView;
