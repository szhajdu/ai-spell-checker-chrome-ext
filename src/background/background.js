import { ProviderFactory } from '../provider/provider-factory.js';

// Create context menu on installation.
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'spellCheck',
        title: 'Check Spelling',
        contexts: ['selection'] // Show only when text is highlighted
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'spellCheck' && info.selectionText) {
        handleSpellCheck(info.selectionText, tab);
    }
});

// Process text with selected AI provider
async function handleSpellCheck(selectedText, tab) {
    try {
        // Get settings from storage
        const settings = await chrome.storage.sync.get(['apiKey', 'providerType', 'providerOptions']);
        const { apiKey, providerType = 'openai', providerOptions = {} } = settings;

        if (!apiKey) {
            showNotification('API Key Missing', 'Please set your API key in the extension settings.');
            chrome.runtime.openOptionsPage();
            return;
        }

        const provider = await ProviderFactory.getProvider(providerType, apiKey, providerOptions);
        const correctedText = await provider.processText(selectedText);

        // Send corrected text to content script
        sendTextToContentScript(tab, correctedText);

    } catch (error) {
        handleError(error);
    }
}

function sendTextToContentScript(tab, correctedText) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
            console.error('Error querying active tab:', chrome.runtime.lastError);
            return;
        }

        if (tabs && tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'replaceText',
                text: correctedText
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message to content script:', chrome.runtime.lastError);
                    return;
                }

                if (response && response.success) {
                    console.log('Text successfully replaced.');
                } else {
                    console.warn('Failed to replace text in content script.',
                        response ? response.error : 'No response received.');
                }
            });
        } else {
            console.error('No active tab found to send the corrected text to.');
        }
    });
}

function handleError(error) {
    console.error('Error:', error);
    let errorMessage = 'An error occurred. Please try again.';

    if (error.message.includes('Invalid API Key')) {
        errorMessage = 'Invalid API Key. Please check your settings.';
    } else if (error.message.includes('Rate Limit Exceeded')) {
        errorMessage = 'Rate limit exceeded. Please wait and try again later.';
    }

    showNotification('Error', errorMessage);
}

function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: title,
        message: message
    });
}
