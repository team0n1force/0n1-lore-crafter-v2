"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DebugSupabasePage() {
  const router = useRouter()
  const [connectionStatus, setConnectionStatus] = useState<any>({})
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkSupabaseConfig()
  }, [])

  const checkSupabaseConfig = () => {
    // Get env vars directly to debug
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Debug env check:', { url, anonKey: anonKey ? 'Found' : 'Not found', supabase: !!supabase })
    
    const status = {
      supabaseClient: supabase ? "✅ Initialized" : "❌ Not initialized",
      url: url || "❌ Not found",
      anonKey: anonKey ? "✅ Found" : "❌ Not found",
      urlValid: url && !url.includes('placeholder') ? "✅ Valid" : "❌ Invalid or placeholder",
    }
    setConnectionStatus(status)
  }

  const testSupabaseConnection = async () => {
    setLoading(true)
    setTestResult("")
    
    try {
      if (!supabase) {
        setTestResult("❌ Supabase client not initialized. Check environment variables.")
        setLoading(false)
        return
      }

      // Test 1: Basic connection
      const { data: testData, error: testError } = await supabase
        .from('character_souls')
        .select('count')
        .limit(1)
      
      if (testError) {
        setTestResult(`❌ Connection failed: ${testError.message}`)
      } else {
        setTestResult("✅ Successfully connected to Supabase!")
        
        // Test 2: Try to read data
        const { data, error } = await supabase
          .from('character_souls')
          .select('*')
          .limit(5)
        
        if (!error) {
          setTestResult(prev => prev + `\n✅ Can read from database. Found ${data?.length || 0} souls.`)
        } else {
          setTestResult(prev => prev + `\n❌ Read error: ${error.message}`)
        }
      }
    } catch (error: any) {
      setTestResult(`❌ Unexpected error: ${error.message}`)
    }
    
    setLoading(false)
  }

  const testLocalStorage = () => {
    try {
      const souls = localStorage.getItem('oni-souls')
      if (souls) {
        const parsed = JSON.parse(souls)
        setTestResult(`✅ Found ${parsed.length} souls in localStorage`)
      } else {
        setTestResult("❌ No souls found in localStorage")
      }
    } catch (error: any) {
      setTestResult(`❌ Error reading localStorage: ${error.message}`)
    }
  }

  const manualMigrate = async () => {
    setLoading(true)
    setTestResult("🔄 Starting manual migration...")
    
    try {
      // Get localStorage souls first
      const souls = localStorage.getItem('oni-souls')
      if (!souls) {
        setTestResult("❌ No souls found in localStorage to migrate")
        setLoading(false)
        return
      }
      
      const parsed = JSON.parse(souls)
      setTestResult(`🔄 Found ${parsed.length} souls. Starting migration...`)
      
      // Try individual soul migrations via API
      let successCount = 0
      let errors: string[] = []
      
             // Try to get wallet address from auth session first
       let walletAddress = null
       try {
         const authResponse = await fetch('/api/auth/status')
         if (authResponse.ok) {
           const authData = await authResponse.json()
           walletAddress = authData.walletAddress
         }
       } catch (error) {
         console.log('No auth session found, using fallback address')
       }
       
       if (!walletAddress) {
         walletAddress = '0x0000000000000000000000000000000000000000' // fallback
       }
       
       setTestResult(`🔄 Found ${parsed.length} souls. Using wallet: ${walletAddress}. Starting migration...`)
       
       for (const soul of parsed) {
         try {
           const response = await fetch('/api/migrate-to-supabase', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               characterData: soul.data,
               walletAddress: walletAddress
             })
           })
           
           const result = await response.json()
           if (result.success) {
             successCount++
           } else {
             errors.push(`Soul ${soul.id}: ${result.error}`)
           }
         } catch (error: any) {
           errors.push(`Soul ${soul.id}: ${error.message}`)
         }
       }
      
      if (successCount > 0) {
        setTestResult(`✅ Migration completed! ${successCount}/${parsed.length} souls migrated successfully.${errors.length > 0 ? `\n\nErrors: ${errors.join('\n')}` : ''}`)
      } else {
        setTestResult(`❌ Migration failed for all souls:\n${errors.join('\n')}`)
      }
      
    } catch (error: any) {
      setTestResult(`❌ Migration error: ${error.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold text-white">Supabase Debug</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Supabase Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <p>Client Status: {connectionStatus.supabaseClient}</p>
              <p>URL: {connectionStatus.url}</p>
              <p>URL Valid: {connectionStatus.urlValid}</p>
              <p>Anon Key: {connectionStatus.anonKey}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connection Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-x-4">
                <Button 
                  onClick={testSupabaseConnection}
                  disabled={loading}
                >
                  {loading ? "Testing..." : "Test Supabase Connection"}
                </Button>
                <Button 
                  onClick={testLocalStorage}
                  variant="secondary"
                >
                  Check localStorage
                </Button>
                <Button 
                  onClick={manualMigrate}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Migrating..." : "Migrate to Supabase"}
                </Button>
              </div>
              
              {testResult && (
                <pre className="mt-4 p-4 bg-black/50 rounded text-sm whitespace-pre-wrap">
                  {testResult}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Environment variables not loaded in production</li>
              <li>Supabase URL contains 'placeholder' text</li>
              <li>RLS policies blocking access</li>
              <li>CORS issues (check Supabase dashboard)</li>
              <li>Invalid anon key format</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 