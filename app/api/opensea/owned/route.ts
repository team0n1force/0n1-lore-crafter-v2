import { NextRequest, NextResponse } from "next/server"
import { checkOpenSeaRateLimitEnhanced, createRateLimitResponse } from '@/lib/rate-limit'
import { COLLECTIONS, CollectionKey, getAllCollectionKeys } from '@/lib/collection-config'
import { UnifiedCharacter, UnifiedCharacterResponse } from '@/lib/types'
import { withOptionalAuth, getRequestWalletAddress } from '@/lib/auth-middleware'

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY

// Check if OpenSea API is properly configured
function isOpenSeaConfigured(): boolean {
  const isConfigured = !!OPENSEA_API_KEY && OPENSEA_API_KEY !== 'your_opensea_api_key_here'
  console.log(`🔑 OpenSea API Key Status:`, {
    exists: !!OPENSEA_API_KEY,
    length: OPENSEA_API_KEY ? OPENSEA_API_KEY.length : 0,
    startsWithCorrectPrefix: OPENSEA_API_KEY ? OPENSEA_API_KEY.substring(0, 4) : 'N/A',
    isPlaceholder: OPENSEA_API_KEY === 'your_opensea_api_key_here',
    isConfigured
  })
  return isConfigured
}

// Helper function to normalize NFT data from different OpenSea response formats
function normalizeNftData(nft: any): any {
  // Handle different contract formats
  let contractAddress = '';
  if (typeof nft.contract === 'string') {
    contractAddress = nft.contract;
  } else if (nft.contract?.address) {
    contractAddress = nft.contract.address;
  } else if (nft.asset_contract?.address) {
    contractAddress = nft.asset_contract.address;
  }

  // Handle different identifier formats
  const identifier = nft.identifier || nft.token_id || nft.tokenId || '';

  // Handle different image URL formats
  const imageUrl = nft.image_url || nft.image || nft.image_original_url || nft.image_preview_url || '';

  // Handle different name formats
  const name = nft.name || nft.collection?.name || `Token #${identifier}`;

  return {
    identifier,
    contract: contractAddress,
    image_url: imageUrl,
    name,
    // Preserve original data for debugging
    _original: nft
  };
}

async function fetchCollectionNfts(address: string, collection: CollectionKey): Promise<any[]> {
  const config = COLLECTIONS[collection]
  // Use contract address instead of collection slug for more reliable results
  const params = new URLSearchParams({
    asset_contract_address: config.contractAddress,
    limit: '50'
  })
  const url = `https://api.opensea.io/api/v2/chain/ethereum/account/${encodeURIComponent(address)}/nfts?${params.toString()}`
  
  console.log(`Fetching ${config.displayName} NFTs: ${url}`)
  
  const response = await fetch(url, {
    headers: {
      'X-API-KEY': OPENSEA_API_KEY || '',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`❌ Failed to fetch ${config.displayName} NFTs:`, {
      status: response.status,
      statusText: response.statusText,
      errorBody: errorBody.substring(0, 200), // First 200 chars of error
      headers: {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
      }
    })
    
    // If rate limited, throw specific error
    if (response.status === 429) {
      throw new Error(`Rate limited by OpenSea. Try again later.`)
    }
    
    // For other errors, log but don't throw - return empty array
    console.warn(`⚠️ Returning empty array for ${config.displayName} due to API error`)
    return []
  }

  const data = await response.json()
  const rawNfts = data.nfts || data.assets || [] // Handle different response formats
  
  // Normalize NFT data
  const nfts = rawNfts.map(normalizeNftData)
  
  console.log(`Found ${nfts.length} ${config.displayName} NFTs`)
  console.log(`${config.displayName} NFT IDs:`, nfts.map((nft: any) => nft.identifier))
  console.log(`${config.displayName} detailed data:`, nfts.map((nft: any) => ({
    identifier: nft.identifier,
    name: nft.name,
    image_url: nft.image_url,
    contract: nft.contract
  })))
  
  return nfts
}

// New function to fetch Frame NFT by specific token ID
async function fetchFrameNftByTokenId(tokenId: string): Promise<any | null> {
  const frameContract = COLLECTIONS['frame' as CollectionKey].contractAddress
  const url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${frameContract}/nfts/${tokenId}`
  
  console.log(`🎯 Fetching Frame NFT #${tokenId} directly: ${url}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': OPENSEA_API_KEY || '',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.log(`❌ Frame NFT #${tokenId} fetch failed:`, {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorBody.substring(0, 200)
      })
      
      // Don't throw error, just return null so Force NFT still shows up
      return null
    }

    const data = await response.json()
    const nft = data.nft
    
    if (nft) {
      console.log(`✅ Found Frame NFT #${tokenId}:`, {
        identifier: nft.identifier,
        name: nft.name,
        image_url: nft.image_url,
        contract: nft.contract,
        owners: nft.owners?.map((o: any) => o.address)
      })
      return nft
    }
    
    return null
  } catch (error) {
    console.log(`❌ Error fetching Frame NFT #${tokenId}:`, error)
    // Don't throw - return null so we don't block Force NFT display
    return null
  }
}

