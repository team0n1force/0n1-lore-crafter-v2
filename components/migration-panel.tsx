"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Upload, Database, HardDrive } from "lucide-react"
import { useWallet } from "@/components/wallet/wallet-provider"
import { getLocalStoredSoulsSync } from "@/lib/storage-supabase"

interface MigrationResult {
  success: boolean
  migratedCount: number
  errors?: string[]
  message: string
}

export function MigrationPanel() {
  const { address, isConnected } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [progress, setProgress] = useState(0)

  // Get localStorage data count
  const localSoulsCount = typeof window !== 'undefined' ? getLocalStoredSoulsSync().length : 0

  const handleMigration = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first")
      return
    }

    setIsLoading(true)
    setProgress(0)
    setMigrationResult(null)

    try {
      // Simulate progress
      setProgress(20)

      const response = await fetch('/api/migrate-to-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
        }),
      })

      setProgress(80)

      const result = await response.json()
      setProgress(100)

      if (response.ok) {
        setMigrationResult({
          success: true,
          migratedCount: result.migratedCount,
          message: result.message
        })
      } else {
        setMigrationResult({
          success: false,
          migratedCount: result.migratedCount || 0,
          errors: result.errors,
          message: result.message || result.error || "Migration failed"
        })
      }
    } catch (error) {
      console.error('Migration error:', error)
      setMigrationResult({
        success: false,
        migratedCount: 0,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Migration
          </CardTitle>
          <CardDescription>
            Connect your wallet to migrate your character data to the cloud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your MetaMask wallet to enable data migration
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Migration to Cloud
        </CardTitle>
        <CardDescription>
          Migrate your character data from browser storage to secure cloud storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <HardDrive className="h-5 w-5 text-gray-500" />
            <div>
              <div className="font-medium">Local Storage</div>
              <div className="text-sm text-muted-foreground">
                {localSoulsCount} character{localSoulsCount !== 1 ? 's' : ''}
              </div>
            </div>
            <Badge variant="secondary">{localSoulsCount > 0 ? 'Has Data' : 'Empty'}</Badge>
          </div>
          
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <Database className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-medium">Cloud Storage</div>
              <div className="text-sm text-muted-foreground">
                Secure & Synced
              </div>
            </div>
            <Badge variant="outline">Supabase</Badge>
          </div>
        </div>

        {/* Migration Button */}
        {localSoulsCount > 0 && (
          <div className="space-y-3">
            <Button 
              onClick={handleMigration} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Migrate {localSoulsCount} Character{localSoulsCount !== 1 ? 's' : ''} to Cloud
                </>
              )}
            </Button>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress < 50 ? 'Preparing migration...' : 
                   progress < 90 ? 'Uploading character data...' : 'Finalizing...'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Data State */}
        {localSoulsCount === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No character data found in local storage. Create a character first to enable migration.
            </AlertDescription>
          </Alert>
        )}

        {/* Migration Result */}
        {migrationResult && (
          <Alert variant={migrationResult.success ? "default" : "destructive"}>
            {migrationResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p>{migrationResult.message}</p>
                {migrationResult.errors && migrationResult.errors.length > 0 && (
                  <div>
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {migrationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Benefits */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Benefits of Cloud Storage:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✅ Access characters from any device</li>
            <li>✅ Automatic backups and sync</li>
            <li>✅ Share characters with friends</li>
            <li>✅ No data loss when clearing browser</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 