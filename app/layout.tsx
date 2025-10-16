import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_Thai } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
})

export const metadata: Metadata = {
  title: "ตารางงานและกระบวนการผลิตสินค้าครัวกลาง",
  description: "ระบบแสดงแผนการผลิตรายวันแบบ Gantt Chart สำหรับสินค้าครัวกลาง",
  generator: "Production Schedule System",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`font-sans ${notoSansThai.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
