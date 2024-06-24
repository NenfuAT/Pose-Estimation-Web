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

      // カメラを作成
      const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 1, 10000);
      camera.position.set(0, 0, 5);
  
      // カメラコントローラーを作成
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.2;

      const directionlLight = new THREE.DirectionalLight( 0xE8D2CC,4.5 );
      directionlLight.position.set( 10, 10, 50 ).normalize();
      scene.add( directionlLight );

      const pointLight = new THREE.PointLight(0xffffff, 0.2);
      pointLight.position.set(1, 2, 3);
      scene.add(pointLight);

      const gltfLoader = new GLTFLoader();
      console.log(modelUrl)
      gltfLoader.load(modelUrl, (gltf) => {
        gltf.scene.scale.set(10.0, 10.0, 10.0); // Adjust scale as needed
        gltf.scene.position.set(0,0,0);
        scene.add(gltf.scene);
        animate();
      });

      const clock = new THREE.Clock();
      const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            //child.rotation.x = elapsedTime;
            child.rotation.y = elapsedTime;
            //child.rotation.z = elapsedTime;
          }
        });
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

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
