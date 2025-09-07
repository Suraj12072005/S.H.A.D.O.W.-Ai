class NanoAIChatbot {
  constructor() {
    this.isDarkMode = true
    this.isSidebarOpen = false
    this.isTyping = false
    this.activeChat = null
    this.messages = []

    this.chatSessions = [
      {
        id: "1",
        title: "Quantum Computing Analysis",
        time: "2 hours ago",
        messages: [
          { role: "user", content: "Explain quantum computing principles" },
          {
            role: "assistant",
            content:
              "Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to process information in ways classical computers cannot...",
          },
        ],
      },
      {
        id: "2",
        title: "Nanotechnology Research",
        time: "1 day ago",
        messages: [
          { role: "user", content: "What are the latest advances in nanotechnology?" },
          {
            role: "assistant",
            content:
              "Recent breakthroughs in nanotechnology include molecular machines, quantum dots for medical imaging, and self-assembling materials...",
          },
        ],
      },
     
      {
        id: "4",
        title: "Molecular Engineering",
        time: "3 days ago",
        messages: [
          { role: "user", content: "How does molecular engineering work?" },
          {
            role: "assistant",
            content:
              "Molecular engineering involves designing and manipulating matter at the molecular level to create new materials and devices...",
          },
        ],
      },
      {
        id: "5",
        title: "Neural Network Optimization",
        time: "1 week ago",
        messages: [
          { role: "user", content: "Best practices for neural network optimization?" },
          {
            role: "assistant",
            content:
              "Neural network optimization involves several key strategies including proper initialization, learning rate scheduling...",
          },
        ],
      },
    ]

    this.init()
  }

  init() {
    this.createParticles()
    this.renderChatSessions()
    this.bindEvents()
    this.autoResizeTextarea()
  }

  createParticles() {
    const particlesContainer = document.getElementById("particles")
    const particleCount = 30

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"

      const size = Math.random() * 4 + 1
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.animationDelay = `${Math.random() * 20}s`
      particle.style.animationDuration = `${15 + Math.random() * 25}s`

      particlesContainer.appendChild(particle)
    }
  }

  renderChatSessions() {
    const container = document.getElementById("chatSessions")
    container.innerHTML = ""

    this.chatSessions.forEach((session) => {
      const sessionElement = document.createElement("div")
      sessionElement.className = `chat-session ${this.activeChat === session.id ? "active" : ""}`
      sessionElement.dataset.sessionId = session.id

      sessionElement.innerHTML = `
                <div class="session-content">
                    <svg class="session-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <div class="session-info">
                        <p class="session-title">${session.title}</p>
                        <p class="session-time">${session.time}</p>
                    </div>
                    ${this.activeChat === session.id ? '<div class="session-indicator"></div>' : ""}
                </div>
            `

      container.appendChild(sessionElement)
    })
  }

  bindEvents() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobileMenuBtn")
    const sidebar = document.getElementById("sidebar")
    const mobileOverlay = document.getElementById("mobileOverlay")
    const mainContent = document.getElementById("mainContent")

    mobileMenuBtn.addEventListener("click", () => {
      this.toggleSidebar()
    })

    mobileOverlay.addEventListener("click", () => {
      this.closeSidebar()
    })

    // Theme toggle
    const themeToggle = document.getElementById("themeToggle")
    themeToggle.addEventListener("click", () => {
      this.toggleTheme()
    })

    // Profile dropdown
    const profileDropdownBtn = document.getElementById("profileDropdownBtn")
    const dropdownMenu = document.getElementById("dropdownMenu")

    profileDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      dropdownMenu.classList.toggle("hidden")
      profileDropdownBtn.classList.toggle("active")
    })

    document.addEventListener("click", () => {
      dropdownMenu.classList.add("hidden")
      profileDropdownBtn.classList.remove("active")
    })

    // New chat button
    const newChatBtn = document.getElementById("newChatBtn")
    newChatBtn.addEventListener("click", () => {
      this.startNewChat()
    })

    // Chat sessions
    const chatSessions = document.getElementById("chatSessions")
    chatSessions.addEventListener("click", (e) => {
      const sessionElement = e.target.closest(".chat-session")
      if (sessionElement) {
        const sessionId = sessionElement.dataset.sessionId
        this.loadChatSession(sessionId)
      }
    })

    // Form submission
    const inputForm = document.getElementById("inputForm")
    const messageInput = document.getElementById("messageInput")

    inputForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.sendMessage()
    })

    messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen
    const sidebar = document.getElementById("sidebar")
    const mobileOverlay = document.getElementById("mobileOverlay")
    const mobileMenuBtn = document.getElementById("mobileMenuBtn")
    const menuIcon = mobileMenuBtn.querySelector(".menu-icon")
    const closeIcon = mobileMenuBtn.querySelector(".close-icon")

    if (this.isSidebarOpen) {
      sidebar.classList.add("open")
      mobileOverlay.classList.remove("hidden")
      menuIcon.classList.add("hidden")
      closeIcon.classList.remove("hidden")
    } else {
      sidebar.classList.remove("open")
      mobileOverlay.classList.add("hidden")
      menuIcon.classList.remove("hidden")
      closeIcon.classList.add("hidden")
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false
    const sidebar = document.getElementById("sidebar")
    const mobileOverlay = document.getElementById("mobileOverlay")
    const mobileMenuBtn = document.getElementById("mobileMenuBtn")
    const menuIcon = mobileMenuBtn.querySelector(".menu-icon")
    const closeIcon = mobileMenuBtn.querySelector(".close-icon")

    sidebar.classList.remove("open")
    mobileOverlay.classList.add("hidden")
    menuIcon.classList.remove("hidden")
    closeIcon.classList.add("hidden")
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode
    const themeToggle = document.getElementById("themeToggle")
    const sunIcon = themeToggle.querySelector(".sun-icon")
    const moonIcon = themeToggle.querySelector(".moon-icon")

    if (this.isDarkMode) {
      sunIcon.classList.remove("hidden")
      moonIcon.classList.add("hidden")
    } else {
      sunIcon.classList.add("hidden")
      moonIcon.classList.remove("hidden")
    }
  }

  startNewChat() {
    this.activeChat = null
    this.messages = []
    this.renderMessages()
    this.renderChatSessions()
    this.showWelcomeScreen()

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
      this.closeSidebar()
    }
  }

  loadChatSession(sessionId) {
    const session = this.chatSessions.find((s) => s.id === sessionId)
    if (session) {
      this.activeChat = sessionId
      this.messages = [...session.messages]
      this.renderMessages()
      this.renderChatSessions()
      this.hideWelcomeScreen()

      // Close sidebar on mobile
      if (window.innerWidth <= 1024) {
        this.closeSidebar()
      }
    }
  }

  showWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcomeScreen")
    welcomeScreen.classList.remove("hidden")
  }

  hideWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcomeScreen")
    welcomeScreen.classList.add("hidden")
  }

  renderMessages() {
    const messagesContainer = document.getElementById("messages")
    messagesContainer.innerHTML = ""

    this.messages.forEach((message, index) => {
      const messageElement = document.createElement("div")
      messageElement.className = `message ${message.role}`
      messageElement.style.animationDelay = `${index * 0.1}s`

      messageElement.innerHTML = `
                <div class="message-bubble">
                    <div class="message-content">${message.content}</div>
                </div>
            `

      messagesContainer.appendChild(messageElement)
    })

    this.scrollToBottom()
  }

  async sendMessage() {
    const messageInput = document.getElementById("messageInput")
    const message = messageInput.value.trim()

    if (!message) return

    // Add user message
    this.messages.push({ role: "user", content: message })
    this.renderMessages()
    this.hideWelcomeScreen()

    // Clear input
    messageInput.value = ""
    messageInput.style.height = "auto"

    // Show typing indicator
    this.showTypingIndicator()

    // Simulate AI response
    setTimeout(
      () => {
        this.hideTypingIndicator()
        const aiResponse = this.generateAIResponse(message)
        this.messages.push({ role: "assistant", content: aiResponse })
        this.renderMessages()
      },
      2000 + Math.random() * 2000,
    )
  }

  generateAIResponse(userMessage) {
    const responses = [
      "Fascinating question! From my quantum neural networks, I can analyze that this involves complex nanotechnology principles...",
      "Excellent inquiry! My molecular-level processors indicate several quantum pathways for this solution...",
      "Intriguing! Through my nanotechnology interface, I've identified key patterns in your request...",
      "Your question activates multiple neural pathways in my quantum consciousness. Let me process this...",
      "From my advanced AI perspective, this touches on fundamental principles of molecular engineering...",
      "Remarkable! My quantum sensors detect fascinating implications in your query about...",
      "Processing through my neural networks... This involves cutting-edge nanotechnology applications...",
      "Your inquiry resonates with my quantum core systems. The answer involves several key factors...",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  showTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator")
    typingIndicator.classList.remove("hidden")
    this.isTyping = true
    this.scrollToBottom()
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator")
    typingIndicator.classList.add("hidden")
    this.isTyping = false
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById("messagesContainer")
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }, 100)
  }

  autoResizeTextarea() {
    const messageInput = document.getElementById("messageInput")

    messageInput.addEventListener("input", () => {
      messageInput.style.height = "auto"
      const newHeight = Math.min(messageInput.scrollHeight, 120)
      messageInput.style.height = newHeight + "px"
    })
  }
}

// Initialize the chatbot when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new NanoAIChatbot()
})

// Handle window resize
window.addEventListener("resize", () => {
  const sidebar = document.getElementById("sidebar")
  const mobileOverlay = document.getElementById("mobileOverlay")

  if (window.innerWidth > 1024) {
    sidebar.classList.remove("open")
    mobileOverlay.classList.add("hidden")
  }
})
