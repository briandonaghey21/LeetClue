// background.js - Service worker for managing side panel
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url) return;
    
    // Enable side panel only on LeetCode pages
    if (tab.url.includes('leetcode.com')) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel.html',
        enabled: true
      });
    } else {
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
      });
    }
  });
  
  // Handle side panel opening from popup or action button
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url && tab.url.includes('leetcode.com')) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  });
  
  // Optional: Listen for side panel state changes
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "OPEN_SIDE_PANEL") {
      chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        if (tabs[0] && tabs[0].url.includes('leetcode.com')) {
          await chrome.sidePanel.open({ tabId: tabs[0].id });
        }
      });
    }
  });