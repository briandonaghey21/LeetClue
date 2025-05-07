document.addEventListener("DOMContentLoaded", () => {
    const output = document.getElementById("hintResult");
  
    document.getElementById("getHint").addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        const tabId = tab.id;
  
        if (!tab.url.includes("leetcode.com")) {
          output.textContent = "This extension only works on leetcode.com";
          return;
        }
  
        chrome.scripting.executeScript(
          { target: { tabId }, files: ["content.js"] },
          () => {
            if (chrome.runtime.lastError) {
              output.textContent = "Script injection failed.";
              console.error("Injection error:", chrome.runtime.lastError.message);
              return;
            }
  
         
            chrome.tabs.sendMessage(tabId, { type: "GET_PROBLEM_TITLE" }, (response) => {
              if (chrome.runtime.lastError) {
                output.textContent = "Content script didn't respond.";
                console.warn("Message error:", chrome.runtime.lastError.message);
                return;
              }
  
              if (response?.title) {
                output.textContent = `Problem: ${response.title}`;
              } else {
                output.textContent = "Problem title not found.";
              }
            });
          }
        );
      });
    });
  });
  