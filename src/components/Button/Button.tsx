import styles from "./Button.module.scss"

export interface Props {
  className: string
  onClick: () => void
  children: React.ReactNode
}

export default function Button({
  onClick,
  children,
  className
}: Partial<Props>) {
  return (
    <button className={styles.button + " " + className} onClick={onClick}>
      {children}
    </button>
  )
}
