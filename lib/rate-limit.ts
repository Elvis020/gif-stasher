/**
 * Simple in-memory rate limiter
 * For production, use Redis (Upstash, Vercel KV) for distributed rate limiting
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory storage (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    maxRequests: number; // Max requests allowed
    windowMs: number;     // Time window in milliseconds
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Check if a request is allowed based on rate limits
 * @param userId - User identifier
 * @param action - Action type (e.g., 'create_link', 'process_video')
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
    userId: string,
    action: string,
    config: RateLimitConfig
): RateLimitResult {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // No existing entry or window expired
    if (!entry || now > entry.resetTime) {
        const newEntry: RateLimitEntry = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        rateLimitStore.set(key, newEntry);

        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime: newEntry.resetTime,
        };
    }

    // Window still active
    if (entry.count < config.maxRequests) {
        entry.count += 1;
        return {
            allowed: true,
            remaining: config.maxRequests - entry.count,
            resetTime: entry.resetTime,
        };
    }

    // Rate limit exceeded
    return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
    };
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
    CREATE_LINK: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 links per hour
    PROCESS_VIDEO: { maxRequests: 10, windowMs: 10 * 60 * 1000 }, // 10 video processing per 10 minutes
    DELETE_LINK: { maxRequests: 30, windowMs: 60 * 60 * 1000 }, // 30 deletes per hour
    CREATE_FOLDER: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 folders per hour
} as const;
