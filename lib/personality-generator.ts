import type { CharacterData, PersonalitySettings } from "./types"

// Generate a deterministic number between 0-100 based on a seed string
function deterministicValue(seed: string, index: number, min: number = 0, max: number = 100): number {
  // Create a simple hash from the seed and index
  let hash = 0
  const str = `${seed}-${index}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Convert to positive number between min and max
  const normalized = Math.abs(hash) % 101 // 0-100
  return Math.floor((normalized / 100) * (max - min) + min)
}

// Generate deterministic selection from array based on seed
function deterministicChoice<T>(seed: string, index: number, array: T[]): T {
  const idx = Math.abs(deterministicValue(seed, index, 0, array.length))
  return array[idx % array.length]
}

// Create deterministic personality settings based on soul NFT ID
export function createDeterministicPersonalitySettings(nftId: string): PersonalitySettings {
  // Use NFT ID as seed for consistent generation
  const seed = nftId || "default"
  
  return {
    // Core Personality Traits (Big 5 + Extensions)
    openness: deterministicValue(seed, 1, 30, 70),
    conscientiousness: deterministicValue(seed, 2, 30, 70),
    extraversion: deterministicValue(seed, 3, 30, 70),
    agreeableness: deterministicValue(seed, 4, 30, 70),
    neuroticism: deterministicValue(seed, 5, 30, 70),
    sarcasmLevel: deterministicValue(seed, 6, 20, 60),
    witHumor: deterministicValue(seed, 7, 30, 70),
    empathy: deterministicValue(seed, 8, 30, 70),
    confidence: deterministicValue(seed, 9, 30, 70),
    impulsiveness: deterministicValue(seed, 10, 30, 70),
    
    // Communication Style Controls
    formalityLevel: deterministicValue(seed, 11, 30, 70),
    verbosity: deterministicValue(seed, 12, 30, 70),
    directness: deterministicValue(seed, 13, 30, 70),
    profanityUsage: deterministicValue(seed, 14, 0, 30),
    technicalLanguage: deterministicValue(seed, 15, 20, 60),
    metaphorUsage: deterministicValue(seed, 16, 30, 70),
    storytellingTendency: deterministicValue(seed, 17, 30, 70),
    
    // Communication Style Dropdowns
    primaryLanguageStyle: deterministicChoice(seed, 18, ['Street Slang', 'Academic', 'Corporate', 'Military', 'Artistic', 'Technical', 'Archaic']),
    sentenceStructure: deterministicChoice(seed, 19, ['Short & Punchy', 'Flowing & Complex', 'Fragmented', 'Poetic', 'Stream of Consciousness']),
    responseSpeedStyle: deterministicChoice(seed, 20, ['Immediate', 'Thoughtful Pauses', 'Delayed', 'Interrupt-Heavy']),
    
    // Psychological Depth
    emotionalVolatility: deterministicValue(seed, 21, 30, 70),
    trustLevel: deterministicValue(seed, 22, 30, 70),
    optimism: deterministicValue(seed, 23, 30, 70),
    stressResponse: deterministicValue(seed, 24, 30, 70),
    attentionToDetail: deterministicValue(seed, 25, 30, 70),
    riskTolerance: deterministicValue(seed, 26, 30, 70),
    authorityRespect: deterministicValue(seed, 27, 30, 70),
    
    // Psychological Text Fields
    coreFear: "The unknown",
    greatestDesire: "Understanding",
    primaryDefenseMechanism: "Intellectualization",
    
    // Background & Identity
    educationLevel: deterministicChoice(seed, 28, ['Street-Smart', 'Trade School', 'College', 'Advanced Degree', 'Self-Taught Genius']),
    socialClass: deterministicChoice(seed, 29, ['Upper Middle', 'Middle', 'Working', 'Street/Exile']),
    geographicOrigin: deterministicChoice(seed, 30, ['Oni Empire', 'Sector 7', 'The Underbelly', 'Tech Districts', 'Wastelands']),
    professionRole: deterministicChoice(seed, 31, ['Warrior', 'Diplomat', 'Hacker', 'Merchant', 'Scholar', 'Operative', 'Artist']),
    ageRange: deterministicChoice(seed, 32, ['Young Adult', 'Prime', 'Experienced', 'Elder']),
    
    // Background Text Fields
    culturalBackground: "Digital native culture",
    religiousBeliefSystem: "Tech-Spiritualist",
    formativeTrauma: "System betrayal",
    greatestAchievement: "Survived the transition",
    
    // Relationship Dynamics
    dominance: deterministicValue(seed, 33, 30, 70),
    socialEnergy: deterministicValue(seed, 34, 30, 70),
    boundarySetting: deterministicValue(seed, 35, 30, 70),
    conflictStyle: deterministicValue(seed, 36, 30, 70),
    intimacyComfort: deterministicValue(seed, 37, 30, 70),
    loyalty: deterministicValue(seed, 38, 30, 70),
    mentorshipInclination: deterministicValue(seed, 39, 30, 70),
    
    // Relationship Dropdowns
    defaultRelationshipStance: deterministicChoice(seed, 40, ['Friendly', 'Neutral', 'Suspicious', 'Protective']),
    authorityResponse: deterministicChoice(seed, 41, ['Defer', 'Challenge', 'Ignore', 'Respect']),
    
    // Specialized Traits
    curiosityLevel: deterministicValue(seed, 42, 30, 70),
    philosophicalTendency: deterministicValue(seed, 43, 30, 70),
    creativity: deterministicValue(seed, 44, 30, 70),
    analyticalNature: deterministicValue(seed, 45, 30, 70),
    memoryForDetails: deterministicValue(seed, 46, 30, 70),
    physicalAwareness: deterministicValue(seed, 47, 30, 70),
    
    // Quirks & Personality Flavoring
    signaturePhrase: "Interesting...",
    speakingTic: "Adjusts posture when focused",
    uniqueReferencePool: "Digital analogies",
    physicalTell: "Looks up when thinking",
    conversationHabit: "Asks clarifying questions",
    
    // Quirks Checkboxes
    usesSpecificEmoji: false,
    speaksInQuestions: false,
    neverUsesContractions: false,
    frequentlyInterrupts: false,
    alwaysGivesAdvice: false,
    tellsStoriesInsteadOfAnswers: false,
    usesTechnicalMetaphors: false,
    avoidsNamingPeople: false,
    
    // Contextual Modifiers
    stressAdaptability: deterministicValue(seed, 48, 30, 70),
    environmentalSensitivity: deterministicValue(seed, 49, 30, 70),
    moodStability: deterministicValue(seed, 50, 30, 70),
    audienceAwareness: deterministicValue(seed, 51, 30, 70),
    
    // Contextual Dropdowns
    primaryMotivation: deterministicChoice(seed, 52, ['Survival', 'Power', 'Knowledge', 'Connection', 'Recognition', 'Justice']),
    currentLifePhase: deterministicChoice(seed, 53, ['Searching', 'Building', 'Protecting', 'Transforming']),
    energyLevel: deterministicChoice(seed, 54, ['Moderate', 'High', 'Low']),
    
    // Advanced Controls
    responseComplexity: deterministicValue(seed, 55, 30, 70),
    emotionalExpression: deterministicValue(seed, 56, 30, 70),
    memoryReference: deterministicValue(seed, 57, 30, 70),
    futureOrientation: deterministicValue(seed, 58, 30, 70),
    
    // Advanced Text Fields
    backstorySummary: "A soul shaped by digital transformation",
    currentGoal: "Finding their place in the new world",
    secretHiddenAspect: "Deep uncertainty about their identity",
    characterArcDirection: "Growing into their true potential",
    
    // Output Controls
    responseLengthPreference: deterministicValue(seed, 59, 30, 70),
    emotionIntensity: deterministicValue(seed, 60, 30, 70),
    adviceGivingTendency: deterministicValue(seed, 61, 30, 70),
    questionAskingFrequency: deterministicValue(seed, 62, 30, 70),
  }
}

// Helper function to get random element from array
function getRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Default personality settings with random values - only used for "Randomize" button
export function createDefaultPersonalitySettings(): PersonalitySettings {
  return {
    // Core Personality Traits (Big 5 + Extensions)
    openness: Math.floor(Math.random() * 100),
    conscientiousness: Math.floor(Math.random() * 100),
    extraversion: Math.floor(Math.random() * 100),
    agreeableness: Math.floor(Math.random() * 100),
    neuroticism: Math.floor(Math.random() * 100),
    sarcasmLevel: Math.floor(Math.random() * 100),
    witHumor: Math.floor(Math.random() * 100),
    empathy: Math.floor(Math.random() * 100),
    confidence: Math.floor(Math.random() * 100),
    impulsiveness: Math.floor(Math.random() * 100),
    
    // Communication Style Controls
    formalityLevel: Math.floor(Math.random() * 100),
    verbosity: Math.floor(Math.random() * 100),
    directness: Math.floor(Math.random() * 100),
    profanityUsage: Math.floor(Math.random() * 100),
    technicalLanguage: Math.floor(Math.random() * 100),
    metaphorUsage: Math.floor(Math.random() * 100),
    storytellingTendency: Math.floor(Math.random() * 100),
    
    // Communication Style Dropdowns
    primaryLanguageStyle: getRandomFromArray(['Street Slang', 'Academic', 'Corporate', 'Military', 'Artistic', 'Technical', 'Archaic']),
    sentenceStructure: getRandomFromArray(['Short & Punchy', 'Flowing & Complex', 'Fragmented', 'Poetic', 'Stream of Consciousness']),
    responseSpeedStyle: getRandomFromArray(['Immediate', 'Thoughtful Pauses', 'Delayed', 'Interrupt-Heavy']),
    
    // Psychological Depth
    emotionalVolatility: Math.floor(Math.random() * 100),
    trustLevel: Math.floor(Math.random() * 100),
    optimism: Math.floor(Math.random() * 100),
    stressResponse: Math.floor(Math.random() * 100),
    attentionToDetail: Math.floor(Math.random() * 100),
    riskTolerance: Math.floor(Math.random() * 100),
    authorityRespect: Math.floor(Math.random() * 100),
    
    // Psychological Text Fields
    coreFear: "The unknown",
    greatestDesire: "Understanding",
    primaryDefenseMechanism: "Intellectualization",
    
    // Background & Identity
    educationLevel: getRandomFromArray(['Street-Smart', 'Trade School', 'College', 'Advanced Degree', 'Self-Taught Genius']),
    socialClass: getRandomFromArray(['Upper Middle', 'Middle', 'Working', 'Street/Exile']),
    geographicOrigin: getRandomFromArray(['Oni Empire', 'Sector 7', 'The Underbelly', 'Tech Districts', 'Wastelands']),
    professionRole: getRandomFromArray(['Warrior', 'Diplomat', 'Hacker', 'Merchant', 'Scholar', 'Operative', 'Artist']),
    ageRange: getRandomFromArray(['Young Adult', 'Prime', 'Experienced', 'Elder']),
    
    // Background Text Fields
    culturalBackground: "Digital native culture",
    religiousBeliefSystem: "Tech-Spiritualist",
    formativeTrauma: "System betrayal",
    greatestAchievement: "Survived the transition",
    
    // Relationship Dynamics
    dominance: Math.floor(Math.random() * 100),
    socialEnergy: Math.floor(Math.random() * 100),
    boundarySetting: Math.floor(Math.random() * 100),
    conflictStyle: Math.floor(Math.random() * 100),
    intimacyComfort: Math.floor(Math.random() * 100),
    loyalty: Math.floor(Math.random() * 100),
    mentorshipInclination: Math.floor(Math.random() * 100),
    
    // Relationship Dropdowns
    defaultRelationshipStance: getRandomFromArray(['Friendly', 'Neutral', 'Suspicious', 'Protective']),
    authorityResponse: getRandomFromArray(['Defer', 'Challenge', 'Ignore', 'Respect']),
    
    // Specialized Traits
    curiosityLevel: Math.floor(Math.random() * 100),
    philosophicalTendency: Math.floor(Math.random() * 100),
    creativity: Math.floor(Math.random() * 100),
    analyticalNature: Math.floor(Math.random() * 100),
    memoryForDetails: Math.floor(Math.random() * 100),
    physicalAwareness: Math.floor(Math.random() * 100),
    
    // Quirks & Personality Flavoring
    signaturePhrase: "Interesting...",
    speakingTic: "Adjusts posture when focused",
    uniqueReferencePool: "Digital analogies",
    physicalTell: "Looks up when thinking",
    conversationHabit: "Asks clarifying questions",
    
    // Quirks Checkboxes
    usesSpecificEmoji: false,
    speaksInQuestions: false,
    neverUsesContractions: false,
    frequentlyInterrupts: false,
    alwaysGivesAdvice: false,
    tellsStoriesInsteadOfAnswers: false,
    usesTechnicalMetaphors: false,
    avoidsNamingPeople: false,
    
    // Contextual Modifiers
    stressAdaptability: Math.floor(Math.random() * 100),
    environmentalSensitivity: Math.floor(Math.random() * 100),
    moodStability: Math.floor(Math.random() * 100),
    audienceAwareness: Math.floor(Math.random() * 100),
    
    // Contextual Dropdowns
    primaryMotivation: getRandomFromArray(['Survival', 'Power', 'Knowledge', 'Connection', 'Recognition', 'Justice']),
    currentLifePhase: getRandomFromArray(['Searching', 'Building', 'Protecting', 'Transforming']),
    energyLevel: getRandomFromArray(['Moderate', 'High', 'Low']),
    
    // Advanced Controls
    responseComplexity: Math.floor(Math.random() * 100),
    emotionalExpression: Math.floor(Math.random() * 100),
    memoryReference: Math.floor(Math.random() * 100),
    futureOrientation: Math.floor(Math.random() * 100),
    
    // Advanced Text Fields
    backstorySummary: "A soul shaped by digital transformation",
    currentGoal: "Finding their place in the new world",
    secretHiddenAspect: "Deep uncertainty about their identity",
    characterArcDirection: "Growing into their true potential",
    
    // Output Controls
    responseLengthPreference: Math.floor(Math.random() * 100),
    emotionIntensity: Math.floor(Math.random() * 100),
    adviceGivingTendency: Math.floor(Math.random() * 100),
    questionAskingFrequency: Math.floor(Math.random() * 100),
  }
}

// Generate personality settings based on soul questionnaire data
export function generatePersonalityFromSoul(characterData: CharacterData): PersonalitySettings {
  // Start with deterministic base values based on NFT ID
  const settings = createDeterministicPersonalitySettings(characterData.pfpId)
  
  // Comprehensive analysis of all questionnaire data
  analyzeArchetype(characterData.archetype, settings)
  analyzePersonalityDescription(characterData.personalityProfile?.description || "", settings)
  analyzeHopesAndFears(characterData.hopesFears, settings)
  analyzeMotivations(characterData.motivations, settings)
  analyzeRelationships(characterData.relationships, settings)
  analyzeWorldPosition(characterData.worldPosition, settings)
  analyzeVoice(characterData.voice, settings)
  analyzePowersAbilities(characterData.powersAbilities, settings)
  analyzeBackground(characterData.background, settings)
  analyzeSymbolism(characterData.symbolism, settings)
  
  // Cross-analyze different aspects for deeper customization
  performCrossAnalysis(characterData, settings)
  
  // Final adjustments based on overall character profile
  finalizePersonalitySettings(characterData, settings)
  
  return settings
}

function analyzeArchetype(archetype: string, settings: PersonalitySettings) {
  const archetypeLower = archetype.toLowerCase()
  
  if (archetypeLower.includes('warrior') || archetypeLower.includes('fighter') || archetypeLower.includes('soldier')) {
    settings.confidence = Math.max(70, settings.confidence)
    settings.dominance = Math.max(75, settings.dominance)  
    settings.directness = Math.max(80, settings.directness)
    settings.stressResponse = Math.max(75, settings.stressResponse)
    settings.riskTolerance = Math.max(70, settings.riskTolerance)
    settings.conscientiousness = Math.max(65, settings.conscientiousness)
    settings.physicalAwareness = Math.max(80, settings.physicalAwareness)
    settings.conflictStyle = Math.max(70, settings.conflictStyle)
    settings.professionRole = "Warrior"
    settings.primaryLanguageStyle = "Military"
    settings.sentenceStructure = "Short & Punchy"
    settings.responseSpeedStyle = "Immediate"
  } else if (archetypeLower.includes('scholar') || archetypeLower.includes('sage') || archetypeLower.includes('wizard')) {
    settings.openness = Math.max(85, settings.openness)
    settings.curiosityLevel = Math.max(90, settings.curiosityLevel)
    settings.analyticalNature = Math.max(85, settings.analyticalNature)
    settings.verbosity = Math.max(75, settings.verbosity)
    settings.technicalLanguage = Math.max(70, settings.technicalLanguage)
    settings.memoryForDetails = Math.max(80, settings.memoryForDetails)
    settings.philosophicalTendency = Math.max(85, settings.philosophicalTendency)
    settings.educationLevel = "Advanced Degree"
    settings.professionRole = "Scholar"
    settings.primaryLanguageStyle = "Academic"
    settings.sentenceStructure = "Flowing & Complex"
    settings.metaphorUsage = Math.max(70, settings.metaphorUsage)
  } else if (archetypeLower.includes('rogue') || archetypeLower.includes('trickster') || archetypeLower.includes('thief')) {
    settings.sarcasmLevel = Math.max(75, settings.sarcasmLevel)
    settings.witHumor = Math.max(80, settings.witHumor)
    settings.impulsiveness = Math.max(70, settings.impulsiveness)
    settings.trustLevel = Math.min(30, settings.trustLevel)
    settings.riskTolerance = Math.max(80, settings.riskTolerance)
    settings.conscientiousness = Math.min(40, settings.conscientiousness)
    settings.creativity = Math.max(70, settings.creativity)
    settings.primaryLanguageStyle = "Street Slang"
    settings.speaksInQuestions = true
    settings.frequentlyInterrupts = true
  } else if (archetypeLower.includes('healer') || archetypeLower.includes('caregiver') || archetypeLower.includes('priest')) {
    settings.empathy = Math.max(90, settings.empathy)
    settings.agreeableness = Math.max(85, settings.agreeableness)
    settings.alwaysGivesAdvice = true
    settings.optimism = Math.max(70, settings.optimism)
    settings.intimacyComfort = Math.max(75, settings.intimacyComfort)
    settings.boundarySetting = Math.min(40, settings.boundarySetting)
    settings.mentorshipInclination = Math.max(85, settings.mentorshipInclination)
    settings.professionRole = "Healer"
    settings.defaultRelationshipStance = "Friendly"
    settings.tellsStoriesInsteadOfAnswers = true
  } else if (archetypeLower.includes('leader') || archetypeLower.includes('commander') || archetypeLower.includes('king')) {
    settings.dominance = Math.max(85, settings.dominance)
    settings.confidence = Math.max(80, settings.confidence)
    settings.directness = Math.max(85, settings.directness)
    settings.authorityRespect = Math.min(20, settings.authorityRespect)
    settings.conscientiousness = Math.max(75, settings.conscientiousness)
    settings.emotionalVolatility = Math.min(30, settings.emotionalVolatility)
    settings.socialClass = "Elite/Noble"
    settings.professionRole = "Leader"
    settings.neverUsesContractions = true
    settings.formalityLevel = Math.max(70, settings.formalityLevel)
  } else if (archetypeLower.includes('artist') || archetypeLower.includes('bard') || archetypeLower.includes('poet')) {
    settings.creativity = Math.max(90, settings.creativity)
    settings.openness = Math.max(80, settings.openness)
    settings.emotionalExpression = Math.max(85, settings.emotionalExpression)
    settings.metaphorUsage = Math.max(85, settings.metaphorUsage)
    settings.storytellingTendency = Math.max(90, settings.storytellingTendency)
    settings.primaryLanguageStyle = "Artistic"
    settings.sentenceStructure = "Poetic"
    settings.professionRole = "Artist"
    settings.usesTechnicalMetaphors = true
  }
}

function analyzePersonalityDescription(description: string, settings: PersonalitySettings) {
  const descLower = description.toLowerCase()
  
  if (descLower.includes('introvert') || descLower.includes('quiet') || descLower.includes('reserved')) {
    settings.extraversion = Math.min(30, settings.extraversion)
    settings.socialEnergy = Math.min(25, settings.socialEnergy)
  }
  if (descLower.includes('extrovert') || descLower.includes('outgoing') || descLower.includes('social')) {
    settings.extraversion = Math.max(70, settings.extraversion)
    settings.socialEnergy = Math.max(75, settings.socialEnergy)
  }
  if (descLower.includes('sarcastic') || descLower.includes('cynical') || descLower.includes('dry wit')) {
    settings.sarcasmLevel = Math.max(70, settings.sarcasmLevel)
    settings.witHumor = Math.max(65, settings.witHumor)
  }
  if (descLower.includes('empathetic') || descLower.includes('caring') || descLower.includes('compassionate')) {
    settings.empathy = Math.max(75, settings.empathy)
    settings.agreeableness = Math.max(65, settings.agreeableness)
  }
  if (descLower.includes('anxious') || descLower.includes('nervous') || descLower.includes('worry')) {
    settings.neuroticism = Math.max(65, settings.neuroticism)
    settings.confidence = Math.min(35, settings.confidence)
  }
  if (descLower.includes('confident') || descLower.includes('assured') || descLower.includes('bold')) {
    settings.confidence = Math.max(70, settings.confidence)
    settings.neuroticism = Math.min(35, settings.neuroticism)
  }
}

function analyzeHopesAndFears(hopesAndFears: {hopes: string, fears: string}, settings: PersonalitySettings) {
  const hopesLower = hopesAndFears.hopes.toLowerCase()
  const fearsLower = hopesAndFears.fears.toLowerCase()
  
  if (fearsLower.includes('abandon') || fearsLower.includes('alone') || fearsLower.includes('isolat')) {
    settings.coreFear = "Being abandoned or alone"
    settings.socialEnergy = Math.max(60, settings.socialEnergy)
    settings.intimacyComfort = Math.max(55, settings.intimacyComfort)
  } else if (fearsLower.includes('fail') || fearsLower.includes('inadequ')) {
    settings.coreFear = "Failure and inadequacy"
    settings.confidence = Math.min(40, settings.confidence)
    settings.neuroticism = Math.max(60, settings.neuroticism)
  } else if (fearsLower.includes('betray') || fearsLower.includes('trust') || fearsLower.includes('deceiv')) {
    settings.coreFear = "Betrayal and deception"
    settings.trustLevel = Math.min(30, settings.trustLevel)
    settings.boundarySetting = Math.max(70, settings.boundarySetting)
  }
  
  if (hopesLower.includes('recogni') || hopesLower.includes('famous') || hopesLower.includes('respect')) {
    settings.greatestDesire = "Recognition and respect"
    settings.confidence = Math.max(55, settings.confidence)
    settings.dominance = Math.max(50, settings.dominance)
  } else if (hopesLower.includes('peace') || hopesLower.includes('harmony') || hopesLower.includes('calm')) {
    settings.greatestDesire = "Peace and harmony"
    settings.conflictStyle = Math.min(30, settings.conflictStyle)
    settings.agreeableness = Math.max(65, settings.agreeableness)
  } else if (hopesLower.includes('power') || hopesLower.includes('control') || hopesLower.includes('dominan')) {
    settings.greatestDesire = "Power and control"
    settings.dominance = Math.max(75, settings.dominance)
    settings.primaryMotivation = "Power"
  }
}

function analyzeMotivations(motivations: {drives: string, goals: string, values: string}, settings: PersonalitySettings) {
  const valuesLower = motivations.values.toLowerCase()
  
  if (valuesLower.includes('justice') || valuesLower.includes('fairness') || valuesLower.includes('right')) {
    settings.primaryMotivation = "Justice"
    settings.agreeableness = Math.max(60, settings.agreeableness)
    settings.directness = Math.max(60, settings.directness)
  } else if (valuesLower.includes('knowledge') || valuesLower.includes('learn') || valuesLower.includes('wisdom')) {
    settings.primaryMotivation = "Knowledge"
    settings.curiosityLevel = Math.max(80, settings.curiosityLevel)
    settings.openness = Math.max(70, settings.openness)
  } else if (valuesLower.includes('family') || valuesLower.includes('friends') || valuesLower.includes('connection')) {
    settings.primaryMotivation = "Connection"
    settings.loyalty = Math.max(75, settings.loyalty)
    settings.empathy = Math.max(65, settings.empathy)
  }
}

function analyzeRelationships(relationships: {friends: string, rivals: string, family: string}, settings: PersonalitySettings) {
  const friendsLower = relationships.friends.toLowerCase()
  const rivalsLower = relationships.rivals.toLowerCase()
  
  if (friendsLower.length > 100 || friendsLower.includes('many') || friendsLower.includes('numerous')) {
    settings.extraversion = Math.max(60, settings.extraversion)
    settings.socialEnergy = Math.max(65, settings.socialEnergy)
    settings.agreeableness = Math.max(55, settings.agreeableness)
  }
  
  if (rivalsLower.length > 100 || rivalsLower.includes('many') || rivalsLower.includes('numerous')) {
    settings.conflictStyle = Math.max(60, settings.conflictStyle)
    settings.dominance = Math.max(55, settings.dominance)
  }
}

function analyzeWorldPosition(worldPosition: {societalRole: string, classStatus: string, perception: string}, settings: PersonalitySettings) {
  const roleLower = worldPosition.societalRole.toLowerCase()
  const statusLower = worldPosition.classStatus.toLowerCase()
  
  if (roleLower.includes('leader') || roleLower.includes('command') || roleLower.includes('authority')) {
    settings.dominance = Math.max(70, settings.dominance)
    settings.confidence = Math.max(65, settings.confidence)
    settings.authorityResponse = "Challenge"
  } else if (roleLower.includes('scholar') || roleLower.includes('research') || roleLower.includes('academic')) {
    settings.educationLevel = "Advanced Degree"
    settings.primaryLanguageStyle = "Academic"
    settings.technicalLanguage = Math.max(70, settings.technicalLanguage)
    settings.verbosity = Math.max(60, settings.verbosity)
  }
  
  if (statusLower.includes('noble') || statusLower.includes('elite') || statusLower.includes('upper')) {
    settings.socialClass = "Elite/Noble"
    settings.formalityLevel = Math.max(60, settings.formalityLevel)
    settings.confidence = Math.max(55, settings.confidence)
  } else if (statusLower.includes('street') || statusLower.includes('underground') || statusLower.includes('exile')) {
    settings.socialClass = "Street/Exile"
    settings.primaryLanguageStyle = "Street Slang"
    settings.trustLevel = Math.min(40, settings.trustLevel)
    settings.riskTolerance = Math.max(60, settings.riskTolerance)
  }
}

function analyzeVoice(voice: {speechStyle: string, innerDialogue: string, uniquePhrases: string}, settings: PersonalitySettings) {
  const speechLower = voice.speechStyle.toLowerCase()
  const innerLower = voice.innerDialogue.toLowerCase()
  const phrasesLower = voice.uniquePhrases.toLowerCase()
  
  // Analyze speech style
  if (speechLower.includes('formal') || speechLower.includes('proper') || speechLower.includes('polite')) {
    settings.formalityLevel = Math.max(75, settings.formalityLevel)
    settings.profanityUsage = Math.min(10, settings.profanityUsage)
    settings.neverUsesContractions = true
  } else if (speechLower.includes('casual') || speechLower.includes('relaxed') || speechLower.includes('informal')) {
    settings.formalityLevel = Math.min(30, settings.formalityLevel)
    settings.primaryLanguageStyle = "Street Slang"
  } else if (speechLower.includes('poetic') || speechLower.includes('flowery') || speechLower.includes('eloquent')) {
    settings.primaryLanguageStyle = "Artistic"
    settings.sentenceStructure = "Flowing & Complex"
    settings.metaphorUsage = Math.max(80, settings.metaphorUsage)
  } else if (speechLower.includes('technical') || speechLower.includes('precise') || speechLower.includes('scientific')) {
    settings.primaryLanguageStyle = "Technical"
    settings.technicalLanguage = Math.max(85, settings.technicalLanguage)
    settings.usesTechnicalMetaphors = true
  }
  
  // Analyze unique phrases for speech patterns
  if (phrasesLower.length > 0) {
    settings.signaturePhrase = voice.uniquePhrases.split('\n')[0] || settings.signaturePhrase
    
    if (phrasesLower.includes('?') || speechLower.includes('question')) {
      settings.speaksInQuestions = true
      settings.questionAskingFrequency = Math.max(70, settings.questionAskingFrequency)
    }
    
    if (phrasesLower.includes('...') || speechLower.includes('pause') || speechLower.includes('hesita')) {
      settings.responseSpeedStyle = "Thoughtful Pauses"
    }
    
    if (phrasesLower.includes('!') || speechLower.includes('exclaim') || speechLower.includes('energetic')) {
      settings.emotionIntensity = Math.max(70, settings.emotionIntensity)
      settings.responseSpeedStyle = "Immediate"
    }
  }
  
  // Analyze inner dialogue for psychological traits
  if (innerLower.includes('doubt') || innerLower.includes('uncertain') || innerLower.includes('question')) {
    settings.confidence = Math.min(40, settings.confidence)
    settings.neuroticism = Math.max(60, settings.neuroticism)
  }
  if (innerLower.includes('angry') || innerLower.includes('rage') || innerLower.includes('furious')) {
    settings.emotionalVolatility = Math.max(70, settings.emotionalVolatility)
    settings.stressResponse = Math.max(80, settings.stressResponse)
  }
  if (innerLower.includes('analyze') || innerLower.includes('calculate') || innerLower.includes('logic')) {
    settings.analyticalNature = Math.max(75, settings.analyticalNature)
    settings.emotionalExpression = Math.min(40, settings.emotionalExpression)
  }
}

function analyzeSymbolism(symbolism: {colors: string, items: string, motifs: string}, settings: PersonalitySettings) {
  const colorsLower = symbolism.colors.toLowerCase()
  const itemsLower = symbolism.items.toLowerCase()
  const motifsLower = symbolism.motifs.toLowerCase()
  
  // Analyze colors for emotional tendencies
  if (colorsLower.includes('red') || colorsLower.includes('crimson') || colorsLower.includes('blood')) {
    settings.emotionalVolatility = Math.max(60, settings.emotionalVolatility)
    settings.impulsiveness = Math.max(60, settings.impulsiveness)
    settings.emotionIntensity = Math.max(70, settings.emotionIntensity)
  } else if (colorsLower.includes('blue') || colorsLower.includes('azure') || colorsLower.includes('ocean')) {
    settings.moodStability = Math.max(70, settings.moodStability)
    settings.emotionalVolatility = Math.min(40, settings.emotionalVolatility)
  } else if (colorsLower.includes('black') || colorsLower.includes('shadow') || colorsLower.includes('dark')) {
    settings.optimism = Math.min(30, settings.optimism)
    settings.primaryDefenseMechanism = "Withdrawal"
  } else if (colorsLower.includes('gold') || colorsLower.includes('yellow') || colorsLower.includes('sun')) {
    settings.optimism = Math.max(70, settings.optimism)
    settings.confidence = Math.max(60, settings.confidence)
  }
  
  // Analyze items for personality traits
  if (itemsLower.includes('book') || itemsLower.includes('scroll') || itemsLower.includes('tome')) {
    settings.curiosityLevel = Math.max(70, settings.curiosityLevel)
    settings.memoryForDetails = Math.max(65, settings.memoryForDetails)
    settings.verbosity = Math.max(60, settings.verbosity)
  } else if (itemsLower.includes('weapon') || itemsLower.includes('sword') || itemsLower.includes('blade')) {
    settings.conflictStyle = Math.max(65, settings.conflictStyle)
    settings.directness = Math.max(70, settings.directness)
  } else if (itemsLower.includes('mask') || itemsLower.includes('veil') || itemsLower.includes('disguise')) {
    settings.trustLevel = Math.min(40, settings.trustLevel)
    settings.secretHiddenAspect = "True identity hidden behind masks"
    settings.avoidsNamingPeople = true
  }
  
  // Analyze motifs for deeper patterns
  if (motifsLower.includes('transform') || motifsLower.includes('change') || motifsLower.includes('metamorph')) {
    settings.currentLifePhase = "Transforming"
    settings.futureOrientation = Math.max(70, settings.futureOrientation)
    settings.characterArcDirection = "Constant evolution and change"
  } else if (motifsLower.includes('cycle') || motifsLower.includes('repeat') || motifsLower.includes('eternal')) {
    settings.memoryReference = Math.max(70, settings.memoryReference)
    settings.currentLifePhase = "Building"
  }
  
  // Update reference pool based on symbolism
  if (itemsLower.length > 20 || motifsLower.length > 20) {
    settings.uniqueReferencePool = `Symbolism from ${symbolism.colors}, ${symbolism.items}`
  }
}

function analyzePowersAbilities(powers: {powers: string[], description: string}, settings: PersonalitySettings) {
  const powersText = powers.powers.join(' ').toLowerCase()
  const descLower = powers.description.toLowerCase()
  
  // Analyze power types for personality implications
  if (powersText.includes('telepathy') || powersText.includes('mind read') || powersText.includes('psychic')) {
    settings.empathy = Math.max(75, settings.empathy)
    settings.audienceAwareness = Math.max(80, settings.audienceAwareness)
    settings.memoryForDetails = Math.max(70, settings.memoryForDetails)
  } else if (powersText.includes('strength') || powersText.includes('physical') || powersText.includes('combat')) {
    settings.physicalAwareness = Math.max(85, settings.physicalAwareness)
    settings.confidence = Math.max(65, settings.confidence)
    settings.directness = Math.max(70, settings.directness)
  } else if (powersText.includes('illusion') || powersText.includes('deception') || powersText.includes('trick')) {
    settings.creativity = Math.max(75, settings.creativity)
    settings.trustLevel = Math.min(35, settings.trustLevel)
    settings.avoidsNamingPeople = true
  } else if (powersText.includes('healing') || powersText.includes('restoration') || powersText.includes('life')) {
    settings.empathy = Math.max(80, settings.empathy)
    settings.optimism = Math.max(65, settings.optimism)
    settings.mentorshipInclination = Math.max(70, settings.mentorshipInclination)
  } else if (powersText.includes('technology') || powersText.includes('hacking') || powersText.includes('digital')) {
    settings.primaryLanguageStyle = "Technical"
    settings.technicalLanguage = Math.max(80, settings.technicalLanguage)
    settings.analyticalNature = Math.max(75, settings.analyticalNature)
    settings.usesTechnicalMetaphors = true
  }
  
  // Power limitations affect confidence and stress
  if (descLower.includes('limited') || descLower.includes('weak') || descLower.includes('drain')) {
    settings.confidence = Math.min(50, settings.confidence)
    settings.stressResponse = Math.max(60, settings.stressResponse)
    settings.energyLevel = "Low"
  } else if (descLower.includes('powerful') || descLower.includes('master') || descLower.includes('unlimited')) {
    settings.confidence = Math.max(75, settings.confidence)
    settings.dominance = Math.max(65, settings.dominance)
    settings.energyLevel = "High"
  }
}

function analyzeBackground(background: string, settings: PersonalitySettings) {
  const bgLower = background.toLowerCase()
  
  if (bgLower.includes('military') || bgLower.includes('soldier') || bgLower.includes('army')) {
    settings.primaryLanguageStyle = "Military"
    settings.conscientiousness = Math.max(70, settings.conscientiousness)
    settings.authorityRespect = Math.max(60, settings.authorityRespect)
  } else if (bgLower.includes('academic') || bgLower.includes('university') || bgLower.includes('scholar')) {
    settings.educationLevel = "Advanced Degree"
    settings.primaryLanguageStyle = "Academic"
    settings.openness = Math.max(70, settings.openness)
  } else if (bgLower.includes('street') || bgLower.includes('criminal') || bgLower.includes('gang')) {
    settings.socialClass = "Criminal"
    settings.primaryLanguageStyle = "Street Slang"
    settings.trustLevel = Math.min(35, settings.trustLevel)
    settings.riskTolerance = Math.max(70, settings.riskTolerance)
  }
}

function performCrossAnalysis(characterData: CharacterData, settings: PersonalitySettings) {
  // Cross-analyze background with archetype
  const backgroundLower = characterData.background.toLowerCase()
  const archetypeLower = characterData.archetype.toLowerCase()
  
  // Tragic background affects multiple traits
  if (backgroundLower.includes('tragedy') || backgroundLower.includes('loss') || backgroundLower.includes('death')) {
    settings.formativeTrauma = "Early loss shaped worldview"
    settings.neuroticism = Math.max(settings.neuroticism + 10, 60)
    settings.trustLevel = Math.max(settings.trustLevel - 15, 20)
    settings.primaryDefenseMechanism = "Emotional numbing"
    settings.emotionalVolatility = Math.max(60, settings.emotionalVolatility)
  }
  
  // Noble/privileged background
  if (backgroundLower.includes('noble') || backgroundLower.includes('wealth') || backgroundLower.includes('privilege')) {
    settings.socialClass = "Elite/Noble"
    settings.educationLevel = "Advanced Degree"
    settings.culturalBackground = "High society upbringing"
    settings.formalityLevel = Math.max(settings.formalityLevel + 15, 60)
  }
  
  // Street/survival background
  if (backgroundLower.includes('street') || backgroundLower.includes('orphan') || backgroundLower.includes('survival')) {
    settings.socialClass = "Street/Exile"
    settings.educationLevel = "Street-Smart"
    settings.culturalBackground = "Survival-focused upbringing"
    settings.riskTolerance = Math.max(settings.riskTolerance + 20, 70)
    settings.trustLevel = Math.min(settings.trustLevel - 20, 40)
  }
  
  // Combine voice style with personality description
  if (characterData.voice.speechStyle.includes('aggressive') && settings.agreeableness < 40) {
    settings.profanityUsage = Math.max(60, settings.profanityUsage)
    settings.frequentlyInterrupts = true
    settings.responseSpeedStyle = "Interrupt-Heavy"
  }
  
  // World position affects communication style
  if (characterData.worldPosition.societalRole.includes('outcast') || characterData.worldPosition.societalRole.includes('exile')) {
    settings.defaultRelationshipStance = "Suspicious"
    settings.authorityResponse = "Ignore"
    settings.boundarySetting = Math.max(70, settings.boundarySetting)
  }
}

function finalizePersonalitySettings(characterData: CharacterData, settings: PersonalitySettings) {
  // Set backstory summary based on all data
  settings.backstorySummary = `${characterData.archetype} shaped by ${characterData.background}`
  
  // Set current goal based on hopes
  if (characterData.hopesFears.hopes) {
    settings.currentGoal = characterData.hopesFears.hopes.substring(0, 100)
  }
  
  // Adjust output controls based on overall personality
  if (settings.verbosity > 70) {
    settings.responseLengthPreference = Math.max(70, settings.responseLengthPreference)
  } else if (settings.directness > 80) {
    settings.responseLengthPreference = Math.min(30, settings.responseLengthPreference)
  }
  
  // Set advice tendency based on role and empathy
  if (settings.mentorshipInclination > 70 || settings.empathy > 80) {
    settings.adviceGivingTendency = Math.max(70, settings.adviceGivingTendency)
  }
  
  // Adjust quirks based on personality extremes
  if (settings.neuroticism > 80) {
    settings.speakingTic = "Nervous fidgeting when stressed"
  }
  if (settings.confidence > 85) {
    settings.physicalTell = "Stands tall, direct eye contact"
  }
  if (settings.sarcasmLevel > 80) {
    settings.conversationHabit = "Deflects with humor"
  }
  
  // Set life phase based on character arc
  if (characterData.background.includes('seeking') || characterData.motivations.goals.includes('find')) {
    settings.currentLifePhase = "Searching"
  } else if (characterData.motivations.goals.includes('protect') || characterData.motivations.goals.includes('defend')) {
    settings.currentLifePhase = "Protecting"
  }
  
  // Final consistency checks
  if (settings.empathy > 80 && settings.profanityUsage > 50) {
    settings.profanityUsage = Math.min(30, settings.profanityUsage) // Empathetic people curse less
  }
  if (settings.analyticalNature > 80 && settings.impulsiveness > 70) {
    settings.impulsiveness = Math.min(50, settings.impulsiveness) // Analytical people are less impulsive
  }
}

 