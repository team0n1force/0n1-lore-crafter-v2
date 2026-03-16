import { NextRequest, NextResponse } from "next/server"
import { checkOwnershipRateLimit, createRateLimitResponse } from '@/lib/rate-limit'
import { storeSoul } from '@/lib/storage'
import { withOptionalAuth, getRequestWalletAddress } from '@/lib/auth-middleware'

export const POST = withOptionalAuth(async (request: NextRequest, sessionInfo) => {
  // Check rate limit first
  const rateLimitResult = checkOwnershipRateLimit(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, "migration"),
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }

  try {
    // Try to get wallet address from authentication first, then fallback to body parameter
    let walletAddress = await getRequestWalletAddress(request, sessionInfo)
    let characterData = null
    
    // If not authenticated, try to get from request body (legacy mode)
    if (!walletAddress) {
      const body = await request.json()
      walletAddress = body.walletAddress
      characterData = body.characterData
    } else {
      // If authenticated, get character data from body
      const body = await request.json()
      characterData = body.characterData
    }

    // Input validation
    if (!walletAddress) {
      return NextResponse.json(
        { 
          error: "Authentication required",
          message: "Please authenticate with your wallet or provide a valid walletAddress in request body",
          authenticationUrl: '/api/auth/challenge'
        }, 
        { status: 400 }
      )
    }

    console.log(`🔐 Migration - Authentication status: ${sessionInfo.isAuthenticated ? 'AUTHENTICATED' : 'LEGACY_MODE'}`)
    console.log(`📦 Migrating data for wallet: ${walletAddress}`)

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" }, 
        { status: 400 }
      )
    }

    // If specific character data is provided, migrate just that character
    if (characterData) {
      // Migrate single character
      const soulId = storeSoul(characterData)
      const success = !!soulId
      
      return NextResponse.json({ 
        success,
        migratedCount: success ? 1 : 0,
        message: success ? "Character migrated successfully" : "Failed to migrate character",
        authenticated: sessionInfo.isAuthenticated,
        walletAddress
      })
    }

    // For bulk migration, we would need to implement localStorage reading
    // For now, return an error since we can't access localStorage server-side
      return NextResponse.json({
        success: false,
      error: "Bulk migration not supported server-side. Please migrate characters individually from the client."
    }, { status: 400 })

  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Migration failed", 
        message: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}) 