import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  
  return (
    <main className={styles.main}>
      <div>
        <a>　　　　　　　　　　　　　　　　　　　　　　　　Next.js完全に理解した</a>
      </div>
      <div>
        <h1>ドメイン:</h1>
        <p>{process.env.DOMAIN_NAME}</p>
      </div>
    </main>
  );
}
