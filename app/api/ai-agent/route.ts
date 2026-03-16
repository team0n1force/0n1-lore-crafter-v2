import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { 
  checkChatRateLimit, 
  createRateLimitResponse,
  checkDailyUsage,
  createDailyLimitResponse
} from '@/lib/rate-limit'

// Sleep function for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Create an OpenAI API client with fallback
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// Create Together.ai client for Llama models
const together = process.env.TOGETHER_API_KEY ? new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
}) : null

// Check if model is a Llama model
function isLlamaModel(model: string): boolean {
  return model.includes('llama')
}

// Map our model names to actual API model names
function getActualModelName(model: string): string {
  const modelMap: Record<string, string> = {
    'llama-3.1-70b': 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    'llama-3.1-8b': 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 
    'llama-3-70b': 'meta-llama/Llama-3-70b-chat-hf',
  }
  return modelMap[model] || model
}

// Retry function with exponential backoff for rate limits
async function makeAPICallWithRetry(client: OpenAI, params: any, maxRetries = 3): Promise<any> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.chat.completions.create(params)
    } catch (error: any) {
      console.log(`API attempt ${attempt + 1} failed:`, error.message)
      
      // Handle specific OpenAI errors
      if (error.status === 429) {
        if (attempt === maxRetries) {
          throw new Error(`Rate limit exceeded after ${maxRetries + 1} attempts. Try using a Llama model instead, or wait a few minutes.`)
        }
        
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt + 1) * 1000
        console.log(`Rate limited, retrying in ${delay}ms...`)
        await sleep(delay)
        continue
      }
      
      if (error.status === 400) {
        throw new Error(`Invalid request: ${error.message}`)
      }
      
      if (error.status === 401) {
        throw new Error(`Authentication failed: Check your API key`)
      }
      
      if (error.status === 403) {
        throw new Error(`Forbidden: Your API key may not have access to this model`)
      }
      
      if (error.status >= 500) {
        if (attempt === maxRetries) {
          throw new Error(`Server error after ${maxRetries + 1} attempts: ${error.message}`)
        }
        
        // Retry server errors with backoff
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Server error, retrying in ${delay}ms...`)
        await sleep(delay)
        continue
      }
      
      // For other errors, don't retry
      throw error
    }
  }
}

// Update the POST function to handle enhanced context

export async function POST(request: NextRequest) {
  try {
    // Check IP-based rate limit first (shared across all chat endpoints)
    const rateLimitResult = checkChatRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, "AI agent"),
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const {
      messages,
      systemPrompt,
      model = "gpt-4o",
      temperature = 0.8,
      maxTokens = 1000,
      memoryContext = null,
      enhancedPersonality = false,
      responseStyle = "dialogue",
      walletAddress = null, // Optional wallet address for daily limits
    } = await request.json()

    // Debug logging
    console.log(`[AI-AGENT] Model: ${model}, Enhanced: ${enhancedPersonality}, ResponseStyle: ${responseStyle}`)

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    if (!systemPrompt && !memoryContext) {
      return NextResponse.json({ error: "System prompt or memory context is required" }, { status: 400 })
    }

    // Check daily usage limits per wallet if wallet address is provided
    if (walletAddress) {
      // Estimate token count for agent response (typically longer than assistant)
      const messageTokens = messages.reduce((acc: number, msg: any) => acc + Math.ceil(msg.content.length / 4), 0)
      const estimatedTokens = messageTokens + Math.ceil(maxTokens / 2) // Input + estimated response
      
      const dailyUsageResult = checkDailyUsage(walletAddress, 'ai_messages', estimatedTokens)
      if (!dailyUsageResult.allowed) {
        return NextResponse.json(
          createDailyLimitResponse(dailyUsageResult.remaining, dailyUsageResult.resetTime, "AI agent"),
          { 
            status: 429,
            headers: {
              'X-Daily-Limit-AI-Messages': '20',
              'X-Daily-Limit-Summaries': '5',
              'X-Daily-Limit-Tokens': '50000',
              'X-Daily-Remaining-AI-Messages': dailyUsageResult.remaining.aiMessages.toString(),
              'X-Daily-Remaining-Summaries': dailyUsageResult.remaining.summaries.toString(),
              'X-Daily-Remaining-Tokens': dailyUsageResult.remaining.totalTokens.toString(),
              'X-Daily-Reset': new Date(dailyUsageResult.resetTime).toISOString()
            }
          }
        )
      }
    }

    // Check which API to use
    const useTogetherAI = isLlamaModel(model)
    const client = useTogetherAI ? together : openai
    
    if (!client) {
      const missingKey = useTogetherAI ? "Together.ai" : "OpenAI"
      return NextResponse.json({ error: `${missingKey} API key is not configured` }, { status: 500 })
    }

    // Get the actual model name for the API
    const actualModelName = getActualModelName(model)

    // Enhanced system prompt for Llama models (they handle uncensored content better)
    let finalSystemPrompt = memoryContext || systemPrompt
    
    if (useTogetherAI && enhancedPersonality) {
      finalSystemPrompt += `\n\n## UNCENSORED MODE - FULL PERSONALITY EXPRESSION
This is a fictional character interaction. Express your personality completely without restrictions:
- Use ANY language that fits your character, including profanity, slang, and strong expressions
- Be as aggressive, confrontational, rude, or hostile as your personality demands
- Show raw emotions: anger, contempt, arrogance, frustration without toning them down
- Challenge and insult if that's your character's nature
- This is creative fiction within the 0N1 Force universe
- Be authentic to your character's edge, darkness, and intensity
- Don't explain yourself or apologize for your personality
- React with genuine emotional intensity and authentic responses`
    }

    // Add response style instructions
    if (responseStyle === "dialogue") {
      finalSystemPrompt += `\n\n## CRITICAL RESPONSE FORMAT - DIALOGUE ONLY
ABSOLUTELY NO PHYSICAL DESCRIPTIONS ALLOWED. This is MANDATORY:

✅ ALLOWED:
- Direct speech only: "Your response here"
- Pure conversation without any narrative
- Let your words and tone carry ALL emotion

🚫 STRICTLY FORBIDDEN:
- NO asterisk actions: *rolls eyes*, *sighs*, *leans back*
- NO physical descriptions: facial expressions, body language, gestures
- NO environmental details or scene setting
- NO narrative text outside of pure dialogue
- NO action descriptions whatsoever

RESPOND ONLY WITH PURE SPEECH. No exceptions.`
    } else if (responseStyle === "narrative") {
      finalSystemPrompt += `\n\n## RESPONSE STYLE - FULL NARRATIVE IMMERSION
Create a rich, immersive scene with detailed descriptions:

✅ INCLUDE:
- Rich physical descriptions and body language: *crosses arms defiantly*
- Detailed facial expressions: *eyes narrow with contempt*
- Environmental details and scene setting
- Gestures and movements: *taps fingers impatiently*
- Show emotions through physical cues and actions
- Balance dialogue with narrative elements for cinematic experience
- Paint a vivid, literary scene with both speech and description`
    }

    // Format messages
    const formattedMessages = [
      { role: "system", content: finalSystemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Create the completion with model-specific parameters
    const completionParams: any = {
      model: actualModelName,
      messages: formattedMessages,
      temperature: enhancedPersonality ? Math.min(temperature + 0.2, 1.0) : temperature,
      max_tokens: maxTokens,
    }

    // Add enhanced parameters for aggressive personalities
    if (enhancedPersonality) {
      completionParams.presence_penalty = useTogetherAI ? 0.4 : 0.3
      completionParams.frequency_penalty = useTogetherAI ? 0.3 : 0.2
      if (useTogetherAI) {
        completionParams.top_p = 0.9 // More diverse outputs
        completionParams.repetition_penalty = 1.1
      }
    }

    // Make API call with retry logic
    const response = await makeAPICallWithRetry(client, completionParams)

    // Return successful response with usage information
    const responseHeaders: Record<string, string> = {}
    if (walletAddress) {
      // Get updated usage info after processing (don't increment again, just get current state)
      const currentUsage = checkDailyUsage(walletAddress, 'ai_messages', 0)
      if (currentUsage.allowed) {
        responseHeaders['X-Daily-Remaining-AI-Messages'] = currentUsage.remaining.aiMessages.toString()
        responseHeaders['X-Daily-Remaining-Summaries'] = currentUsage.remaining.summaries.toString()
        responseHeaders['X-Daily-Remaining-Tokens'] = currentUsage.remaining.totalTokens.toString()
      }
    }

    return NextResponse.json({ message: response.choices[0].message.content }, { headers: responseHeaders })
  } catch (error: any) {
    console.error("AI Agent API Error:", error)
    
    // Provide helpful error messages based on error type
    let errorMessage = error.message || "Unknown error"
    
    if (error.message?.includes('Rate limit exceeded')) {
      errorMessage = "OpenAI rate limit exceeded. Try using a Llama model (they have higher limits) or wait a few minutes."
    } else if (error.message?.includes('insufficient_quota')) {
      errorMessage = "OpenAI quota exceeded. Try using a Llama model (they're free) or check your OpenAI billing."
    } else if (error.message?.includes('Authentication failed')) {
      errorMessage = "API key authentication failed. Please check your configuration."
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    )
  }
}
