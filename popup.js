// waits for Dom to load
document.addEventListener("DOMContentLoaded", () => {
    const output = document.getElementById("hintResult");
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
              } else {
                output.textContent = "Problem title not found.";
              }
            });
            // gets the rpoblem description
            chrome.tabs.sendMessage(tabId, { type: "GET_PROBLEM_DESCRIPTION" }, (response) => {
                if (chrome.runtime.lastError) {
                    output.textContent = "Content script didn't respond.";
                    console.warn("Message error:", chrome.runtime.lastError.message);
                    return;
                  }
                 if (response?.description) {
                    description = response.description;
                 }
                 else {
                    console.error("Description not found");
                  }
            });
          }
        );
      });
  });
  