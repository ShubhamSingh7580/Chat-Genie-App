let model;
let faqData = [];

async function loadModel() {
  console.log("Loading Universal Sentence Encoder model...");
  model = await use.load();
  console.log("Model loaded successfully");
}

function normalizeString(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}
async function calculateSimilarity(userQuestion, faqQuestions) {
  const embeddings = await model.embed([userQuestion, ...faqQuestions]);
  const userEmbedding = embeddings.slice([0, 0], [1, -1]);
  const faqEmbeddings = embeddings.slice([1, 0], [faqQuestions.length, -1]);

  const similarity = userEmbedding.matMul(faqEmbeddings, false, true);
  return similarity.dataSync();
}

async function findAnswer(userQuestion, faqData) {
  const normalizedUserQuestion = normalizeString(userQuestion);
  console.debug("User's question (normalized): ", normalizedUserQuestion);

  const faqQuestions = faqData.map((item) => normalizeString(item.question));

  const similarityScores = await calculateSimilarity(
    normalizedUserQuestion,
    faqQuestions
  );

  let bestMatchIndex = 0;
  let highestScore = similarityScores[0];

  for (let i = 1; i < similarityScores.length; i++) {
    if (similarityScores[i] > highestScore) {
      highestScore = similarityScores[i];
      bestMatchIndex = i;
    }
  }
  const similarityThreshold = 0.6;
  if (highestScore >= similarityThreshold) {
    console.log("Best Match found:", faqData[bestMatchIndex].question);
    return {
      answer: faqData[bestMatchIndex].answer,
      image: faqData[bestMatchIndex].image || null,
    };
  }
  console.log("No good match found");
  return {
    answer:
      "Sorry, I couldn't find an answer to your question. Please try again.",
    image: null,
  };
}

function formatDisplayText(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).trim();
}

async function loadFAQData() {
  try {
    const response = await fetch("faq.json");
    if (!response.ok) {
      throw new Error(`Failed to load FAQ data: ${response.status}`);
    }
    faqData = await response.json();
    console.log("FAQ data loaded successfully.", faqData);

    if (!faqData.every((item) => item.question && item.answer)) {
      console.warn("Invalid FAQ structure detected.");
    }
  } catch (error) {
    console.error("Error loading FAQ data:", error);
    return Promise.reject(new Error(error));
  }
}

function createMessageElement(content, isUser = true) {
  const element = document.createElement("li");
  element.classList.add("chat", isUser ? "outgoing" : "incoming");

  if (isUser) {
    element.innerHTML = `<i class='bx bx-user-pin'></i><p>${formatDisplayText(
      content
    )}</p>`;
  } else {
    element.innerHTML = `<span class="material-symbols-outlined">smart_toy</span><p>${formatDisplayText(
      content
    ).replace(/\n/g, "<br>")}</p>`;
  }
  return element;
}

async function simulateTypingEffect(answerElement, text, duration = 3000) {
  const delay = Math.max(50, duration / text.length);

  return new Promise((resolve) => {
    let index = 0;
    let tempHTML = "";

    function typeCharacter() {
      if (index < text.length) {
        tempHTML += text[index++];
        answerElement.innerHTML = tempHTML;

        answerElement.parentElement.scrollIntoView({ behavior: "smooth" });
        setTimeout(typeCharacter, delay);
      } else {
        resolve();
      }
    }
    typeCharacter();
  });
}

function setupImageFullscreen(imageElement) {
  imageElement.style.cursor = "pointer";
  imageElement.addEventListener("click", () => {
    const fullscreenContainer = document.getElementById("fullscreen-container");
    const fullscreenImage = document.getElementById("fullscreen-image");
    fullscreenImage.src = imageElement.src;
    fullscreenContainer.classList.remove("hidden");
  });
}

function createImageMessage(imageUrl) {
  const imageMessage = document.createElement("li");
  imageMessage.classList.add("chat", "incoming");

  const imgElement = document.createElement("img");
  imgElement.src = imageUrl;
  imgElement.alt = "Related Image";
  imgElement.style.maxWidth = "60%";
  imgElement.style.maxHeight = "50%";
  setupImageFullscreen(imgElement);

  imageMessage.innerHTML = `<span class="material-symbols-outlined">smart_toy</span>`;
  imageMessage.appendChild(imgElement);

  return imageMessage;
}

async function sendMessage() {
  const chatbox = document.querySelector(".chatbox");
  const inputField = document.querySelector(".chat-input textarea");
  const userQuestion = inputField.value.trim();

  if (!userQuestion) return;

  try {
    chatbox.appendChild(createMessageElement(userQuestion, true));
    inputField.value = "";

    const typingIndicator = createMessageElement("Thinking...", false);
    typingIndicator.querySelector(
      "p"
    ).innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span><p>Thinking...</p></div>`;

    chatbox.appendChild(typingIndicator);
    chatbox.scrollTop = chatbox.scrollHeight;

    const { answer, image } = await findAnswer(userQuestion, faqData);
    typingIndicator.remove();

    const botMessage = createMessageElement(answer, false);
    chatbox.appendChild(botMessage);

    const answerElement = botMessage.querySelector("p");
    answerElement.innerHTML = "";
    await simulateTypingEffect(answerElement, answer);
    chatbox.scrollTop = chatbox.scrollHeight;

    if (image) {
      const imageMessage = createImageMessage(image);
      chatbox.appendChild(imageMessage);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage = createMessageElement(
      "Sorry, Something went wrong. Please try again.",
      false
    );
    errorMessage.querySelector("span").textContent = "Error";

    chatbox.appendChild(errorMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const closeButton = document.getElementById("close-btn");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      const fullscreenContainer = document.getElementById(
        "fullscreen-container"
      );
      fullscreenContainer.classList.add("hidden");
    });
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadModel();
    await loadFAQData();

    const sendButton = document.getElementById("send-btn");
    if (sendButton) {
      sendButton.addEventListener("click", sendMessage);
    } else {
      console.error("Send button not found!");
    }

    const textarea = document.querySelector(".chat-input textarea");
    if (textarea) {
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    } else {
      console.error("Textarea not found!");
    }
    console.log("Chatbot initialized successfully");
  } catch (error) {
    console.error("Error initializing chatbot:", error);
    document.querySelector(
      ".chatbox"
    ).innerHTML = `<li class="chat incoming"><span class="material-symbols-outlined">error</span><p>Failed to initialize chatbot. Please refresh the page.</p></li>`;
  }
});

document.getElementById("toggle-dark").addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
});
