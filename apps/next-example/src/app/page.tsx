import { Test } from '../components/test';
import styles from './page.module.css';
export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Test />
      </main>
    </div>
  );
}
