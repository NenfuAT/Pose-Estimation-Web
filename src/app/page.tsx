"use client"
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [responseData, setResponseData] = useState<string[]>([]);

  useEffect(() => {
    // クライアントサイドでAPIを叩く関数
    const fetchData = async () => {
      try {
        const response = await fetch('/api/buckets'); // APIのエンドポイントを指定
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setResponseData(data.buckets);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // fetchData関数を呼び出してAPIを叩く
    fetchData();
  }, []); // コンポーネントがマウントされたときのみ実行する

  return (
    <main className={styles.main}>
      <div>
        {/* responseDataがnullでない場合、データを表示 */}
        {responseData && (
          <select className={styles.dropdown}>
          {responseData.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
          </select>
        )}
      </div>
    </main>
  );
}
