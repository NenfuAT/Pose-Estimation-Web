import Image from "next/image";
import styles from "./page.module.css";

interface HomeProps {
  domain: string;
}

export default function Home({domain}: HomeProps) {
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

export const getServerSideProps = async() => {
  const domain = process.env.DOMAIN_NAME;
  return{
    props: {
      domain,
    }
  }
}