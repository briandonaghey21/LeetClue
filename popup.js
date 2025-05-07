chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url || "";
    if (!url.includes("leetcode.com")) {
      document.body.innerHTML = "<p>This extension only works on <strong>leetcode.com</strong>.</p>";
    } else {
      document.getElementById("getHint").addEventListener("click", () => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_TITLE" }, (response) => {
          if (!response || !response.title) {
            document.getElementById("hintResult").textContent = "Could not find problem title.";
            return;
          }
  
          const title = response.title.toLowerCase();
          console.log("Title:", title);
  
          // TODO get dom reference to title and then the description
          
        });
      });
    }
  });
  