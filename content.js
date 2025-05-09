chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PROBLEM_TITLE") {
    const ele = document.querySelector(
      'a[href^="/problems/"].no-underline.truncate.cursor-text'
    );

    if (ele && ele.textContent.includes(".")) {
      sendResponse({ title: ele.textContent.trim() });
    } else {
      console.warn("Could not find the title");
      sendResponse({ title: null });
    }
  }
  else  if (request.type === "GET_PROBLEM_DESCRIPTION") {
    const container = document.querySelector('div[data-track-load="description_content"]');
    if (!container) {
      console.warn("Could not find the descsription")
      sendResponse({ description: null });
      return;
    }

    const elements = container.querySelectorAll('p, pre');
    const description = Array.from(elements)
      .map(el => {
        if (el.tagName.toLowerCase() === 'pre') {
          return `\n\`\`\`\n${el.textContent.trim()}\n\`\`\``; 
        }
        return el.textContent.trim();
      })
      .filter(Boolean)
      .join('\n\n');

    sendResponse({ description });
    return true;
  }
});

  