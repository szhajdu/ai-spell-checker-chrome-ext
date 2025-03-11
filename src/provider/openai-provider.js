import { AIProvider } from './ai-provider.js';

export class OpenAIProvider extends AIProvider {
    constructor(apiKey) {
        super(apiKey);
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    }

    getName() {
        return 'OpenAI';
    }

    async processText(text, options = {}) {
        const model = options.model || 'gpt-3.5-turbo';

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: `Correct spelling: ${text}` }]
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API Key');
            } else if (response.status === 429) {
                throw new Error('Rate Limit Exceeded');
            } else {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
}
