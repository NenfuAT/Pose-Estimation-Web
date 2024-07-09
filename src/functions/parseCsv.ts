import * as THREE from "three";
// CSVデータのパース関数
export const parseCSV = (csvData: string) => {
  const lines = csvData.trim().split("\n");
  const result = lines.slice(1).map((line) => {
    const [time, w, x, y, z] = line.split(",").map(parseFloat);
    return { time, quaternion: new THREE.Quaternion(x, z, -y, w) };
  });
  return result;
};
