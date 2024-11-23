// Create context menu on installation.
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "spellCheck",
        title: "Check Spelling",
        contexts: ["selection"] // Show only when text is highlighted
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "spellCheck" && info.selectionText) {
        const selectedText = info.selectionText;

        // Retrieve the API key from Chrome storage
        chrome.storage.sync.get("apiKey", (data) => {
            const apiKey = data.apiKey;

            if (!apiKey) {
                // Notify the user to set the API key.
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "API Key Missing",
                    message: "Please set your OpenAI API key in the extension settings."
                });
                return;
            }

            // Proceed with API request if the key exists
            fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: `Correct spelling: ${selectedText}` }]
                })
            })
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error("Invalid API Key");
                        } else if (response.status === 429) {
                            throw new Error("Rate Limit Exceeded");
                        } else {
                            throw new Error(`API Error: ${response.status} ${response.statusText}`);
                        }
                    }

                    return response.json();
                })
                .then(data => {
                    const correctedText = data.choices[0].message.content;

                    // Show the corrected text in a notification
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icon.png",
                        title: "Spelling Suggestions",
                        message: correctedText
                    });

                    // Send corrected text to content script.
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: "writeClipboard",
                            text: correctedText
                        });
                    });
                })
                .catch(error => {
                    console.error("Error:", error);
                    let errorMessage = "An error occurred. Please try again.";
                    if (error.message.includes("Invalid API Key")) {
                        errorMessage = "Invalid API Key. Please check your settings.";
                    } else if (error.message.includes("Rate Limit Exceeded")) {
                        errorMessage = "Rate limit exceeded. Please wait and try again later.";
                    }

                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icon.png",
                        title: "Error",
                        message: errorMessage
                    });
                });
        });
    }
});