import { Distance } from "@/classes";
import * as THREE from "three";

export type ButtonConfig = {
  title: string;
  onClick: () => void;
};

export type Quaternions = {
  time: number;
  quaternion: THREE.Quaternion;
}[];

export type Distances = {
  time: number;
  distance: Distance;
}[];
