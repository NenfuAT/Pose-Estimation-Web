"use client"
import { useEffect, useState } from "react";
import styles from "../page.module.css";

export default function Home() {
  const [domain, setDomain] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/test'); // APIのエンドポイントを指定
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.text();
        console.log(data)
        setDomain(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // fetchData関数を呼び出してAPIを叩く
    fetchData();
  }, []); 
  return (
    <main className={styles.main}>
      <a>{domain}</a>
    </main>
  );
}