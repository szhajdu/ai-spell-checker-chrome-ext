export class AIProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    // eslint-disable-next-line no-unused-vars
    async processText(text, options = {}) {
        throw new Error('Method not implemented');
    }

    getName() {
        return 'Base Provider';
    }
}
