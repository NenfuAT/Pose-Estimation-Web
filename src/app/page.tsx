"use client"
import { useState, useEffect, SetStateAction } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import LZString from 'lz-string';
export default function Home() {
  const [bucketData, setBucketData] = useState<string[]>([]);
  const [objectData, setObjectData] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [selectedGyro, setSelectedGyro] = useState<string>('');
  const [selectedAcc, setSelectedAcc] = useState<string>('');
  const [gyroUrl, setGyroUrl] = useState<string>('');
  const [accUrl, setAccUrl] = useState<string>('');
  const [pathValue, setPathValue] = useState<string>('');
  const [bucketButtonDisabled, setBucketButtonDisabled] = useState<boolean>(true); 
  const router = useRouter();
  useEffect(() => {
    // クライアントサイドでAPIを叩く関数
    const fetchData = async () => {
      try {
        const response = await fetch('/api/buckets',{ cache: 'no-store' }); // APIのエンドポイントを指定
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log(data.buckets)
        setBucketData(data.buckets);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // fetchData関数を呼び出してAPIを叩く
    fetchData();
  }, []); // コンポーネントがマウントされたときのみ実行する

  useEffect(() => {
    if (gyroUrl && accUrl) {
      const compressedGyro = LZString.compressToEncodedURIComponent(gyroUrl);
      const compressedAcc = LZString.compressToEncodedURIComponent(accUrl);
      const href = `/3dviewer?gyro=${compressedGyro}&acc=${compressedAcc}`;
      router.push(href);
    }
  }, [gyroUrl, accUrl]);

  const bucketSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBucket(event.target.value);
    // プルダウンメニューが選択されているかどうかでボタンの活性/非活性を切り替える
    setBucketButtonDisabled(event.target.value === '');
  };

  const gyroSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGyro(event.target.value);
  };

  const accSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAcc(event.target.value);
  };

  const pathInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPathValue(event.target.value);
  };

  const bucketButtonClick = async () => {
    try {
      const response = await fetch('/api/objects', {
        cache:'no-store',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          { "bucket": selectedBucket,
            "prefix": pathValue
          }
        ),
      });

      if (!response.ok) {
        throw new Error('Failed to post data');
      }

      const data = await response.json();
      setObjectData(data.objects);
      console.log('Response from API:', data);
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  const estimationButtonClick = async () => {
    try {
      // First request for gyro
      const gyroResponsePromise = fetch('/api/urls', {
        cache: 'no-store',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucket: selectedBucket,
          key: selectedGyro,
        }),
      });
  
      // Second request for acc
      const accResponsePromise = fetch('/api/urls', {
        cache: 'no-store',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucket: selectedBucket,
          key: selectedAcc,
        }),
      });
  
      const [gyroResponse, accResponse] = await Promise.all([gyroResponsePromise, accResponsePromise]);
  
      if (!gyroResponse.ok) {
        throw new Error('Failed to post gyro data');
      }
      if (!accResponse.ok) {
        throw new Error('Failed to post acc data');
      }
  
      const gyroData = await gyroResponse.json();
      const accData = await accResponse.json();
  
      setGyroUrl(gyroData.url);
      setAccUrl(accData.url);
  
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };
  
  

  return (
    <main className={styles.main}>
    {/* <h1>端末の姿勢推定する蔵</h1> */}
  <div>
    <h1>バケット選択</h1>
    {/* responseDataがnullでない場合、データを表示 */}
    {bucketData && (
      <div className={styles.dropdownContainer}>
        <select className={styles.dropdown} onChange={bucketSelectChange}>
          <option value="">選択してください</option> {/* デフォルトの選択肢 */}
          {bucketData.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
        </select>
        <input type="text" className={styles.inputField} placeholder="パス(なくてもOK)"value={pathValue}onChange={pathInputChange} ></input>
        <button className={styles.button} onClick={bucketButtonClick} disabled={bucketButtonDisabled}>選択</button>
      </div>
    )}
    <h1>角速度データ選択</h1>
    {objectData && (
      <div className={styles.dropdownContainer}>
        <select className={styles.dropdown} onChange={gyroSelectChange}>
          <option value="">選択してください</option> {/* デフォルトの選択肢 */}
          {objectData.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
        </select>
      </div>
    )}
    
    <h1>加速度データ選択</h1>
    {objectData && (
      <div className={styles.dropdownContainer}>
        <select className={styles.dropdown} onChange={accSelectChange}>
          <option value="">選択してください</option> {/* デフォルトの選択肢 */}
          {objectData.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
        </select>
      </div>
    )}
    {selectedGyro !== '' && selectedAcc !== '' && (
      <button className={styles.button} onClick={estimationButtonClick}>レッツ推定!!</button>
    )}
    
  </div>
    
</main>

  );
}
