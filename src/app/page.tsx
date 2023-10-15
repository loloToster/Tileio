"use client"
import { useSession } from "next-auth/react"
import styles from "./page.module.scss"

export default function Home() {
  const { data: session } = useSession()
  return <h1 className={styles.lol}>{session?.user?.name}</h1>
}
