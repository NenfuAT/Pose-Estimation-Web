"use client";
import type { NextPage } from "next";
import { Suspense, useEffect, useState } from "react";
import MenuBar from "../components/MenuBar";
import ModelView from "../components/ModelView";
import { ButtonConfig, Distances, Quaternions } from "@/types";
import { useSearchParams } from "next/navigation";
import LZString from "lz-string";
import JSZip from "jszip";
import { downloadFile } from "@/functions/downloadFile";
import styles from "./style.module.scss"
import { parseDistanceCSV, parseQuaternionCSV } from "@/functions/parseCsv";

const Display: NextPage = () => {
  const [modelUrl, setModelUrl] = useState("");
  const params = useSearchParams();
  const [gyroUrl, setGyroUrl] = useState<string>("");
  const [accUrl, setAccUrl] = useState<string>("");
  const [quaternionData, setQuaternionData] = useState<Quaternions>([]);
  const [quaternionCsv, setQuaternionCsv] = useState<Blob>();
  const [distanceData, setDistanceData] = useState<Distances>([]);
  const [distanceCsv, setDistanceCsv] = useState<Blob>();


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
          console.log(Object.keys(unzipped.files));
          const csvFiles = unzipped.file(/.*\.csv$/i);
                if (csvFiles.length < 2) {
                    throw new Error("Expected two CSV files but found less.");
                }

          const quaternionCsvFile = csvFiles[0];
          const distanceCsvFile = csvFiles[1];
          const quaternionCsvData = await quaternionCsvFile.async("string");
          const distanceCsvData = await distanceCsvFile.async("string");
          const quaternionUint8Array = await quaternionCsvFile.async("uint8array");
          const distanceUint8Array = await distanceCsvFile.async("uint8array");
          const quaternionCsvBlob = new Blob([quaternionUint8Array.buffer], { type: "application/octet-stream" });
          const distanceCsvBlob = new Blob([distanceUint8Array.buffer], { type: "application/octet-stream" });
          setQuaternionCsv(quaternionCsvBlob);
          setDistanceCsv(distanceCsvBlob);
          setQuaternionData(parseQuaternionCSV(quaternionCsvData));
          setDistanceData(parseDistanceCSV(distanceCsvData));
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
          downloadFile(quaternionCsv,"quaternion");
        }
      },
    },
    {
      title: "移動距離",
      onClick: () => {
        if(distanceCsv){
          downloadFile(distanceCsv,"distance");
        }
      },
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
      <ModelView modelUrl={modelUrl} quaternionData={quaternionData} distanceData={distanceData} />
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