// Save the API key
document.getElementById("settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const apiKey = document.getElementById("apiKey").value;

    chrome.storage.sync.set({ apiKey: apiKey }, () => {
        document.getElementById("status").textContent = "API Key saved successfully!";
        setTimeout(() => {
            document.getElementById("status").textContent = "";
        }, 2000);
    });
});

// Load the saved API key on page load
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("apiKey", (data) => {
        if (data.apiKey) {
            document.getElementById("apiKey").value = data.apiKey;
        }
    });
});
