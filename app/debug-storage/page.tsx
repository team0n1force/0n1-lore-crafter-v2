"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DebugStoragePage() {
  const router = useRouter()
  const [storageData, setStorageData] = useState<any>(null)
  const [localStorageData, setLocalStorageData] = useState<any>(null)

  useEffect(() => {
    loadStorageData()
    // Listen for storage changes
    window.addEventListener("storage", loadStorageData)
    window.addEventListener("soul-storage-updated", loadStorageData)
    
    return () => {
      window.removeEventListener("storage", loadStorageData)
      window.removeEventListener("soul-storage-updated", loadStorageData)
    }
  }, [])

  const loadStorageData = () => {
    // Get localStorage data
    const rawSouls = localStorage.getItem("oni-souls")
    const souls = rawSouls ? JSON.parse(rawSouls) : []
    
    // Get other relevant storage items
            const walletAddress = sessionStorage.getItem("oni-wallet-address")
    const lastSync = localStorage.getItem("oni-souls-last-sync")
    
    setLocalStorageData({
      souls,
      soulCount: souls.length,
      walletAddress,
      lastSync: lastSync ? new Date(parseInt(lastSync)).toLocaleString() : "Never",
      allKeys: Object.keys(localStorage).filter(key => key.startsWith("oni-"))
    })

    // Create a summary of souls
    const summary = souls.map((soul: any) => ({
      id: soul.id,
      pfpId: soul.data?.pfpId || "Unknown",
      soulName: soul.data?.soulName || "Unnamed",
      archetype: soul.data?.archetype || "No archetype",
      createdAt: new Date(soul.createdAt).toLocaleString(),
      lastUpdated: new Date(soul.lastUpdated).toLocaleString()
    }))

    setStorageData(summary)
  }

  const clearAllSouls = () => {
    if (confirm("Are you sure you want to clear ALL souls from localStorage? This cannot be undone!")) {
      localStorage.removeItem("oni-souls")
      window.dispatchEvent(new Event("storage"))
      window.dispatchEvent(new CustomEvent("soul-storage-updated", { detail: { cleared: true } }))
      loadStorageData()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/souls")}
              variant="ghost"
              size="icon"
              className="text-purple-300 hover:text-purple-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Debug Storage
            </h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadStorageData} variant="outline">
              Refresh
            </Button>
            <Button onClick={clearAllSouls} variant="destructive">
              Clear All Souls
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Storage Summary */}
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Storage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Total Souls:</strong> {localStorageData?.soulCount || 0}</div>
              <div><strong>Wallet Address:</strong> {localStorageData?.walletAddress || "Not set"}</div>
              <div><strong>Last Sync:</strong> {localStorageData?.lastSync || "Never"}</div>
              <div><strong>Storage Keys:</strong> {localStorageData?.allKeys?.join(", ") || "None"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Souls List */}
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Stored Souls ({storageData?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {storageData && storageData.length > 0 ? (
              <div className="space-y-4">
                {storageData.map((soul: any, index: number) => (
                  <div key={soul.id || index} className="p-4 border border-purple-500/20 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>ID:</strong> {soul.id}</div>
                      <div><strong>NFT ID:</strong> #{soul.pfpId}</div>
                      <div><strong>Name:</strong> {soul.soulName}</div>
                      <div><strong>Archetype:</strong> {soul.archetype}</div>
                      <div><strong>Created:</strong> {soul.createdAt}</div>
                      <div><strong>Updated:</strong> {soul.lastUpdated}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No souls found in localStorage</p>
            )}
          </CardContent>
        </Card>

        {/* Raw Data */}
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Raw localStorage Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto p-4 bg-black/40 rounded">
              {JSON.stringify(localStorageData?.souls || [], null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 