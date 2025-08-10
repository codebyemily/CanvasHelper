document.getElementById("scrapeBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log("Active tab URL:", tab.url);

  try {
    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["contentScript.js"],
    });

    // Delay briefly to give time for content.js to load
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
        document.getElementById("output").textContent = "Error: " + chrome.runtime.lastError.message;
      } else {
        //display the response
        const text = response.text.text
        const str = JSON.stringify(text, null, 2);
        
        let formatted = str.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

        document.getElementById("output").textContent = formatted;

      }
    });
  } catch (err) {
    console.error("Injection failed:", err);
    document.getElementById("output").textContent = "Script injection failed.";
  }
});
