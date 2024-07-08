import { Quaternions } from "@/types";
import { useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useEffect, useState } from "react";
import LZString from "lz-string";
import JSZip from "jszip";

type Props = {
  modelUrl: string;
};

const ModelView = ({ modelUrl }: Props) => {
  const params = useSearchParams();
  let canvas: HTMLElement;
  const [gyroUrl, setGyroUrl] = useState<string>("");
  const [accUrl, setAccUrl] = useState<string>("");
  //const [modelUrl, setModelUrl] = useState<string>("");
  const [quaternionData, setQuaternionData] = useState<Quaternions>([]);
  useEffect(() => {
    // Fetch gyro and acc parameters from URL
    const compressedGyro = params.get("gyro");
    if (compressedGyro) {
      const decompressedGyro =
        LZString.decompressFromEncodedURIComponent(compressedGyro);
      setGyroUrl(decompressedGyro);
    }

    const compressedAcc = params.get("acc");
    if (compressedAcc) {
      const decompressedAcc =
        LZString.decompressFromEncodedURIComponent(compressedAcc);
      setAccUrl(decompressedAcc);
    }
    
  }, [params]);

  useEffect(() => {
    if (gyroUrl && accUrl) {
      const fetchCSVData = async () => {
        try {
          const response = await fetch("/api/estimation", {
            cache: "no-store",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gyro_url: gyroUrl,
              acc_url: accUrl,
            }),
          });

          const blob = await response.blob();
          const zip = new JSZip();
          const unzipped = await zip.loadAsync(blob);
          const csvFile = unzipped.file(/.*\.csv$/i)[0]; // CSVファイルを取得

          const csvData = await csvFile.async("string");
          setQuaternionData(parseCSV(csvData));
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchCSVData();
    }
  }, [gyroUrl, accUrl]);

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

        // アニメーション関数
        const animate = () => {
          if (frameIndex < quaternionData.length) {
            const { quaternion } = quaternionData[frameIndex];
            // 時間に対応するクォータニオンを取得し、モデルに適用する
            model.setRotationFromQuaternion(quaternion);

            frameIndex++; // 次のフレームへ進む
          }

          renderer.render(scene, camera);
          controls.update();
          requestAnimationFrame(animate);
        };
        animate();
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

  // CSVデータのパース関数
  const parseCSV = (csvData: string) => {
    const lines = csvData.trim().split("\n");
    const result = lines.slice(1).map((line) => {
      const [time, w, x, y, z] = line.split(",").map(parseFloat);
      return { time, quaternion: new THREE.Quaternion(x, z, -y, w) };
    });
    return result;
  };

  return (
    <>
      <canvas id="canvas"></canvas>
    </>
  );
};

export default ModelView;
