import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/header"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "0N1 Lore Crafter",
  description: "Create detailed lore for your 0N1 Force NFT character",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
