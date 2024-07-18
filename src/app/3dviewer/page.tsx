"use client";
import type { NextPage } from "next";
import { Suspense, useEffect, useState } from "react";
import MenuBar from "../components/MenuBar";
import ModelView from "../components/ModelView";
import { ButtonConfig, Quaternions } from "@/types";
import { useSearchParams } from "next/navigation";
import LZString from "lz-string";
import JSZip from "jszip";
import { parseCSV } from "@/functions/parseCsv";
import { downloadFile } from "@/functions/downloadFile";
import styles from "./style.module.scss"

const Display: NextPage = () => {
  const [modelUrl, setModelUrl] = useState("");
  const params = useSearchParams();
  const [gyroUrl, setGyroUrl] = useState<string>("");
  const [accUrl, setAccUrl] = useState<string>("");
  const [quaternionData, setQuaternionData] = useState<Quaternions>([]);
  const [quaternionCsv, setQuaternionCsv] = useState<Blob>();

  useEffect(() => {
    if (modelUrl === "") {
      getModelUrl("3d-model/pixelwatch.glb");
    }
  }, []);

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
          const uint8Array = await csvFile.async("uint8array");
          const csvBlob = new Blob([uint8Array.buffer], { type: "application/octet-stream" });
          setQuaternionCsv(csvBlob);
          setQuaternionData(parseCSV(csvData));
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchCSVData();
    }
  }, [gyroUrl, accUrl]);

  const modelButtons: ButtonConfig[] = [
    {
      title: "ピクセルウォッチ",
      onClick: () => {
        getModelUrl("3d-model/pixelwatch.glb");
      },
    },
    {
      title: "スマートフォン",
      onClick: () => {
        getModelUrl("3d-model/phone.glb");
      },
    },
  ];

  const downloadButtons: ButtonConfig[] = [
    {
      title: "クォータニオン",
      onClick: () => {
        if (quaternionCsv) {
          downloadFile(quaternionCsv);
        }
      },
    },
    {
      title: "角度(まだ)",
      onClick: () => {},
    },
  ];

  function getModelUrl(key: string) {
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
      <div className={styles.bar}>
        <MenuBar tabName="3Dモデル" buttonConfigs={modelButtons} />
        <MenuBar tabName="ダウンロード" buttonConfigs={downloadButtons} />
      </div>
      <ModelView modelUrl={modelUrl} quaternionData={quaternionData} />
    </>
  );
};


const Home: NextPage = () => {

  return (
    <>
    <Suspense fallback={<div>Loading...</div>}>
        <Display />
    </Suspense>
    </>
  );
};

export default Home;