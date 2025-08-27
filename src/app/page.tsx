import Image from "next/image";
import styles from "./page.module.css";
import { RecipeBrowser } from '../components/RecipeBrowser';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";



export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
       <RecipeBrowser />
      </main>
    </div>
  );
}
