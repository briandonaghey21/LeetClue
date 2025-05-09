document.addEventListener("DOMContentLoaded", () => {
    const hintContainer = document.getElementById("hintContainer");
    let description;
    let title;
    let hintCache = [];
  
    document.getElementById("getHint").addEventListener("click", () => {
      if (title && description) {
        requestNewHint(title, description);
      } 
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
            const hintElement = document.createElement("div");
            hintElement.className = "hint-card";
            hintElement.textContent = data.hint;
            hintContainer.appendChild(hintElement);
          }
        } catch (error) {
          console.error("Error fetching hint:", error);
          const errEl = document.createElement("p");
          errEl.textContent = "Failed to get a hint.";
          hintContainer.appendChild(errEl);
        }
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const tabId = tab.id;
  
      if (!tab.url.includes("leetcode.com")) {
        hintContainer.textContent = "This extension only works on leetcode.com";
        return;
      }
  
      chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }, () => {
        if (chrome.runtime.lastError) {
          hintContainer.textContent = "Script injection failed.";
          console.error("Injection error:", chrome.runtime.lastError.message);
          return;
        }
  
        chrome.tabs.sendMessage(tabId, { type: "GET_PROBLEM_TITLE" }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn("Message error:", chrome.runtime.lastError.message);
            return;
          }
          if (response?.title) {
            title = response.title;
            const titleEl = document.createElement("p");
            titleEl.textContent = `Problem: ${title}`;
            hintContainer.appendChild(titleEl);
          }
        });
  
        chrome.tabs.sendMessage(tabId, { type: "GET_PROBLEM_DESCRIPTION" }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn("Message error:", chrome.runtime.lastError.message);
            return;
          }
          if (response?.description) {
            description = response.description;
          }
        });
      });
    });
  });
  