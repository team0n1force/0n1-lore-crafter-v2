import { AuthSession, AuthChallenge } from './auth-types';

// Session store — in-memory for now. JWT is the real source of truth.
// WARNING: In-memory Maps do NOT persist across serverless invocations (Vercel).
// Challenge flow (create→verify) may fail if routed to different instances.
// TODO: For production at scale, migrate to Redis or Supabase-backed store.
const activeSessions = new Map<string, AuthSession>();
const activeChallenges = new Map<string, AuthChallenge>();

// Cleanup intervals
const SESSION_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const CHALLENGE_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Session Management Functions
 */

export function createSession(sessionId: string, walletAddress: string, challengeId: string): AuthSession {
  const now = Date.now();
  const sessionDurationHours = parseInt(process.env.SESSION_DURATION_HOURS || '24');
  const expiresAt = now + (sessionDurationHours * 60 * 60 * 1000);
  
  const session: AuthSession = {
    sessionId,
    walletAddress: walletAddress.toLowerCase(),
    challengeId,
    createdAt: now,
    expiresAt,
    lastActivity: now
  };
  
  activeSessions.set(sessionId, session);
  console.log(`✅ Created session ${sessionId} for wallet ${walletAddress}, expires: ${new Date(expiresAt).toISOString()}`);
  
  return session;
}

export function getSession(sessionId: string): AuthSession | null {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return null;
  }
  
  // Check if session is expired
  if (session.expiresAt < Date.now()) {
    activeSessions.delete(sessionId);
    console.log(`🗑️ Removed expired session ${sessionId}`);
    return null;
  }
  
  // Update last activity
  session.lastActivity = Date.now();
  activeSessions.set(sessionId, session);
  
  return session;
}

export function revokeSession(sessionId: string): boolean {
  const existed = activeSessions.has(sessionId);
  activeSessions.delete(sessionId);
  
  if (existed) {
    console.log(`🚫 Revoked session ${sessionId}`);
  }
  
  return existed;
}

export function revokeAllUserSessions(walletAddress: string): number {
  const normalizedAddress = walletAddress.toLowerCase();
  let revokedCount = 0;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.walletAddress === normalizedAddress) {
      activeSessions.delete(sessionId);
      revokedCount++;
    }
  }
  
  if (revokedCount > 0) {
    console.log(`🚫 Revoked ${revokedCount} sessions for wallet ${walletAddress}`);
  }
  
  return revokedCount;
}

export function extendSession(sessionId: string): AuthSession | null {
  const session = getSession(sessionId);
  
  if (!session) {
    return null;
  }
  
  const sessionDurationHours = parseInt(process.env.SESSION_DURATION_HOURS || '24');
  session.expiresAt = Date.now() + (sessionDurationHours * 60 * 60 * 1000);
  session.lastActivity = Date.now();
  
  activeSessions.set(sessionId, session);
  console.log(`⏰ Extended session ${sessionId}, new expiry: ${new Date(session.expiresAt).toISOString()}`);
  
  return session;
}

/**
 * Challenge Management Functions
 */

export function createChallenge(challengeId: string, walletAddress: string, challenge: string): AuthChallenge {
  const now = Date.now();
  const challengeExpiryMinutes = parseInt(process.env.CHALLENGE_EXPIRY_MINUTES || '5');
  const expiresAt = now + (challengeExpiryMinutes * 60 * 1000);
  
  const challengeData: AuthChallenge = {
    challenge,
    walletAddress: walletAddress.toLowerCase(),
    timestamp: now,
    expiresAt
  };
  
  activeChallenges.set(challengeId, challengeData);
  console.log(`🎯 Created challenge ${challengeId} for wallet ${walletAddress}, expires: ${new Date(expiresAt).toISOString()}`);
  
  return challengeData;
}

export function getChallenge(challengeId: string): AuthChallenge | null {
  const challenge = activeChallenges.get(challengeId);
  
  if (!challenge) {
    return null;
  }
  
  // Check if challenge is expired
  if (challenge.expiresAt < Date.now()) {
    activeChallenges.delete(challengeId);
    console.log(`🗑️ Removed expired challenge ${challengeId}`);
    return null;
  }
  
  return challenge;
}

export function consumeChallenge(challengeId: string): AuthChallenge | null {
  const challenge = getChallenge(challengeId);
  
  if (challenge) {
    activeChallenges.delete(challengeId);
    console.log(`✅ Consumed challenge ${challengeId}`);
  }
  
  return challenge;
}

/**
 * Cleanup Functions
 */

export function cleanupExpiredSessions(): number {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(sessionId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
  }
  
  return cleanedCount;
}

export function cleanupExpiredChallenges(): number {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [challengeId, challenge] of activeChallenges.entries()) {
    if (challenge.expiresAt < now) {
      activeChallenges.delete(challengeId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired challenges`);
  }
  
  return cleanedCount;
}

/**
 * Statistics Functions
 */

export function getSessionStats() {
  return {
    activeSessions: activeSessions.size,
    activeChallenges: activeChallenges.size,
    timestamp: Date.now()
  };
}

export function getAllActiveSessions(): AuthSession[] {
  const now = Date.now();
  return Array.from(activeSessions.values()).filter(session => session.expiresAt > now);
}

/**
 * Initialize cleanup intervals
 */

// Auto-cleanup expired sessions
setInterval(() => {
  cleanupExpiredSessions();
}, SESSION_CLEANUP_INTERVAL);

// Auto-cleanup expired challenges  
setInterval(() => {
  cleanupExpiredChallenges();
}, CHALLENGE_CLEANUP_INTERVAL);

console.log('🔄 Session cleanup intervals initialized');
console.log(`📊 Session cleanup: every ${SESSION_CLEANUP_INTERVAL / 1000 / 60} minutes`);
console.log(`📊 Challenge cleanup: every ${CHALLENGE_CLEANUP_INTERVAL / 1000 / 60} minutes`); 