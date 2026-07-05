const remotiveProvider = require('./remotiveProvider');
const arbeitnowProvider = require('./arbeitnowProvider');
const mockProviders = require('./mockProviders');

/**
 * Provider Manager
 * Coordinates fetching, caching, and retrying for external job sources.
 */
class ProviderManager {
  constructor() {
    this.providers = [
      remotiveProvider,
      arbeitnowProvider
    ];
    // List of mock sources to generate
    this.mockSources = ['LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'Wellfound', 'RemoteOK', 'Adzuna', 'JSearch'];

    // In-memory Cache Settings
    this.cachedJobs = [];
    this.lastFetched = null;
    this.cacheDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
  }

  /**
   * Helper to execute async functions with retry-on-failure
   */
  async retryFetch(fetchFn, retries = 3, delay = 1000) {
    try {
      return await fetchFn();
    } catch (error) {
      if (retries <= 1) throw error;
      console.warn(`[Retry Warning]: Retrying fetch. Attempts remaining: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryFetch(fetchFn, retries - 1, delay * 2);
    }
  }

  /**
   * Main orchestrator to fetch from all providers
   */
  async loadAllExternalJobs() {
    console.log('[ProviderManager]: Launching external jobs fetch...');
    
    // Create fetch promises for real APIs (using retry wrapper)
    const apiPromises = this.providers.map(provider => 
      this.retryFetch(() => provider.fetchJobs())
        .catch(err => {
          console.error(`[ProviderManager Alert]: ${provider.name} failed after retries:`, err.message);
          return []; // Return empty array to keep other feeds loading
        })
    );

    // Create fetch promises for mock sources
    const mockPromises = this.mockSources.map(source =>
      mockProviders.fetchJobs(source)
        .catch(err => {
          console.error(`[ProviderManager Alert]: Mock ${source} failed:`, err.message);
          return [];
        })
    );

    const allPromises = [...apiPromises, ...mockPromises];
    const results = await Promise.allSettled(allPromises);

    const combined = [];
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        combined.push(...result.value);
      }
    });

    console.log(`[ProviderManager]: Fetch complete! Loaded ${combined.length} external jobs.`);
    this.cachedJobs = combined;
    this.lastFetched = Date.now();
    return combined;
  }

  /**
   * Fetches cached or fresh jobs
   */
  async getExternalJobs() {
    const isStale = !this.lastFetched || (Date.now() - this.lastFetched > this.cacheDuration);
    
    if (isStale) {
      console.log('[ProviderManager]: Cache is stale or empty. Refreshing...');
      try {
        await this.loadAllExternalJobs();
      } catch (err) {
        console.error('[ProviderManager]: Global load failed, returning stale cache:', err.message);
      }
    } else {
      console.log(`[ProviderManager]: Serving ${this.cachedJobs.length} jobs from cache.`);
    }

    return this.cachedJobs;
  }
}

module.exports = new ProviderManager();
