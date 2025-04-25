/**
 * Base API client for making requests to the backend.
 * This module provides a common interface for making API requests with retry logic.
 */

export class ApiClient {
  private baseUrl: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(baseUrl: string, maxRetries = 3, retryDelay = 1000) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Make a fetch request with retry logic.
   *
   * @param path The API path to fetch
   * @param options The fetch options
   * @returns The response data
   */
  async fetchWithRetry(path: string, options: RequestInit = {}): Promise<any> {
    let retries = 0;
    let lastError: Error | null = null;

    // Add timeout to fetch options if not already set
    if (!options.signal) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      options.signal = controller.signal;

      // Clean up timeout after fetch completes
      const cleanup = () => clearTimeout(timeoutId);

      // Ensure cleanup happens regardless of success or failure
      try {
        const result = await this._doFetchWithRetry(path, options, retries, lastError);
        cleanup();
        return result;
      } catch (error) {
        cleanup();
        throw error;
      }
    } else {
      // If signal is already set, just do the fetch
      return this._doFetchWithRetry(path, options, retries, lastError);
    }
  }

  /**
   * Internal method to handle fetch with retry logic
   */
  private async _doFetchWithRetry(
    path: string,
    options: RequestInit,
    retries: number = 0,
    lastError: Error | null = null
  ): Promise<any> {
    while (retries < this.maxRetries) {
      try {
        console.log(`Fetching ${this.baseUrl}${path} (attempt ${retries + 1}/${this.maxRetries})`);

        const response = await fetch(`${this.baseUrl}${path}`, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        // Try to parse as JSON, but handle non-JSON responses gracefully
        try {
          return await response.json();
        } catch (jsonError) {
          console.warn("Response is not valid JSON, returning text content");
          return { text: await response.text() };
        }
      } catch (error) {
        lastError = error as Error;
        retries++;

        console.warn(`Fetch attempt ${retries}/${this.maxRetries} failed: ${lastError.message}`);

        if (retries < this.maxRetries) {
          // Exponential backoff with jitter
          const delay = this.retryDelay * Math.pow(2, retries - 1) * (0.5 + Math.random() * 0.5);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to fetch after multiple retries');
  }

  /**
   * Check if the backend is available.
   *
   * @returns True if the backend is available, false otherwise
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error checking backend availability:', error);
      return false;
    }
  }

  /**
   * Get detailed health information from the backend.
   *
   * @returns The health information
   */
  async getHealthInfo(): Promise<any> {
    try {
      const healthData = await this.fetchWithRetry('/health');
      console.log('Backend health info:', healthData);

      // Check for OpenAI Agents SDK availability
      const openaiAgentsAvailable = healthData?.services?.openai_agents?.available || false;

      // Check for LangGraph availability
      const langgraphAvailable = healthData?.services?.langgraph?.available || false;

      // Check current framework mode
      const currentFramework = healthData?.framework || 'unknown';

      // Add additional information to the health data
      return {
        ...healthData,
        clientInfo: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          openaiAgentsAvailable,
          langgraphAvailable,
          currentFramework
        }
      };
    } catch (error) {
      console.error('Error getting health info:', error);
      return {
        status: 'error',
        error: error.message || 'Unknown error',
        clientInfo: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      };
    }
  }
}
