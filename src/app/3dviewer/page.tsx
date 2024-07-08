"use client";
import type { NextPage } from "next";
import { Suspense, useEffect, useState } from "react";
import MenuBar from "../components/MenuBar/MenuBar";
import ModelView from "../components/ModelView/ModelView";
import { ButtonConfig } from "@/types";

const Home: NextPage = () => {
  const [modelUrl, setModelUrl] = useState("");
  useEffect(() => {
    if(modelUrl==""){
      getModelUrl("3d-model/pixelwatch.glb")
    }
  },[])
  const modelButtons: ButtonConfig[] = [
    {
      title: "ピクセルウォッチ",
      onClick: () => {
        getModelUrl("3d-model/pixelwatch.glb")
      }
    },
    {
      title: "スマートフォン",
      onClick: () => {
        getModelUrl("3d-model/phone.glb")
      }
    },
  ];

  function getModelUrl(key:string){
    const fetchData = async () => {
      try {
        const modelResponse = await fetch("/api/urls", {
          //cache: "no-store",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucket: "pose-estimation",
            key: key,
          }),
        });

        const modelData = await modelResponse.json();
        setModelUrl(modelData.url);
      } catch (error) {
        console.error("Error posting data:", error);
      }
    };
    fetchData();
  }


  return (
    <>
      <div>
        <MenuBar
          tabName="3Dモデル"
          buttonConfigs={modelButtons}
        />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ModelView modelUrl={modelUrl}/>
      </Suspense>
    </>
  );
};

export default Home;
