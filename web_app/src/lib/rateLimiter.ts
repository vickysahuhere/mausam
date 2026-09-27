/**
 * Client-Side Token Bucket Rate Limiter
 * Guards external endpoints from unintentional denial-of-service, rapid typing storms,
 * and high-frequency background sync loops.
 */

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

export class RateLimiter {
  private buckets: Map<string, Bucket> = new Map();

  /**
   * Evaluates if an action is permitted under the token bucket limits.
   *
   * @param key Unique identifier for the rate-limited resource (e.g. 'city_search', 'weather_sync')
   * @param capacity Maximum burst capacity of tokens
   * @param refillTokensPerSec Number of tokens replenished per second
   * @param cost Cost of this invocation (default 1)
   * @returns boolean true if action is allowed, false if rate limited
   */
  public tryAcquire(
    key: string,
    capacity: number = 5,
    refillTokensPerSec: number = 1,
    cost: number = 1
  ): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: capacity - cost,
        lastRefillMs: now,
      };
      this.buckets.set(key, bucket);
      return true;
    }

    // Refill tokens proportional to elapsed time
    const elapsedSecs = (now - bucket.lastRefillMs) / 1000;
    bucket.tokens = Math.min(capacity, bucket.tokens + elapsedSecs * refillTokensPerSec);
    bucket.lastRefillMs = now;

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return true;
    }

    return false;
  }

  /**
   * Clears rate limit state for a key or all keys
   */
  public reset(key?: string) {
    if (key) {
      this.buckets.delete(key);
    } else {
      this.buckets.clear();
    }
  }
}

export const globalRateLimiter = new RateLimiter();
