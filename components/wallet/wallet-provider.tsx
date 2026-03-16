"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { setCurrentWalletAddress } from "@/lib/storage-wrapper"

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (accounts: string[]) => void) => void
      removeListener: (event: string, handler: (accounts: string[]) => void) => void
    }
  }
}

interface AuthSession {
  token: string
  refreshToken: string
  expiresAt: number
  walletAddress: string
}

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  isAuthenticated: boolean
  isAuthenticating: boolean
  authSession: AuthSession | null
  sessionExpiresIn: number | null
  connect: () => Promise<void>
  disconnect: () => void
  error: string | null
  refreshSession: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  isAuthenticated: false,
  isAuthenticating: false,
  authSession: null,
  sessionExpiresIn: null,
  connect: async () => {},
  disconnect: () => {},
  error: null,
  refreshSession: async () => {},
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Check if ethereum is available
  const isMetaMaskAvailable = () => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }

  // Calculate session expiry time
  const getSessionExpiresIn = () => {
    if (!authSession) return null
    const now = Date.now()
    const expiresIn = authSession.expiresAt - now
    return expiresIn > 0 ? Math.floor(expiresIn / 1000) : 0
  }

  // Initialize wallet state from localStorage
  useEffect(() => {
    setMounted(true)
    
    // Check for existing auth session
    const savedSession = sessionStorage.getItem("authSession")
    if (savedSession) {
      try {
        const session: AuthSession = JSON.parse(savedSession)
        const now = Date.now()
        
        if (session.expiresAt > now) {
          // Session is still valid
          setAuthSession(session)
          setAddress(session.walletAddress)
          setIsConnected(true)
          setIsAuthenticated(true)
          setCurrentWalletAddress(session.walletAddress)
          console.log("Restored authenticated session for:", session.walletAddress)
        } else {
          // Session expired, clear it
          console.log("Session expired, clearing auth data")
          sessionStorage.removeItem("authSession")
          sessionStorage.removeItem("walletAddress")
        }
              } catch (error) {
          console.error("Error parsing saved session:", error)
          sessionStorage.removeItem("authSession")
      }
          } else {
        // Legacy: check for wallet address without auth (force re-auth)
        const savedAddress = sessionStorage.getItem("walletAddress")
        if (savedAddress) {
          console.log("Found legacy wallet connection, requiring re-authentication")
          sessionStorage.removeItem("walletAddress")
      }
    }
  }, [])

  // Handle account changes
  useEffect(() => {
    if (!isMetaMaskAvailable() || !isConnected) return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("MetaMask accounts changed:", accounts)
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect()
      } else if (accounts[0] !== address) {
        // User switched accounts — must re-authenticate with new address
        console.log("Account switched, clearing old session and re-authenticating:", accounts[0])
        // Clear old session state
        setAuthSession(null)
        setIsAuthenticated(false)
        setCurrentWalletAddress(null)
        sessionStorage.removeItem("authSession")
        // Set new address and trigger re-auth
        setAddress(accounts[0])
        setIsConnected(true)
        authenticateWallet(accounts[0])
      }
    }

    window.ethereum?.on("accountsChanged", handleAccountsChanged)

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [address, isConnected])

  const authenticateWallet = async (walletAddress: string) => {
    setIsAuthenticating(true)
    try {
      // Step 1: Get challenge
      console.log("Getting authentication challenge...")
      const challengeResponse = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })
      
      if (!challengeResponse.ok) {
        throw new Error("Failed to get authentication challenge")
      }
      
      const challengeData = await challengeResponse.json()
      
      // Step 2: Sign challenge with wallet
      console.log("Requesting signature from wallet...")
      const signature = await window.ethereum!.request({
        method: "personal_sign",
        params: [challengeData.challenge, walletAddress],
      })
      
      // Step 3: Verify signature
      console.log("Verifying signature...")
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          signature,
          challengeId: challengeData.challengeId,
        }),
      })
      
      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        throw new Error(error.error || "Authentication failed")
      }
      
      const authData = await verifyResponse.json()
      
      // Store auth session
      const session: AuthSession = {
        token: authData.token,
        refreshToken: authData.refreshToken,
        expiresAt: authData.expiresAt,
        walletAddress: walletAddress.toLowerCase(),
      }
      
      setAuthSession(session)
      setIsAuthenticated(true)
      setCurrentWalletAddress(walletAddress.toLowerCase())
      sessionStorage.setItem("authSession", JSON.stringify(session))
      
      toast({
        title: "Wallet Authenticated",
        description: "Your wallet has been securely authenticated.",
      })
      
      return true
    } catch (error: any) {
      console.error("Authentication error:", error)
      
      if (error.code === 4001) {
        toast({
          title: "Authentication Cancelled",
          description: "You cancelled the signature request.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Authentication Failed",
          description: error.message || "Failed to authenticate wallet",
          variant: "destructive",
        })
      }
      
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }

  const connect = async () => {
    if (!isMetaMaskAvailable()) {
      setError("MetaMask is not installed. Please install MetaMask to connect your wallet.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      console.log("Requesting accounts from MetaMask...")
      
      const accounts = await window.ethereum!.request({ method: "eth_requestAccounts" })
      console.log("MetaMask accounts:", accounts)

      if (accounts.length > 0) {
        const walletAddress = accounts[0]
        setAddress(walletAddress)
        setIsConnected(true)
        
        // Authenticate the wallet
        const authenticated = await authenticateWallet(walletAddress)
        
        if (!authenticated) {
          // If authentication fails, still connected but not authenticated
          console.log("Wallet connected but not authenticated")
          setIsAuthenticated(false)
          setAuthSession(null)
        }
      } else {
        setError("No accounts returned from MetaMask. Please check your wallet.")
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      
      if (err.code === 4001) {
        setError("Connection rejected. Please approve the connection in MetaMask.")
      } else if (err.code === -32002) {
        setError("MetaMask is already processing a request. Please check MetaMask.")
      } else {
        setError(`Failed to connect wallet: ${err.message || "Unknown error"}`)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const refreshSession = async () => {
    if (!authSession) return
    
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: authSession.refreshToken }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to refresh session")
      }
      
      const data = await response.json()
      
      const newSession: AuthSession = {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        walletAddress: authSession.walletAddress,
      }
      
      setAuthSession(newSession)
      sessionStorage.setItem("authSession", JSON.stringify(newSession))
      
      toast({
        title: "Session Refreshed",
        description: "Your authentication session has been extended.",
      })
    } catch (error) {
      console.error("Failed to refresh session:", error)
      // Retry once before giving up
      try {
        const retryResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: authSession.refreshToken }),
        })
        if (retryResponse.ok) {
          const retryData = await retryResponse.json()
          const retrySession: AuthSession = {
            token: retryData.token,
            refreshToken: retryData.refreshToken,
            expiresAt: retryData.expiresAt,
            walletAddress: authSession.walletAddress,
          }
          setAuthSession(retrySession)
          sessionStorage.setItem("authSession", JSON.stringify(retrySession))
          return
        }
      } catch {
        // Retry also failed
      }
      // Both attempts failed — disconnect
      disconnect()
      toast({
        title: "Session Expired",
        description: "Please reconnect your wallet to continue.",
        variant: "destructive",
      })
    }
  }

  // Session expiry timer - must be declared before any conditional returns
  const [sessionExpiresIn, setSessionExpiresIn] = useState<number | null>(null)

  const disconnect = () => {
    console.log("Disconnecting wallet...")
    setAddress(null)
    setIsConnected(false)
    setIsAuthenticated(false)
    setAuthSession(null)
    setCurrentWalletAddress(null)
    sessionStorage.removeItem("walletAddress")
    sessionStorage.removeItem("authSession")
    console.log("Wallet disconnected, auth session cleared")

    // State is already cleared above — no reload needed
  }

  // Session expiry monitoring effect - must be declared before conditional returns
  useEffect(() => {
    if (!authSession) {
      setSessionExpiresIn(null)
      return
    }
    
    const updateExpiryTime = () => {
      const expiresIn = getSessionExpiresIn()
      setSessionExpiresIn(expiresIn)
      
      // Check if session is about to expire (less than 5 minutes)
      if (expiresIn !== null && expiresIn > 0 && expiresIn < 300) {
        toast({
          title: "Session Expiring Soon",
          description: "Your session will expire in less than 5 minutes. Click to refresh.",
          action: (
            <Button size="sm" onClick={refreshSession}>
              Refresh
            </Button>
          ),
        })
      } else if (expiresIn === 0) {
        // Session expired
        disconnect()
        toast({
          title: "Session Expired",
          description: "Please reconnect your wallet to continue.",
          variant: "destructive",
        })
      }
    }
    
    updateExpiryTime()
    const interval = setInterval(updateExpiryTime, 1000)

    return () => clearInterval(interval)
  }, [authSession, refreshSession, toast])

  // Don't render anything on the server
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        isAuthenticated,
        isAuthenticating,
        authSession,
        sessionExpiresIn,
        connect,
        disconnect,
        error,
        refreshSession,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
