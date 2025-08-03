const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const stopBtn = document.getElementById("stopBtn");

let isRecognizing = false;
let recognition;

sendBtn.addEventListener("click", () => {
  const userMessage = userInput.value.trim();
  if (userMessage) {
    sendMessage(userMessage);
    userInput.value = "";
  }
});

micBtn.addEventListener("click", () => {
  if (isRecognizing) return;

  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";
  recognition.start();
  isRecognizing = true;
  micBtn.disabled = true;
  micBtn.innerText = "🎙️ Listening...";

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage(transcript);
    stopMic(); // stop after one use
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    stopMic();
  };

  recognition.onend = function () {
    stopMic(); // In case user is silent
  };
});

stopBtn.addEventListener("click", () => {
  speechSynthesis.cancel(); // Stop Rev speaking
});

function stopMic() {
  isRecognizing = false;
  if (recognition) recognition.stop();
  micBtn.disabled = false;
  micBtn.innerText = "🎙️ Start Talking";
}

async function sendMessage(userMessage) {
  appendMessage("You", userMessage);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage }),
    });

    const data = await response.json();
    console.log("API response:", data);

    if (data.response) {
      appendMessage("Rev", data.response);
      speakText(data.response);
    } else {
      appendMessage("Rev", "⚠️ Error: No response from API.");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    appendMessage("Rev", "⚠️ Server error.");
  }
}

function appendMessage(sender, message) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 1.0;
  speechSynthesis.speak(utterance);
}
