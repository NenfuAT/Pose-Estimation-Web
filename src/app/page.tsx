import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div>
        <a>　　　　　　　　　　　　　　　　　　　　　　　　Next.js完全に理解した</a>
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