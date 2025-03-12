import { ProviderFactory } from '../provider/provider-factory.js';
import './options.css';

// Toggle Password Visibility
document.getElementById('togglePassword').addEventListener('click', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
    apiKeyInput.setAttribute('type', type);
    document.getElementById('togglePassword').innerHTML =
        type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Theme handling
const themeSwitcher = document.getElementById('themeSwitcher');
const colorPickers = document.querySelectorAll('.color-picker');
const root = document.documentElement;

// Set up theme switcher
function setupThemeSwitcher() {
    const themes = {
        'light': {
            '--bg-color': '#f5f7fa',
            '--card-bg': '#ffffff',
            '--text-color': '#333333',
            '--primary-color': '#4285f4',
            '--secondary-color': '#f8f9fa',
            '--border-color': '#e0e0e0',
            '--input-bg': '#ffffff',
            '--input-border': '#cccccc'
        },
        'dark': {
            '--bg-color': '#1e1e2e',
            '--card-bg': '#2d2d3f',
            '--text-color': '#e4e4e4',
            '--primary-color': '#7289da',
            '--secondary-color': '#3b3b4f',
            '--border-color': '#444456',
            '--input-bg': '#3b3b4f',
            '--input-border': '#555566'
        },
        'blue': {
            '--bg-color': '#e6f0ff',
            '--card-bg': '#ffffff',
            '--text-color': '#2c3e50',
            '--primary-color': '#1a73e8',
            '--secondary-color': '#dce9f9',
            '--border-color': '#b8daff',
            '--input-bg': '#ffffff',
            '--input-border': '#90caf9'
        },
        'dark-purple': {
            '--bg-color': '#292639',
            '--card-bg': '#352f44',
            '--text-color': '#e9e9e9',
            '--primary-color': '#8a6af0',
            '--secondary-color': '#3c3553',
            '--border-color': '#4c4465',
            '--input-bg': '#3c3553',
            '--input-border': '#5d5175'
        }
    };

    // Populate theme switcher
    Object.keys(themes).forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        themeSwitcher.appendChild(option);
    });

    // Handle theme change
    themeSwitcher.addEventListener('change', () => {
        const selectedTheme = themeSwitcher.value;

        applyTheme(themes[selectedTheme]);

        chrome.storage.sync.set({ theme: selectedTheme });
    });

    // Load saved theme
    chrome.storage.sync.get(['theme'], (data) => {
        if (data.theme) {
            themeSwitcher.value = data.theme;

            applyTheme(themes[data.theme]);
        } else {
            // Default theme
            themeSwitcher.value = 'light';
            applyTheme(themes.light);
        }
    });
}

// Apply theme colors
function applyTheme(themeColors) {
    Object.entries(themeColors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
}

// Update provider options UI based on selected provider
function updateProviderOptions(providerType, savedOptions = {}) {
    const optionsContainer = document.getElementById('providerOptions');
    optionsContainer.innerHTML = '';

    switch (providerType) {
        case 'openai':
            const modelGroup = document.createElement('div');
            modelGroup.className = 'form-group';

            const modelLabel = document.createElement('label');
            modelLabel.textContent = 'Model';
            modelLabel.setAttribute('for', 'openai-model');

            const modelSelect = document.createElement('select');
            modelSelect.id = 'openai-model';
            modelSelect.name = 'model';

            const models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                if (savedOptions.model === model) {
                    option.selected = true;
                }
                modelSelect.appendChild(option);
            });

            if (!savedOptions.model) {
                modelSelect.value = 'gpt-3.5-turbo';
            }

            modelGroup.appendChild(modelLabel);
            modelGroup.appendChild(modelSelect);
            optionsContainer.appendChild(modelGroup);
            break;

        default:
            const message = document.createElement('p');
            message.textContent = 'No configurable options for this provider.';
            optionsContainer.appendChild(message);
    }
}

// Save settings
document.getElementById('settingsForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const apiKey = document.getElementById('apiKey').value;
    const providerType = document.getElementById('providerType').value;
    const promptTemplate = document.getElementById('promptTemplate').value || 'Correct spelling: {text}';

    // Collect provider-specific options
    const providerOptions = {};

    switch (providerType) {
        case 'openai':
            const model = document.getElementById('openai-model')?.value;
            if (model) {
                providerOptions.model = model;
            }
            break;
    }

    chrome.storage.sync.set({
        apiKey: apiKey,
        providerType: providerType,
        providerOptions: providerOptions,
        promptTemplate: promptTemplate
    }, () => {
        showStatus('Settings saved successfully!', 'success');
    });
});

function showStatus(message, type = 'success') {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';

    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 3000);
}

// Load saved settings on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set up theme system
    setupThemeSwitcher();

    // Populate provider dropdown
    const providerSelect = document.getElementById('providerType');
    ProviderFactory.getAvailableProviders().forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = provider.charAt(0).toUpperCase() + provider.slice(1);
        providerSelect.appendChild(option);
    });

    // Load settings from storage
    chrome.storage.sync.get(
        ['apiKey', 'providerType', 'providerOptions', 'promptTemplate'],
        (data) => {
            if (data.apiKey) {
                document.getElementById('apiKey').value = data.apiKey;
            }

            if (data.providerType) {
                document.getElementById('providerType').value = data.providerType;
            } else {
                document.getElementById('providerType').value = 'openai';
            }

            document.getElementById('promptTemplate').value = data.promptTemplate || 'Correct spelling: {text}';

            updateProviderOptions(
                data.providerType || 'openai',
                data.providerOptions || {}
            );
        });

    // Update provider options when provider changes
    document.getElementById('providerType').addEventListener('change', function () {
        chrome.storage.sync.get('providerOptions', (data) => {
            updateProviderOptions(this.value, data.providerOptions || {});
        });
    });
});
