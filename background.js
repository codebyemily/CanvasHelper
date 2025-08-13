

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url?.startsWith("chrome://")) return undefined;
  
  if (tab.url && tab.url.includes("instructure.com")) {
    try {
      const url = new URL(tab.url);
      const path = url.pathname;

      const match = path.match(/\/courses\/(\d+)/);
      const courseId = match ? match[1] : null;

      if (courseId) {
        chrome.tabs.sendMessage(tabId, {
          type: "NEW",
          courseId: courseId
        });
      } else {
        console.warn("Course ID not found in URL");
      }
    } catch (e) {
      console.error("Invalid URL", e);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GENERATE_STUDY_SET") {

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            content: message.content 
          }),
        });

        const data = await res.json();

        sendResponse(data);
      } catch (err) {
        console.error("API Error:", err);
        sendResponse({ error: "API call failed" });
      }
    })();

    return true; // Required for async sendResponse
  }
});