// Helper function to validate NFT has required properties
function isValidNft(nft: any): boolean {
  // Make validation less strict - only require identifier and contract
  return nft && 
         nft.identifier && 
         nft.contract
}

export const GET = withOptionalAuth(async (req: NextRequest, sessionInfo) => {
  console.log(`🚀 UNIFIED CHARACTERS API CALLED: ${new Date().toISOString()}`)

  // Get wallet address from authentication (secure) or legacy parameter (backward compatibility)
  const walletAddress = await getRequestWalletAddress(req, sessionInfo)

  if (!walletAddress) {
    return NextResponse.json({ 
      error: 'Authentication required',
      message: 'Please authenticate with your wallet or provide a valid address parameter',
      authenticationUrl: '/api/auth/challenge'
    }, { status: 401 })
  }

  console.log(`Fetching unified characters for address ${walletAddress}`)
  console.log(`🔐 Authentication status: ${sessionInfo.isAuthenticated ? 'AUTHENTICATED' : 'LEGACY_MODE'}`)

  // Apply enhanced rate limits for authenticated users
  const isAuthenticated = sessionInfo.isAuthenticated
  const rateLimitResult = checkOpenSeaRateLimitEnhanced(req, isAuthenticated)
  if (!rateLimitResult.allowed) {
    const limit = isAuthenticated ? '100' : '30' // Enhanced limits for authenticated users
    return NextResponse.json(
      createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, "OpenSea"),
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit,
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'X-RateLimit-Authenticated': isAuthenticated.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }

  try {
    // Log API configuration status but don't block
    console.log('🔐 OpenSea API Configuration:', {
      keyExists: !!OPENSEA_API_KEY,
      keyLength: OPENSEA_API_KEY ? OPENSEA_API_KEY.length : 0,
      timestamp: new Date().toISOString()
    })

    // First, fetch Force NFTs (these work reliably)
    const forceNfts = await fetchCollectionNfts(walletAddress, 'force' as CollectionKey)

    // Validate and filter Force NFTs by correct contract addresses
    const validForceNfts = forceNfts.filter(nft => {
      const config = COLLECTIONS['force' as CollectionKey]
      const isValid = isValidNft(nft)
      
      // Normalize contract addresses for comparison
      const expectedContract = config.contractAddress.toLowerCase()
      const actualContract = nft.contract?.toLowerCase() || ''
      
      // Also check if it's a string or object with address property
      const contractAddress = typeof nft.contract === 'string' 
        ? nft.contract.toLowerCase() 
        : nft.contract?.address?.toLowerCase() || ''
      
      const hasCorrectContract = actualContract === expectedContract || contractAddress === expectedContract
      
      if (!isValid) {
        console.log(`🚫 REJECTED 0N1 Force NFT #${nft.identifier} - Invalid NFT data`)
        return false
      }
      
      if (!hasCorrectContract) {
        console.log(`🚫 REJECTED 0N1 Force NFT #${nft.identifier} - Wrong contract!`)
        console.log(`   Expected: ${expectedContract}`)
        console.log(`   Got (actual): ${actualContract}`)
        console.log(`   Got (address): ${contractAddress}`)
        console.log(`   Raw contract data:`, nft.contract)
        return false
      }
      
      console.log(`✅ ACCEPTED 0N1 Force NFT #${nft.identifier} - Correct contract: ${actualContract}`)
      return true
    })

    console.log(`📋 Contract validation: Kept ${validForceNfts.length}/${forceNfts.length} 0N1 Force NFTs`)

    // Now, for each Force NFT, try to fetch the corresponding Frame NFT
    console.log(`🎯 Checking for Frame NFTs corresponding to Force NFTs...`)
    const frameNftPromises = validForceNfts.map(forceNft => 
      fetchFrameNftByTokenId(forceNft.identifier)
    )
    
    const frameNftResults = await Promise.allSettled(frameNftPromises)
    const validFrameNfts = frameNftResults
      .map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const frameNft = result.value
          const tokenId = validForceNfts[index].identifier
          
          // Verify the user owns this Frame NFT
          const userOwnsFrame = frameNft.owners?.some((owner: any) => 
            owner.address?.toLowerCase() === walletAddress.toLowerCase()
          )
          
          if (userOwnsFrame) {
            console.log(`✅ User owns Frame NFT #${tokenId}`)
            return frameNft
          } else {
            console.log(`❌ User does not own Frame NFT #${tokenId}`)
            return null
          }
        }
        return null
      })
      .filter(Boolean)

    console.log(`📋 Found ${validFrameNfts.length} owned Frame NFTs`)

    console.log(`Filtered to ${validForceNfts.length} valid Force NFTs and ${validFrameNfts.length} valid Frame NFTs`)

    // Create a more detailed log of what we have
    console.log('✅ Valid Force NFTs after all filtering:', validForceNfts.map(nft => ({
      id: nft.identifier,
      name: nft.name,
      contract: nft.contract,
      hasImage: !!nft.image_url
    })))

    console.log('✅ Valid Frame NFTs after all filtering:', validFrameNfts.map(nft => ({
      id: nft.identifier,
      name: nft.name,
      contract: nft.contract,
      hasImage: !!nft.image_url
    })))

    // Create maps for easier lookup
    const forceMap = new Map(validForceNfts.map(nft => [nft.identifier, nft]))
    const frameMap = new Map(validFrameNfts.map(nft => [nft.identifier, nft]))

    // Create unified characters - only include if user actually owns the NFT
    const characterMap = new Map<string, UnifiedCharacter>()

    console.log('✅ Creating unified characters with proper Force/Frame ownership validation')
    console.log(`🔥 Processing Force NFTs: ${Array.from(forceMap.keys()).map(id => ({ id, contract: forceMap.get(id)?.contract }))}`)
    console.log(`🔥 Processing Frame NFTs: ${Array.from(frameMap.keys()).map(id => ({ id, contract: frameMap.get(id)?.contract }))}`)

    // Process Force NFTs
    for (const [tokenId, forceNft] of forceMap) {
      const hasActualFrame = frameMap.has(tokenId)
      const frameNft = frameMap.get(tokenId)

      console.log(`🔥 Creating unified character for #${tokenId} - Force: ✅, Frame: ${hasActualFrame ? '✅' : '❌'} ${hasActualFrame ? '(owned)' : '(not owned)'}`)

      const character: UnifiedCharacter = {
        tokenId,
        forceImageUrl: forceNft.image_url || null, // Allow null image URLs
        frameImageUrl: hasActualFrame ? (frameNft!.image_url || null) : null,
        hasForce: true,
        hasFrame: hasActualFrame,
        displayName: forceNft.name || `0N1 #${tokenId}` // Fallback for missing names
      }

      console.log('🎯 Adding character to map:', character)
      characterMap.set(tokenId, character)
    }

    // Process Frame NFTs that don't have corresponding Force NFTs
    for (const [tokenId, frameNft] of frameMap) {
      if (!characterMap.has(tokenId)) {
        console.log(`🔥 Creating Frame-only character for #${tokenId} - Force: ❌, Frame: ✅`)
        
        const character: UnifiedCharacter = {
          tokenId,
          forceImageUrl: null,
          frameImageUrl: frameNft.image_url || null, // Allow null image URLs
          hasForce: false,
          hasFrame: true,
          displayName: frameNft.name || `0N1 #${tokenId}` // Fallback for missing names
        }

        characterMap.set(tokenId, character)
      }
    }

    // Include souls data
    console.log('📦 Note: Soul data must be merged client-side (localStorage not available on server)')

    // Log character map contents for debugging
    console.log('📋 Character Map Contents:', Array.from(characterMap.values()).map(char => ({
      id: char.tokenId,
      hasForce: char.hasForce,
      hasFrame: char.hasFrame,
      forceImage: !!char.forceImageUrl,
      frameImage: !!char.frameImageUrl
    })))

    // Convert to array - soul data will be merged on client side
    console.log('🔍 CRITICAL DEBUG: Character map before conversion:')
    console.log(`🔍 Character map size: ${characterMap.size}`)
    console.log(`🔍 Character map keys: ${JSON.stringify(Array.from(characterMap.keys()))}`)
    console.log(`🔍 Character map values (raw): ${JSON.stringify(Array.from(characterMap.values()))}`)

    const characters = Array.from(characterMap.values()).map(char => {
      // Don't check for souls here - client will handle this
      return {
        ...char,
        hasSoul: false, // Will be updated client-side
        soul: null // Will be updated client-side
      }
    })

    console.log(`🔍 Characters array length after conversion: ${characters.length}`)
    console.log(`🔍 Characters array content: ${JSON.stringify(characters)}`)

    console.log(`Created ${characters.length} unified characters`)

    // Final logging
    const validForceCount = characters.filter(c => c.hasForce).length
    const validFrameCount = characters.filter(c => c.hasFrame).length
    console.log(`Valid Force NFTs: ${validForceCount}, Valid Frame NFTs: ${validFrameCount}`)
    console.log(`Safe Force NFTs: ${validForceNfts.length}, Safe Frame NFTs: ${validFrameNfts.length}`)
    console.log(`Raw Force NFTs: ${forceNfts.length}, Raw Frame NFTs: ${validFrameNfts.length}`)

    const response: UnifiedCharacterResponse = {
      characters,
      totalCount: characters.length
    }

    console.log(`🚀 Final response characters count: ${response.characters.length}`)
    console.log(`📊 Character map size: ${characterMap.size}`)
    console.log(`📊 Character map keys: ${JSON.stringify(Array.from(characterMap.keys()))}`)

    if (response.characters.length > 0) {
      console.log(`📊 First character sample: ${JSON.stringify(response.characters[0])}`)
      console.log(`📊 All characters: ${JSON.stringify(response.characters)}`)
    }

    console.log(`📊 Response summary: ${JSON.stringify({ 
      charactersLength: response.characters.length, 
      totalCount: response.totalCount, 
      characterMapSize: characterMap.size 
    })}`)

    console.log(`🔍 Pre-serialization response object: ${JSON.stringify(response)}`)

    // Verify we can serialize the response
    try {
      const serialized = JSON.stringify(response)
      console.log(`🔍 JSON.stringify test successful, length: ${serialized.length}`)
    } catch (serializationError) {
      console.error('❌ JSON serialization failed:', serializationError)
      throw new Error(`Response serialization failed: ${serializationError}`)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ API Error:', error)
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isRateLimit = errorMessage.includes('Rate limited')
    const isAuthError = errorMessage.includes('authentication') || errorMessage.includes('401')
    
    return NextResponse.json({ 
      error: 'Failed to fetch NFTs', 
      details: errorMessage,
      errorType: isRateLimit ? 'RATE_LIMIT' : isAuthError ? 'AUTH_ERROR' : 'API_ERROR',
      characters: [],
      totalCount: 0,
      troubleshooting: {
        checkAuth: isAuthError,
        checkRateLimit: isRateLimit,
        debugUrl: `/api/opensea/debug?address=${walletAddress}`,
        message: 'If assets are missing, try the debug URL to diagnose the issue'
      }
    }, { status: isRateLimit ? 429 : isAuthError ? 401 : 500 })
  }
})