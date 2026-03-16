import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@/components/wallet/wallet-provider"

interface UsageData {
  aiMessages: { used: number; limit: number }
  summaries: { used: number; limit: number }
  tokens: { used: number; limit: number }
  resetTime?: string
}

interface UsageTrackingHook {
  usage: UsageData
  updateUsage: (headers: Headers) => void
  isNearLimit: (type: keyof UsageData) => boolean
  getWarningMessage: () => string | null
  canUseFeature: (type: 'messages' | 'summaries') => boolean
  refreshUsage: () => Promise<void>
}

export function useUsageTracking(): UsageTrackingHook {
  const { address } = useWallet()
  const [usage, setUsage] = useState<UsageData>({
    aiMessages: { used: 0, limit: 20 },
    summaries: { used: 0, limit: 5 },
    tokens: { used: 0, limit: 50000 },
    resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
  })

  const updateUsage = useCallback((headers: Headers) => {
    const aiMessages = parseInt(headers.get('X-Daily-Remaining-AI-Messages') || '20')
    const summaries = parseInt(headers.get('X-Daily-Remaining-Summaries') || '5')
    const tokens = parseInt(headers.get('X-Daily-Remaining-Tokens') || '50000')
    const resetTime = headers.get('X-Daily-Reset')

    setUsage(prev => ({
      aiMessages: { 
        used: prev.aiMessages.limit - aiMessages, 
        limit: prev.aiMessages.limit 
      },
      summaries: { 
        used: prev.summaries.limit - summaries, 
        limit: prev.summaries.limit 
      },
      tokens: { 
        used: prev.tokens.limit - tokens, 
        limit: prev.tokens.limit 
      },
      resetTime: resetTime || prev.resetTime
    }))
  }, [])

  const isNearLimit = useCallback((type: keyof UsageData) => {
    const data = usage[type] as { used: number; limit: number }
    if (!data.limit || data.limit <= 0) return false
    const percentage = (data.used / data.limit) * 100
    return percentage >= 80
  }, [usage])

  const canUseFeature = useCallback((type: 'messages' | 'summaries') => {
    if (type === 'messages') {
      return usage.aiMessages.used < usage.aiMessages.limit
    }
    return usage.summaries.used < usage.summaries.limit
  }, [usage])

  const getWarningMessage = useCallback(() => {
    const messagesPercentage = usage.aiMessages.limit > 0 ? (usage.aiMessages.used / usage.aiMessages.limit) * 100 : 0
    const summariesPercentage = usage.summaries.limit > 0 ? (usage.summaries.used / usage.summaries.limit) * 100 : 0
    const tokensPercentage = usage.tokens.limit > 0 ? (usage.tokens.used / usage.tokens.limit) * 100 : 0

    if (messagesPercentage >= 95) {
      return `You've used ${usage.aiMessages.used}/${usage.aiMessages.limit} daily messages. Consider switching to Llama models (free).`
    }
    
    if (messagesPercentage >= 80) {
      return `You've used ${Math.round(messagesPercentage)}% of your daily messages. Plan your remaining conversations wisely.`
    }

    if (summariesPercentage >= 90) {
      return `You've used ${usage.summaries.used}/${usage.summaries.limit} daily summaries.`
    }

    if (tokensPercentage >= 80) {
      return "High token usage detected. Try shorter messages or simpler queries."
    }

    return null
  }, [usage])

  const refreshUsage = useCallback(async () => {
    if (!address) return

    try {
      // Make a lightweight request to get current usage
      const response = await fetch('/api/usage-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      })

      if (response.ok) {
        updateUsage(response.headers)
      }
    } catch (error) {
      console.error('Failed to refresh usage:', error)
    }
  }, [address, updateUsage])

  // Refresh usage on wallet change or component mount
  useEffect(() => {
    if (address) {
      refreshUsage()
    }
  }, [address, refreshUsage])

  // Auto-refresh usage every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshUsage, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshUsage])

  return {
    usage,
    updateUsage,
    isNearLimit,
    getWarningMessage,
    canUseFeature,
    refreshUsage
  }
} 