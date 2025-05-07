chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_TITLE") {
      const problemTitleEl = document.querySelector('a[href^="/problems/"]');
      if (problemTitleEl) {
        sendResponse({ title: problemTitleEl.textContent.trim() });
      } else {
        sendResponse({ title: null });
      }
    }
    return true; 
  });
  