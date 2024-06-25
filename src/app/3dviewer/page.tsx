"use client"
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import LZString from 'lz-string';
import { useSearchParams } from 'next/dist/client/components/navigation';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



const Home: NextPage = () => {
  let canvas: HTMLElement;
  const [gyroUrl, setGyroUrl] = useState<string>('');
  const [accUrl, setAccUrl] = useState<string>('');
  const [modelUrl, setModelUrl] = useState<string>('');
  const params = useSearchParams();

  useEffect(() => {
    // Fetch gyro and acc parameters from URL
    const compressedGyro = params.get("gyro");
    if (compressedGyro) {
      const decompressedGyro = LZString.decompressFromEncodedURIComponent(compressedGyro);
      setGyroUrl(decompressedGyro);
    }
    
    const compressedAcc = params.get("acc");
    if (compressedAcc) {
      const decompressedAcc = LZString.decompressFromEncodedURIComponent(compressedAcc);
      setAccUrl(decompressedAcc);
    }
    const fetchData = async () => {
      try {
        const modelResponse = await fetch('/api/urls', {
          cache: 'no-store',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bucket: "pose-estimation",
            key: "3d-model/pixelwatch.glb", // Update with your glTF model path
            //key: "3d-model/phone.glb", // Update with your glTF model path
          }),
        });

        const modelData = await modelResponse.json();
        setModelUrl(modelData.url);

      } catch (error) {
        console.error('Error posting data:', error);
      }
    };

    fetchData();
  }, [params]);

  useEffect(() => {
    if (gyroUrl && accUrl) {
      // Fetch data from API
      const fetchData = async () => {
        try {
          const response = await fetch('/api/estimation', { cache: 'no-store' });
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const data = await response.json();
          console.log(data.buckets);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [gyroUrl, accUrl]);

  useEffect(() => {
    if (!canvas) {
      canvas = document.getElementById('canvas')!;
    }
    if (modelUrl != ""){
      create();
    }
    function create(){
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x999999);  // 背景色を黒に設定
      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
      };

    
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas || undefined,
        antialias: true,
        alpha: true
      });

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(window.devicePixelRatio);


      // グリッドヘルパーを追加
      const gridHelper = new THREE.GridHelper(100, 500, 0xffffff, 0xffffff); // サイズ100、分割数10、色白
      // グリッドの線を薄くするために不透明度を設定
      (gridHelper.material as THREE.Material).opacity = 0.2;
      (gridHelper.material as THREE.Material).transparent = true;
      scene.add(gridHelper);
      //軸の表示
      var axes = new THREE.AxesHelper(100);
      scene.add(axes);

      // カメラを作成
      const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 1, 10000);
      camera.position.set(3, 5, 5);
  
      // カメラコントローラーを作成
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.2;

      const directionlLight = new THREE.DirectionalLight( 0xE8D2CC,4.5 );
      directionlLight.position.set( 20, 20, 60 ).normalize();
      scene.add( directionlLight );

      const pointLight = new THREE.PointLight(0xffffff, 0.2);
      pointLight.position.set(1, 2, 3);
      scene.add(pointLight);

      const gltfLoader = new GLTFLoader();
      let model: THREE.Group<THREE.Object3DEventMap>
      console.log(modelUrl)
      gltfLoader.load(modelUrl, (gltf) => {
        
        model=gltf.scene
        model.scale.set(15.0, 15.0, 15.0); // Adjust scale as needed
        model.position.set(0,0,0);
        scene.add(model);
        // クォータニオンを初期化（単位クォータニオン）
        const quaternion = new THREE.Quaternion();
        const initquaternion = new THREE.Quaternion();
        model.setRotationFromQuaternion(quaternion);
        // 90度回転するクォータニオン
        const targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(180),THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(0)));
        // アニメーションループ
        function animate() {
          requestAnimationFrame(animate);

          // 現在のクォータニオンを補間してオブジェクトに適用
          quaternion.slerp(targetQuaternion, 0.05); // 0.05は補間の速度を表すパラメータ

          model.setRotationFromQuaternion(quaternion);


          renderer.render(scene, camera);
        }

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

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [modelUrl]);

  return (
    <>
      <canvas id="canvas"></canvas>
    </>
  );
};

export default Home;
