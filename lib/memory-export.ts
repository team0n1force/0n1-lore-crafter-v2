import type { CharacterMemoryProfile } from './memory-types'
import type { StoredSoul } from './storage-wrapper'
import type { CharacterData } from './types'

export interface ExportData {
  version: string
  exportDate: Date
  profiles: CharacterMemoryProfile[]
}

export interface CompleteSoulExport {
  version: string
  exportDate: Date
  soul: {
    id: string
    createdAt: string
    lastUpdated: string
    data: CharacterData // Includes personalitySettings
  }
  memoryProfile?: CharacterMemoryProfile // Includes all context notes with tags
  archivedChats?: any[] // Include archived chats if available
  metadata: {
    exportedBy?: string // wallet address if available
    exportTool: string
    includesPersonality: boolean
    includesMemory: boolean
    includesArchives: boolean
  }
}

export function exportCompleteSoul(
  soul: StoredSoul, 
  memoryProfile?: CharacterMemoryProfile | null,
  archivedChats?: any[]
): string {
  const exportData: CompleteSoulExport = {
    version: "2.0.0",
    exportDate: new Date(),
    soul: {
      id: soul.id,
      createdAt: soul.createdAt,
      lastUpdated: soul.lastUpdated,
      data: soul.data // This includes personalitySettings
    },
    memoryProfile: memoryProfile || undefined,
    archivedChats: archivedChats || undefined,
    metadata: {
      exportTool: "0N1 Lore Crafter",
      includesPersonality: !!soul.data.personalitySettings,
      includesMemory: !!memoryProfile,
      includesArchives: !!(archivedChats && archivedChats.length > 0)
    }
  }
  
  return JSON.stringify(exportData, null, 2)
}

export function exportMemoryProfiles(profiles: CharacterMemoryProfile[]): string {
  const exportData: ExportData = {
    version: "1.0.0",
    exportDate: new Date(),
    profiles
  }
  
  return JSON.stringify(exportData, null, 2)
}

export function exportSingleProfile(profile: CharacterMemoryProfile): string {
  const exportData: ExportData = {
    version: "1.0.0",
    exportDate: new Date(),
    profiles: [profile]
  }
  
  return JSON.stringify(exportData, null, 2)
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateExportFilename(characterName: string, nftId: string, includesContext: boolean = false): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const contextSuffix = includesContext ? '_with_context' : ''
  return `${characterName}_${nftId}${contextSuffix}_${timestamp}.json`
}

export function parseImportData(jsonString: string): ExportData {
  try {
    const data = JSON.parse(jsonString)
    
    // Validate structure
    if (!data.version || !data.exportDate || !Array.isArray(data.profiles)) {
      throw new Error('Invalid export file format')
    }
    
    // Parse dates back to Date objects
    data.exportDate = new Date(data.exportDate)
    
    data.profiles = data.profiles.map((profile: any) => {
      // Parse all date fields
      profile.metadata.createdAt = new Date(profile.metadata.createdAt)
      profile.metadata.lastUpdated = new Date(profile.metadata.lastUpdated)
      profile.overview.lastActivity = new Date(profile.overview.lastActivity)
      
      profile.overview.keyMilestones = profile.overview.keyMilestones.map((m: any) => ({
        ...m,
        date: new Date(m.date)
      }))
      
      profile.characterEvolution.personalityChanges = profile.characterEvolution.personalityChanges.map((c: any) => ({
        ...c,
        date: new Date(c.date)
      }))
      
      profile.characterEvolution.newTraits = profile.characterEvolution.newTraits.map((t: any) => ({
        ...t,
        dateAcquired: new Date(t.dateAcquired)
      }))
      
      profile.characterEvolution.relationships = profile.characterEvolution.relationships.map((r: any) => ({
        ...r,
        dateEstablished: new Date(r.dateEstablished)
      }))
      
      profile.contextNotes.sessionNotes = profile.contextNotes.sessionNotes.map((n: any) => ({
        ...n,
        date: new Date(n.date)
      }))
      
      profile.contextNotes.plotHooks = profile.contextNotes.plotHooks.map((p: any) => ({
        ...p,
        dateCreated: new Date(p.dateCreated)
      }))
      
      profile.contextNotes.freeformNotes = profile.contextNotes.freeformNotes.map((n: any) => ({
        ...n,
        date: new Date(n.date)
      }))
      
      profile.contextNotes.worldBuilding = profile.contextNotes.worldBuilding.map((w: any) => ({
        ...w,
        dateAdded: new Date(w.dateAdded)
      }))
      
      // Parse context entries if they exist
      if (profile.contextNotes.contextEntries) {
        profile.contextNotes.contextEntries = profile.contextNotes.contextEntries.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }))
      }
      
      // Parse custom tag dates if they exist
      if (profile.contextNotes.tagManagement?.customTags) {
        profile.contextNotes.tagManagement.customTags = profile.contextNotes.tagManagement.customTags.map((tag: any) => ({
          ...tag,
          createdDate: new Date(tag.createdDate)
        }))
      }
      
      return profile
    })
    
    return data
  } catch (error) {
    throw new Error(`Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function parseCompleteSoulImport(jsonString: string): CompleteSoulExport {
  try {
    const data = JSON.parse(jsonString)
    
    // Validate structure
    if (!data.version || !data.exportDate || !data.soul) {
      throw new Error('Invalid soul export file format')
    }
    
    // Parse dates
    data.exportDate = new Date(data.exportDate)
    
    // Parse memory profile if included
    if (data.memoryProfile) {
      // Use existing parseImportData logic for memory profile
      const tempExport = { 
        version: data.version, 
        exportDate: data.exportDate, 
        profiles: [data.memoryProfile] 
      }
      const parsed = parseImportData(JSON.stringify(tempExport))
      data.memoryProfile = parsed.profiles[0]
    }
    
    return data
  } catch (error) {
    throw new Error(`Failed to parse soul import data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function validateProfile(profile: CharacterMemoryProfile): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!profile.id) errors.push('Profile ID is missing')
  if (!profile.nftId) errors.push('NFT ID is missing')
  if (!profile.characterData) errors.push('Character data is missing')
  if (!profile.conversationMemory) errors.push('Conversation memory is missing')
  if (!profile.metadata) errors.push('Metadata is missing')
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function mergeProfiles(existing: CharacterMemoryProfile[], imported: CharacterMemoryProfile[]): {
  merged: CharacterMemoryProfile[]
  conflicts: string[]
  newProfiles: CharacterMemoryProfile[]
} {
  const conflicts: string[] = []
  const newProfiles: CharacterMemoryProfile[] = []
  const merged = [...existing]
  
  imported.forEach(importedProfile => {
    const existingIndex = existing.findIndex(p => p.nftId === importedProfile.nftId)
    
    if (existingIndex >= 0) {
      // Conflict detected
      conflicts.push(`NFT #${importedProfile.nftId} (${importedProfile.characterData.soulName})`)
    } else {
      // New profile
      newProfiles.push(importedProfile)
      merged.push(importedProfile)
    }
  })
  
  return { merged, conflicts, newProfiles }
} 