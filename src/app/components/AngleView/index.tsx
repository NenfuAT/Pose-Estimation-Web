import * as THREE from "three";
import styles from "./style.module.scss";

type Props = {
  quaternion: THREE.Quaternion;
};

const AngleView = ({ quaternion }: Props) => {
  if (!(quaternion instanceof THREE.Quaternion)) {
    console.error("Invalid quaternion:", quaternion);
    return <div className={styles.container}>Invalid quaternion</div>;
  }

  const euler = new THREE.Euler().setFromQuaternion(quaternion);
  return(
  <div className={styles.container}>
    <p>X軸角度:{THREE.MathUtils.radToDeg(euler.x)};</p>
    <p>Y軸角度:{THREE.MathUtils.radToDeg(euler.y)};</p>
    <p>Z軸角度:{THREE.MathUtils.radToDeg(euler.z)};</p>
    <button>描画開始</button>
  </div>
  );
};
export default AngleView;
