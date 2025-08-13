(() => {
  let nav = "";
  let currentCourse = "";
  let scrapedContent = "";
  let currentStudySet = "";

  const newCourseUploaded = () => {
    console.log(`New course uploaded: ${currentCourse}`);
    // Your logic to handle a new course upload
  };

  const OpenStudySet = () => {
    return () => {
      console.log("Study Set Opened");
      // Optional: display the currentStudySet here
    };
  };

  async function generateStudyGuide(content) {
    try {
      const aiResponse = await chrome.runtime.sendMessage({
        type: "GENERATE_STUDY_SET",
        content: JSON.stringify(content),
      });
       
      return aiResponse;
    } catch (err) {
      console.error("Failed to generate study set", err);
      throw err;
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrape") {
      (async () => {

        // Scrape the content of the page. Update h1. 
        const headings = [...document.querySelectorAll("h1, h2, h3, p")].map(h => h.textContent.trim());
        const links = [...document.querySelectorAll("a")].map(a => a.href);

        scrapedContent = { headings, links }; // assign to outer variable

        try {
          const aiResponse = await generateStudyGuide(scrapedContent);
          // currentStudySet = aiResponse;
          sendResponse( aiResponse ); 
        } catch (err) {
          sendResponse({ error: err.message });
        }

        
      })();

      return true; // Keeps message channel open for async response
    }

    // Inject button if it doesn't exist yet
    const studySetExists = document.getElementsByClassName("study-set")[0];

    if (!studySetExists) {
      const studySetBtn = document.createElement("img");

      studySetBtn.id = "studySetBtn";
      studySetBtn.src = chrome.runtime.getURL("assets/study-set.png");

      studySetBtn.addEventListener("mouseover", () => {
        studySetBtn.src = chrome.runtime.getURL("assets/study-set-hover.png");
      });

      studySetBtn.addEventListener("mouseout", () => {
        studySetBtn.src = chrome.runtime.getURL("assets/study-set.png");
      });

      studySetBtn.style.width = "30px";
      studySetBtn.style.height = "30px";
      studySetBtn.style.cursor = "pointer";
      studySetBtn.title = "Create Study Set";
      studySetBtn.classList.add("study-set");

      nav = document.getElementsByClassName("right-of-crumbs")[0];
      if (nav) {
        nav.appendChild(studySetBtn);
      }

      studySetBtn.addEventListener("click", OpenStudySet());
    }

    return true;
  });
})();
