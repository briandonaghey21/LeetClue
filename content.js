
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PROBLEM_TITLE") {
    const ele = document.querySelector(
      'a[href^="/problems/"].no-underline.truncate.cursor-text'
    );

    if (ele && ele.textContent.includes(".")) {
      console.log("Title:", ele.textContent.trim());
      sendResponse({ title: ele.textContent.trim() });
    } else {
      console.warn("Could not find the title");
      sendResponse({ title: null });
    }
  }
});

  