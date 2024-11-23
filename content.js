chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'replaceText') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(message.correctedText));
            sendResponse({ success: true });
        }
    } else if (message.action === 'writeClipboard') {
        navigator.clipboard.writeText(message.text)
            .then(() => {
                console.log('Text copied to clipboard:', message.text);
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
            });
    }
});
