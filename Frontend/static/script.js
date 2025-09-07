// Global variables
let isListening = false
let recognition = null
let chatActive = false

// Initialize speech recognition
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.lang = "en-GB"
  recognition.continuous = false
  recognition.interimResults = false
}

// DOM elements
const shadowTitle = document.getElementById("shadowTitle")
const voiceGif = document.getElementById("voiceGif")
const chatInterface = document.getElementById("chatInterface")
const chatMessages = document.getElementById("chatMessages")
const chatInput = document.getElementById("chatInput")
const sendButton = document.getElementById("sendButton")
const voiceButton = document.getElementById("voiceButton")

// Speech synthesis
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1
  utterance.lang = "en-GB"
  window.speechSynthesis.speak(utterance)
}

// Voice recognition setup
if (recognition) {
  recognition.onstart = () => {
    isListening = true
    shadowTitle.classList.add("listening")
    voiceGif.style.display = "flex"
    voiceButton.textContent = "🔴 Active"
  }

  recognition.onend = () => {
    isListening = false
    shadowTitle.classList.remove("listening")
    voiceGif.style.display = "none"
    voiceButton.textContent = "🎤"
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase()
    console.log("You said:", transcript)
    handleUserInput(transcript)
  }

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error)
    isListening = false
    shadowTitle.classList.remove("listening")
    voiceGif.style.display = "none"
    voiceButton.textContent = "🎤"
  }
}

// Toggle voice recognition
function toggleVoiceRecognition() {
  if (!recognition) {
    alert("Speech recognition not supported in this browser")
    return
  }

  if (isListening) {
    recognition.stop()
  } else {
    recognition.start()
  }
}

// Handle user input (voice or text)
async function handleUserInput(message) {
  if (!message.trim()) return

  // Show chat interface if not active
  if (!chatActive) {
    chatInterface.classList.add("active")
    chatActive = true
  }

  // Add user message to chat
  addMessageToChat(message, "user")

  try {
    // Send message to backend
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: message }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    // Add AI response to chat
    addMessageToChat(data.response, "ai")

    // Speak the response
    speak(data.response)
  } catch (error) {
    console.error("Chat error:", error)
    addMessageToChat("Sorry, I encountered an error. Please try again.", "ai")
  }
}

// Add message to chat interface
function addMessageToChat(message, sender) {
  const messageDiv = document.createElement("div")
  messageDiv.className = `chat-message ${sender}`
  messageDiv.textContent = message
  chatMessages.appendChild(messageDiv)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// Send message from input
function sendMessage() {
  const message = chatInput.value.trim()
  if (message) {
    handleUserInput(message)
    chatInput.value = ""
  }
}

// Handle enter key in chat input
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage()
  }
})

// Shadow title click handler
shadowTitle.addEventListener("click", () => {
  if (!chatActive) {
    chatInterface.classList.add("active")
    chatActive = true
    chatInput.focus()
  } else {
    toggleVoiceRecognition()
  }
})

// Mobile menu functions
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu")
  const overlay = document.getElementById("mobileMenuOverlay")

  mobileMenu.classList.toggle("active")
  overlay.classList.toggle("active")
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu")
  const overlay = document.getElementById("mobileMenuOverlay")

  mobileMenu.classList.remove("active")
  overlay.classList.remove("active")
}

function toggleLeftPanel() {
  const leftPanel = document.getElementById("leftPanel")
  const overlay = document.getElementById("panelOverlay")

  leftPanel.classList.toggle("active")
  overlay.classList.toggle("active")
  closeMobileMenu()
}

function toggleRightPanel() {
  const rightPanel = document.getElementById("rightPanel")
  const overlay = document.getElementById("panelOverlay")

  rightPanel.classList.toggle("active")
  overlay.classList.toggle("active")
  closeMobileMenu()
}

function closePanels() {
  const leftPanel = document.getElementById("leftPanel")
  const rightPanel = document.getElementById("rightPanel")
  const overlay = document.getElementById("panelOverlay")

  leftPanel.classList.remove("active")
  rightPanel.classList.remove("active")
  overlay.classList.remove("active")
}

// Update system data
function updateSystemData() {
  fetch("/system-data")
    .then((response) => response.json())
    .then((data) => {
      // CPU
      document.getElementById("cpuValue").textContent = `${data.cpu}%`
      const cpuProgress = document.getElementById("cpuProgress")
      cpuProgress.style.width = `${data.cpu}%`

      // Update progress bar color based on usage
      cpuProgress.className =
        "progress-fill " +
        (data.cpu > 80 ? "progress-critical" : data.cpu > 60 ? "progress-warning" : "progress-normal")

      // Memory
      document.getElementById("memoryValue").textContent = `${data.memory.used} / ${data.memory.total} GB`
      const memoryProgress = document.getElementById("memoryProgress")
      memoryProgress.style.width = `${data.memory.percent}%`
      memoryProgress.className =
        "progress-fill " +
        (data.memory.percent > 80
          ? "progress-critical"
          : data.memory.percent > 60
            ? "progress-warning"
            : "progress-normal")

      // Storage
      document.getElementById("storageValue").textContent = `${data.storage.used} / ${data.storage.total} GB`
      const storageProgress = document.getElementById("storageProgress")
      storageProgress.style.width = `${data.storage.percent}%`
      storageProgress.className =
        "progress-fill " +
        (data.storage.percent > 80
          ? "progress-critical"
          : data.storage.percent > 60
            ? "progress-warning"
            : "progress-normal")

      // Power
      const powerStatus = document.querySelector(".power-status")
      if (data.battery.charging === true) {
        powerStatus.innerHTML = `<span class="lightning">⚡</span> <span>Plugged In</span>`
      } else if (data.battery.charging === false) {
        powerStatus.innerHTML = `<span class="lightning">🔋</span> <span>On Battery</span>`
      } else {
        powerStatus.innerHTML = `<span>Power: N/A</span>`
      }
    })
    .catch((err) => console.error("System data fetch error:", err))
}

// Update date and time
function updateDateTime() {
  const now = new Date()

  const dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }

  document.getElementById("dateDisplay").textContent = now.toLocaleDateString("en-US", dateOptions)
  document.getElementById("timeDisplay").textContent = now.toLocaleTimeString("en-US", timeOptions)
}

// Initialize the application
function initializeApp() {
  console.log("🚀 SHADOW AI Dashboard Initialized")

  // Start real-time updates
  updateSystemData()
  updateDateTime()

  // Set up intervals for real-time data
  setInterval(updateSystemData, 2000) // Update every 2 seconds
  setInterval(updateDateTime, 1000) // Update every second

  // Add welcome message
  setTimeout(() => {
    speak("SHADOW AI system online. How can I assist you today?")
  }, 2000)
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp)

// Handle window resize for responsive design
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    closePanels()
    closeMobileMenu()
  }
})
