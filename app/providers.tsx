"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/wallet/wallet-provider"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <WalletProvider>
        {children}
        <Toaster />
      </WalletProvider>
    </ThemeProvider>
  )
} 