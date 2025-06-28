// sidepanel.js - Side panel functionality
document.addEventListener("DOMContentLoaded", () => {
    const hintContainer = document.getElementById("hintContainer");
    const problemInfo = document.getElementById("problemInfo");
    const problemTitle = document.getElementById("problemTitle");
    const getHintBtn = document.getElementById("getHint");
    const clearHintsBtn = document.getElementById("clearHints");
    
    let description = "";
    let title = "";
    let hintCache = [];
    let hintCount = 0;

    // Initialize the side panel
    initializeSidePanel();

    async function initializeSidePanel() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes("leetcode.com")) {
                showNoProblemMessage();
                return;
            }

            // Inject content script if needed
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["content.js"]
                });
            } catch (error) {
                console.log("Content script already injected or injection failed:", error);
            }

            // Get problem information
            await loadProblemInfo(tab.id);
            
        } catch (error) {
            console.error("Error initializing side panel:", error);
            showError("Failed to initialize extension");
        }
    }

    async function loadProblemInfo(tabId) {
        try {
            // Get problem title
            const titleResponse = await chrome.tabs.sendMessage(tabId, { 
                type: "GET_PROBLEM_TITLE" 
            });
            
            if (titleResponse?.title) {
                title = titleResponse.title;
                problemTitle.textContent = `Problem: ${title}`;
                problemInfo.style.display = "block";
            }

            // Get problem description
            const descResponse = await chrome.tabs.sendMessage(tabId, { 
                type: "GET_PROBLEM_DESCRIPTION" 
            });
            
            if (descResponse?.description) {
                description = descResponse.description;
            }

            // Enable hint button if we have both title and description
            if (title && description) {
                getHintBtn.disabled = false;
                getHintBtn.textContent = "Get Hint";
            } else {
                getHintBtn.textContent = "Problem not detected";
            }

        } catch (error) {
            console.error("Error loading problem info:", error);
            showError("Could not load problem information");
        }
    }

    function showNoProblemMessage() {
        hintContainer.innerHTML = `
            <div class="no-problem">
                <h3>Navigate to LeetCode</h3>
                <p>This extension only works on leetcode.com problem pages.</p>
            </div>
        `;
    }

    function showError(message) {
        const errorElement = document.createElement("div");
        errorElement.className = "error";
        errorElement.textContent = message;
        hintContainer.appendChild(errorElement);
    }

    function showLoading() {
        const loadingElement = document.createElement("div");
        loadingElement.className = "loading";
        loadingElement.textContent = "Generating hint...";
        loadingElement.id = "loading";
        hintContainer.appendChild(loadingElement);
    }

    function hideLoading() {
        const loadingElement = document.getElementById("loading");
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    async function requestNewHint(title, description) {
        if (!title || !description) {
            showError("Problem information not available");
            return;
        }

        getHintBtn.disabled = true;
        getHintBtn.textContent = "Generating...";
        showLoading();

        try {
            const response = await fetch("http://localhost:3000/api/generate-hint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, cache: hintCache })
            });

            const data = await response.json();

            if (data?.hint && !hintCache.includes(data.hint)) {
                hintCache.push(data.hint);
                hintCount++;
                
                const hintElement = document.createElement("div");
                hintElement.className = "hint-card";
                
                const hintNumber = document.createElement("div");
                hintNumber.className = "hint-number";
                hintNumber.textContent = `Hint ${hintCount}`;
                
                const hintText = document.createElement("div");
                hintText.textContent = data.hint;
                
                hintElement.appendChild(hintNumber);
                hintElement.appendChild(hintText);
                hintContainer.appendChild(hintElement);

                // Show clear button if we have hints
                if (hintCount > 0) {
                    clearHintsBtn.style.display = "block";
                }
            } else {
                showError("Could not generate a new hint or hint already exists");
            }
        } catch (error) {
            console.error("Error fetching hint:", error);
            showError("Failed to get hint. Make sure your server is running.");
        } finally {
            hideLoading();
            getHintBtn.disabled = false;
            getHintBtn.textContent = "Get Another Hint";
        }
    }

    function clearAllHints() {
        hintContainer.innerHTML = "";
        hintCache = [];
        hintCount = 0;
        clearHintsBtn.style.display = "none";
        getHintBtn.textContent = "Get Hint";
    }

    // Event listeners
    getHintBtn.addEventListener("click", () => {
        if (title && description) {
            requestNewHint(title, description);
        }
    });

    clearHintsBtn.addEventListener("click", clearAllHints);

    // Listen for tab changes to refresh problem info
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.active && tab.url?.includes('leetcode.com')) {
            // Reset state
            title = "";
            description = "";
            clearAllHints();
            problemInfo.style.display = "none";
            getHintBtn.disabled = true;
            getHintBtn.textContent = "Loading...";
            
            // Reload problem info
            setTimeout(() => loadProblemInfo(tabId), 1000);
        }
    });
});