import Markdown from "react-markdown"
import DefaultLayout from "../DefaultLayout"
import styles from "./MarkdownLayout.module.scss"

const headerRegex = /^#{1,6}\s+.*$/

interface TocElement {
  level: number
  text: string
}

export default function MarkdownLayout({ children }: { children: string }) {
  const toc: TocElement[] = children
    .split("\n")
    .map(l => l.trim())
    .filter(l => headerRegex.test(l.trim()))
    .map(h => {
      let level = 0

      while (h.startsWith("#")) {
        h = h.substring(1)
        level++
      }

      return {
        level,
        text: h
      }
    })

  return (
    <DefaultLayout>
      <div className={styles.main}>
        <div className={styles.toc}>
          {toc.map(el => (
            <a className={styles[`toc__level-${el.level}`]} key={el.text}>
              {el.text}
            </a>
          ))}
        </div>
        <div className={styles.content}>
          <Markdown>{children}</Markdown>
        </div>
      </div>
    </DefaultLayout>
  )
}
