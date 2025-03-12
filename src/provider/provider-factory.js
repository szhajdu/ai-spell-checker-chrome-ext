import { OpenAIProvider } from './openai-provider.js';

export class ProviderFactory {
  static async getProvider(providerType, apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    switch (providerType) {
      case 'openai':
        return new OpenAIProvider(apiKey, options);
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  static getAvailableProviders() {
    return ['openai'];
  }
}
