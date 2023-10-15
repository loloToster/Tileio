import "./globals.scss"
import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import AuthProvider from "@/components/AuthProvider"

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] })

export const metadata: Metadata = {
  title: "Tileio"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
