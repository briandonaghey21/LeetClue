// waits for Dom to load
document.addEventListener("DOMContentLoaded", () => {
    const output = document.getElementById("hintResult");

    // session cache for hints
    const hintCache = [];
    async function requestNewHint(title, description) {
        try {
            const response = await fetch("http://localhost:3000/api/generate-hint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, cache: hintCache })
            });

            const data = await response.json();

            if (data?.hint && !hintCache.includes(data.hint)) {
                hintCache.push(data.hint);
            }

            output.textContent = data?.hint || "No hint generated.";
        } catch (error) {
            console.error("Error fetching hint:", error);
            output.textContent = "Failed to get a hint.";
        }
    }

  // get curent window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const tabId = tab.id;
    // check if its on leetcoode
    if (!tab.url.includes("leetcode.com")) {
      output.textContent = "This extension only works on leetcode.com";
      return;
    }
    // start content.js script
    chrome.scripting.executeScript(
      { target: { tabId }, files: ["content.js"] },
      () => {
        if (chrome.runtime.lastError) {
          output.textContent = "Script injection failed.";
          console.error("Injection error:", chrome.runtime.lastError.message);
          return;
        }

        // get the problem title
        let description;
        let title;
        chrome.tabs.sendMessage(tabId, { type: "GET_PROBLEM_TITLE" }, (response) => {
          if (chrome.runtime.lastError) {
            output.textContent = "Content script didn't respond.";
            console.warn("Message error:", chrome.runtime.lastError.message);
            return;
          }

          if (response?.title) {
            output.textContent = `Problem: ${response.title}`;
            title = response.title;

            // if both title and description already available, request hint
            if (description) requestNewHint(title, description);
          } else {
            output.textContent = "Problem title not found.";
          }
        });

        // gets the problem description
        chrome.tabs.sendMessage(tabId, { type: "GET_PROBLEM_DESCRIPTION" }, (response) => {
          if (chrome.runtime.lastError) {
            output.textContent = "Content script didn't respond.";
            console.warn("Message error:", chrome.runtime.lastError.message);
            return;
          }
          if (response?.description) {
            description = response.description;

            // if both title and description already available, request hint
            if (title) requestNewHint(title, description);
          } else {
            console.error("Description not found");
          }
        });
      }
    );
  });
});

  