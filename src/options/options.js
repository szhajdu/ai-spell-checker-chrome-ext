import { ProviderFactory } from '../provider/provider-factory.js';
import './options.css';

// Toggle Password Visibility
const togglePassword = document.getElementById('togglePassword');
const apiKeyInput = document.getElementById('apiKey');
togglePassword.addEventListener('click', () => {
    const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
    apiKeyInput.setAttribute('type', type);
    togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Dark Mode Toggle
const toggleDarkMode = document.getElementById('toggleDarkMode');
toggleDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    toggleDarkMode.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

    // Save dark mode preference
    chrome.storage.sync.set({ darkMode: isDarkMode });
});

// Update provider options UI based on selected provider
function updateProviderOptions(providerType, savedOptions = {}) {
    const optionsContainer = document.getElementById('providerOptions');
    optionsContainer.innerHTML = '';

    // Add provider-specific options based on the selected provider
    switch (providerType) {
        case 'openai':
            // Add OpenAI-specific options
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

            // Set default model if not saved previously
            if (!savedOptions.model) {
                modelSelect.value = 'gpt-3.5-turbo';
            }

            modelGroup.appendChild(modelLabel);
            modelGroup.appendChild(modelSelect);
            optionsContainer.appendChild(modelGroup);
            break;

        // Add cases for other providers as they're implemented

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

    // Collect provider-specific options
    const providerOptions = {};

    switch (providerType) {
        case 'openai':
            const model = document.getElementById('openai-model')?.value;
            if (model) {
                providerOptions.model = model;
            }
            break;
        // Add cases for other providers as they're implemented
    }

    chrome.storage.sync.set({
        apiKey: apiKey,
        providerType: providerType,
        providerOptions: providerOptions
    }, () => {
        const statusElement = document.getElementById('status');
        statusElement.style.display = 'block';
        statusElement.textContent = 'Settings saved successfully!';
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    });
});

// Load saved settings on page load
document.addEventListener('DOMContentLoaded', () => {
    // Populate provider dropdown
    const providerSelect = document.getElementById('providerType');
    ProviderFactory.getAvailableProviders().forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = provider.charAt(0).toUpperCase() + provider.slice(1);
        providerSelect.appendChild(option);
    });

    // Load settings from storage
    chrome.storage.sync.get(['apiKey', 'providerType', 'providerOptions', 'darkMode'], (data) => {
        // Set API key
        if (data.apiKey) {
            document.getElementById('apiKey').value = data.apiKey;
        }

        // Set provider type
        if (data.providerType) {
            document.getElementById('providerType').value = data.providerType;
        } else {
            document.getElementById('providerType').value = 'openai'; // Default
        }

        // Update provider options UI
        updateProviderOptions(
            data.providerType || 'openai',
            data.providerOptions || {}
        );

        // Apply dark mode if saved
        if (data.darkMode) {
            document.body.classList.add('dark-mode');
            toggleDarkMode.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });

    // Update provider options when provider changes
    document.getElementById('providerType').addEventListener('change', function() {
        chrome.storage.sync.get('providerOptions', (data) => {
            const savedOptions = data.providerOptions || {};
            updateProviderOptions(this.value, savedOptions);
        });
    });
});
