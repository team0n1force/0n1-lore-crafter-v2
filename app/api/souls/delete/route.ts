import { NextRequest, NextResponse } from 'next/server'
import { withOptionalAuth, getRequestWalletAddress } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

interface DeleteSoulRequest {
  soulId: string
  pfpId: string
  walletAddress?: string // For backward compatibility
}

// Audit log function
async function logDeletionAttempt(
  walletAddress: string,
  soulId: string,
  pfpId: string,
  success: boolean,
  reason?: string
) {
  try {
    if (supabase) {
      await supabase.from('soul_deletion_logs').insert({
        wallet_address: walletAddress,
        soul_id: soulId,
        nft_id: pfpId,
        success,
        reason,
        attempted_at: new Date().toISOString(),
        ip_address: 'masked-for-privacy', // In production, you might want to log this
      })
    }
  } catch (error) {
    console.error('Failed to log deletion attempt:', error)
  }
  
  // Also log to console for immediate visibility
  console.log(`[DELETION AUDIT] ${success ? '✅' : '❌'} Wallet: ${walletAddress}, Soul: ${soulId}, NFT: ${pfpId}, Reason: ${reason || 'N/A'}`)
}

export const POST = withOptionalAuth(async (request: NextRequest, sessionInfo) => {
  try {
    const body: DeleteSoulRequest = await request.json()
    const { soulId, pfpId } = body
    
    // Get wallet address from authentication or request body (backward compatibility)
    const walletAddress = await getRequestWalletAddress(request, sessionInfo)
    
    if (!walletAddress) {
      await logDeletionAttempt('unknown', soulId, pfpId, false, 'No wallet address provided')
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please authenticate with your wallet to delete souls',
          authenticationUrl: '/api/auth/challenge'
        }, 
        { status: 401 }
      )
    }
    
    // Validate input
    if (!soulId || !pfpId) {
      await logDeletionAttempt(walletAddress, soulId || 'unknown', pfpId || 'unknown', false, 'Missing required parameters')
      return NextResponse.json(
        { error: 'Soul ID and NFT ID are required' }, 
        { status: 400 }
      )
    }
    
    console.log(`🗑️ Delete request - Wallet: ${walletAddress}, Soul: ${soulId}, NFT: ${pfpId}`)
    console.log(`🔐 Authentication status: ${sessionInfo.isAuthenticated ? 'AUTHENTICATED' : 'LEGACY_MODE'}`)
    
    // Step 1: Verify NFT ownership
    try {
      const params = new URLSearchParams({
        address: walletAddress,
        tokenId: pfpId
      })
      const ownershipResponse = await fetch(
        `${request.nextUrl.origin}/api/verify-ownership?${params.toString()}`
      )
      
      if (!ownershipResponse.ok) {
        await logDeletionAttempt(walletAddress, soulId, pfpId, false, 'Ownership verification API error')
        return NextResponse.json(
          { error: 'Failed to verify NFT ownership' }, 
          { status: 500 }
        )
      }
      
      const ownershipData = await ownershipResponse.json()
      
      if (!ownershipData.owns) {
        await logDeletionAttempt(walletAddress, soulId, pfpId, false, 'User does not own NFT')
        return NextResponse.json(
          { 
            error: 'Unauthorized',
            message: `You do not own NFT #${pfpId}. Only the NFT owner can delete this soul.`
          }, 
          { status: 403 }
        )
      }
    } catch (error) {
      console.error('Ownership verification error:', error)
      await logDeletionAttempt(walletAddress, soulId, pfpId, false, 'Ownership verification failed')
      return NextResponse.json(
        { error: 'Failed to verify ownership' }, 
        { status: 500 }
      )
    }
    
    // Step 2: If using Supabase, verify soul ownership in database
    if (supabase) {
      try {
        // Check if soul exists and belongs to this wallet
        const { data: soulData, error: fetchError } = await supabase
          .from('character_souls')
          .select('id, wallet_address')
          .eq('id', soulId)
          .eq('nft_id', pfpId)
          .single()
        
        if (fetchError || !soulData) {
          await logDeletionAttempt(walletAddress, soulId, pfpId, false, 'Soul not found in database')
          // Soul might only exist in localStorage, continue with validation
          console.log('Soul not found in Supabase, might be localStorage only')
        } else if (soulData.wallet_address.toLowerCase() !== walletAddress.toLowerCase()) {
          await logDeletionAttempt(walletAddress, soulId, pfpId, false, 'Soul belongs to different wallet')
          return NextResponse.json(
            { 
              error: 'Unauthorized',
              message: 'This soul belongs to a different wallet address.'
            }, 
            { status: 403 }
          )
        }
        
        // Delete from Supabase if it exists there
        if (soulData) {
          const { error: deleteError } = await supabase
            .from('character_souls')
            .delete()
            .eq('id', soulId)
            .eq('wallet_address', walletAddress)
          
          if (deleteError) {
            console.error('Supabase deletion error:', deleteError)
            await logDeletionAttempt(walletAddress, soulId, pfpId, false, 'Database deletion failed')
            return NextResponse.json(
              { error: 'Failed to delete soul from database' }, 
              { status: 500 }
            )
          }
          
          console.log('✅ Soul deleted from Supabase')
        }
      } catch (error) {
        console.error('Supabase operation error:', error)
        // Continue - localStorage deletion might still be valid
      }
    }
    
    // Step 3: Delete associated memories if they exist
    if (supabase) {
      try {
        const { error: memoryDeleteError } = await supabase
          .from('character_memories')
          .delete()
          .eq('character_id', pfpId)
          .eq('wallet_address', walletAddress)
        
        if (memoryDeleteError) {
          console.error('Memory deletion error:', memoryDeleteError)
          // Non-fatal - continue with soul deletion
        } else {
          console.log('✅ Associated memories deleted')
        }
      } catch (error) {
        console.error('Memory deletion error:', error)
      }
    }
    
    // Log successful validation
    await logDeletionAttempt(walletAddress, soulId, pfpId, true, 'Deletion authorized')
    
    // Return success - client can now safely delete from localStorage
    return NextResponse.json({
      success: true,
      message: 'Soul deletion authorized and processed',
      deleted: {
        soulId,
        pfpId,
        database: supabase ? true : false,
        localStorage: 'pending' // Client will handle this
      }
    })
    
  } catch (error) {
    console.error('Soul deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to process deletion request' }, 
      { status: 500 }
    )
  }
}) // Authentication preferred but not required (withOptionalAuth handles this) 