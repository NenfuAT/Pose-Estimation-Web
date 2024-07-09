import * as THREE from "three";

export type ButtonConfig = {
	title: string
	onClick: () => void
}

export type Quaternions={ 
	time: number
	quaternion: THREE.Quaternion 
}[]