import { Distance } from "@/classes";
import * as THREE from "three";

// CSVデータのパース関数
export const parseQuaternionCSV = (csvData: string) => {
  const lines = csvData.trim().split("\n");
  const result = lines.slice(1).map((line) => {
    const [time, w, x, y, z] = line.split(",").map(parseFloat);
    return { time:time, quaternion: new THREE.Quaternion(x, z, -y, w) };
  });
  return result;
};

export const parseDistanceCSV = (csvData: string) => {
  const lines = csvData.trim().split("\n");
  const result = lines.slice(1).map((line) => {
    const [time, dx, dy, dz] = line.split(",").map(parseFloat);
    return { time:time, distance: new Distance(dx,dy,dz)};
  });
  return result;
};
