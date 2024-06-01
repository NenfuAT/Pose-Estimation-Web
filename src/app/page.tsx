'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  let domain
  useEffect(() => {
    const fetchData = async () => {
      domain=`${process.env.DOMAIN_NAME}`
      try {
        const res = await fetch(`${process.env.DOMAIN_NAME}/api/bucket/list`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  
  return (
    <main className={styles.main}>
      <div>
        <a>　　　　　　　　　　　　　　　　　　　　　　　　Next.js完全に理解した</a>
      </div>
      <div>
        <h1>ドメイン:</h1>
        <p>{domain}</p>
      </div>
    </main>
  );
}
