"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './DefaultLayout.module.scss'
import Button from '../Button'

export default function DefaultLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [navActive, setNavActive] = useState(false)

    const handleNavChange = () => {
        setNavActive(prev => !prev)
    }

    return (
        <>
            <header className={styles.header}>
                <Link className={styles.header__logo} href="/">
                    <Image src="/logo.png" alt="Logo" width={40} height={40}/>
                    <span>Tileio</span>
                </Link>
                <nav className={`${styles.header__nav} ${navActive ? styles.header__navActive : ''}`}>
                    <ul>
                        <li>
                            <Link href="/home">Home</Link>
                        </li>
                        <li>
                            <Link href="/guides">Guides</Link>
                        </li>
                        <li>
                            <Link href="/api-docs">API Docs</Link>
                        </li>
                        <li>
                            <Link href="/login">
                                <Button className={styles.header__login}>Login</Button>
                            </Link>
                        </li>
                    </ul>
                </nav>
                <button onClick={handleNavChange} className={styles.header__burger}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="40" width="40">
                        <path d="M4.542 30.75v-3.667h30.916v3.667Zm0-8.917v-3.666h30.916v3.666Zm0-8.916V9.25h30.916v3.667Z"></path>
                    </svg>
                </button>
            </header>
            <main>
                {children}
            </main>
            <footer className={styles.footer}>
                <div className={styles.footer__madeBy}>
                    <i>Made by <a href="https://github.com/loloToster" target="_blank">loloToster</a></i>
                </div>
            </footer>
        </>
    )
}
