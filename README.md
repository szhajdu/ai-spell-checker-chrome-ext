# AI Spell Checker Chrome Extension

This Chrome Extension allows you to check and correct the spelling of highlighted text on a webpage using OpenAI's ChatGPT. The action can be executed from the context menu.

## Features

- **Context Menu Integration**: Right-click on highlighted text to access the spell check option.
- **AI-Powered Spell Checking**: Utilizes OpenAI's GPT-3.5-turbo model to correct spelling.
- **Clipboard Integration**: Copies the corrected text to the clipboard.
- **Text Replacement**: Replaces the highlighted text on the webpage with the corrected version.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/szhajdu/ai-spell-checker-chrome-ext.git
    ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the cloned repository folder.

## Usage

1. Highlight the text you want to check for spelling errors.
2. Right-click to open the context menu.
3. Select "Check Spelling".
4. The extension will use OpenAI's API to correct the spelling and replace the highlighted text with the corrected version.

## Configuration

1. Open the extension settings by navigating to the options page.
2. Enter your OpenAI API key in the provided field.
