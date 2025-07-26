const shadowTitle = document.getElementById("shadowTitle");
const voiceGif = document.getElementById("voiceGif");
const output = document.getElementById("output");

// Speech
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.lang = "en-GB";
  window.speechSynthesis.speak(utterance);
}

// Voice Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";

recognition.onstart = () => {
  voiceGif.style.display = "block";
};

recognition.onend = () => {
  voiceGif.style.display = "none";
};

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.toLowerCase();
  console.log("You said:", transcript);
  takeCommand(transcript);
};

// Mic click
shadowTitle.addEventListener("click", () => {
  recognition.start();
});

// Command logic
function takeCommand(message) {
  if (message.includes("hello")) {
    speak("Hello! How can I help you?");
  } else if (message.includes("who are you")) {
    speak("I am SHADOW AI, your virtual assistant.");
  } else if (message.includes("open youtube")) {
    speak("Opening YouTube...");
    window.open("https://youtube.com");
  } else if (message.includes("open google")) {
    speak("Opening Google...");
    window.open("https://google.com");
  } else if (message.includes("time")) {
    let time = new Date().toLocaleTimeString();
    speak("The time is " + time);
  } else if (message.includes("date")) {
    let date = new Date().toDateString();
    speak("Today's date is " + date);
  } else {
    askAI(message); // ✅ ये लाइन error का कारण थी: अब function defined है नीचे
  }
}

// ✅ Ask AI via backend
function askAI(message) {
  fetch("/ask-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  })
    .then((res) => res.json())
    .then((data) => {
      speak(data.reply);
      output.innerText = data.reply;
    })
    .catch((err) => {
      console.error("AI Error:", err);
      speak("Sorry, I couldn't reach the AI.");
    });
}





let systemData = {
            cpu: 25,
            memory: { used: 3.0, total: 16 },
            storage: { used: 230, total: 512 },
            gpuTemp: 83,
            networkSpeed: { download: 7.1, upload: 59.5 },
            wifiStrength: 89,
            isOnline: true,
            ipAddress: '192.168.1.4',
            currentNetwork: 'SHADOW_NET_5G'
        };

        // Available network names for real-time switching
        const networkNames = [
            'WIFI_LOCAL_5G',
            'SHADOW_NET_5G',
            'FUSION_LINK'
        ];

        let networkChangeTimer = 0;

        // Mobile menu state
        let mobileMenuOpen = false;
        let leftPanelOpen = false;
        let rightPanelOpen = false;

        // Mobile Menu Functions
        function toggleMobileMenu() {
            mobileMenuOpen = !mobileMenuOpen;
            const menu = document.getElementById('mobileMenu');
            const overlay = document.getElementById('mobileMenuOverlay');
            
            if (mobileMenuOpen) {
                menu.classList.add('active');
                overlay.classList.add('active');
            } else {
                menu.classList.remove('active');
                overlay.classList.remove('active');
            }
        }

        function closeMobileMenu() {
            mobileMenuOpen = false;
            document.getElementById('mobileMenu').classList.remove('active');
            document.getElementById('mobileMenuOverlay').classList.remove('active');
        }

        function toggleLeftPanel() {
            closeMobileMenu();
            leftPanelOpen = !leftPanelOpen;
            const panel = document.getElementById('leftPanel');
            const overlay = document.getElementById('panelOverlay');
            
            if (rightPanelOpen) {
                document.getElementById('rightPanel').classList.remove('active');
                rightPanelOpen = false;
            }
            
            if (leftPanelOpen) {
                panel.classList.add('active');
                overlay.classList.add('active');
            } else {
                panel.classList.remove('active');
                overlay.classList.remove('active');
            }
        }

        function toggleRightPanel() {
            closeMobileMenu();
            rightPanelOpen = !rightPanelOpen;
            const panel = document.getElementById('rightPanel');
            const overlay = document.getElementById('panelOverlay');
            
            if (leftPanelOpen) {
                document.getElementById('leftPanel').classList.remove('active');
                leftPanelOpen = false;
            }
            
            if (rightPanelOpen) {
                panel.classList.add('active');
                overlay.classList.add('active');
            } else {
                panel.classList.remove('active');
                overlay.classList.remove('active');
            }
        }

        function closePanels() {
            leftPanelOpen = false;
            rightPanelOpen = false;
            document.getElementById('leftPanel').classList.remove('active');
            document.getElementById('rightPanel').classList.remove('active');
            document.getElementById('panelOverlay').classList.remove('active');
        }

        // Real-time clock
        function updateTime() {
            const now = new Date();
            
            const dateOptions = { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
            };
            const dateString = now.toLocaleDateString('en-US', dateOptions);
            
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            document.getElementById('dateDisplay').textContent = dateString;
            document.getElementById('timeDisplay').textContent = timeString;
        }

        // Fetch real IP address
        async function fetchRealIP() {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                systemData.ipAddress = data.ip;
                document.querySelector('.network-item .network-value').textContent = systemData.ipAddress;
                console.log('IP Address updated:', systemData.ipAddress);
            } catch (error) {
                console.log('Failed to fetch IP, using fallback:', error);
                systemData.ipAddress = '192.168.1.' + Math.floor(Math.random() * 254 + 1);
                document.querySelector('.network-item .network-value').textContent = systemData.ipAddress;
            }
        }

        // Get status color class
        function getStatusColor(value, type) {
            if (type === 'temp') {
                if (value > 85) return 'temp-critical';
                if (value > 75) return 'temp-warning';
                return 'temp-normal';
            }
            if (value > 80) return 'critical';
            if (value > 60) return 'warning';
            return 'normal';
        }

        // Get progress color class
        function getProgressColor(value, type) {
            if (type === 'temp') {
                if (value > 85) return 'progress-critical';
                if (value > 75) return 'progress-warning';
                return 'progress-normal';
            }
            if (value > 80) return 'progress-critical';
            if (value > 60) return 'progress-warning';
            return 'progress-normal';
        }

        // Update Left Panel - System Status (Real-time)
        function updateSystemStatus() {
            // Simulate real-time data changes with realistic fluctuations
            systemData.cpu = Math.max(15, Math.min(95, systemData.cpu + (Math.random() - 0.5) * 8));
            systemData.memory.used = Math.max(2.0, Math.min(15.0, systemData.memory.used + (Math.random() - 0.5) * 0.3));
            systemData.storage.used = Math.max(200, Math.min(500, systemData.storage.used + (Math.random() - 0.5) * 2));
            systemData.gpuTemp = Math.max(65, Math.min(95, systemData.gpuTemp + (Math.random() - 0.5) * 2));

            // Update CPU
            const cpuValue = document.getElementById('cpuValue');
            const cpuProgress = document.getElementById('cpuProgress');
            cpuValue.textContent = systemData.cpu.toFixed(1) + '%';
            cpuValue.className = 'status-value ' + getStatusColor(systemData.cpu, 'cpu');
            cpuProgress.style.width = systemData.cpu + '%';
            cpuProgress.className = 'progress-fill ' + getProgressColor(systemData.cpu, 'cpu');

            // Update Memory
            const memoryValue = document.getElementById('memoryValue');
            const memoryProgress = document.getElementById('memoryProgress');
            const memoryPercent = (systemData.memory.used / systemData.memory.total) * 100;
            memoryValue.textContent = systemData.memory.used.toFixed(1) + ' / ' + systemData.memory.total + ' GB';
            memoryValue.className = 'status-value ' + getStatusColor(memoryPercent, 'memory');
            memoryProgress.style.width = memoryPercent + '%';
            memoryProgress.className = 'progress-fill ' + getProgressColor(memoryPercent, 'memory');

            // Update Storage
            const storageValue = document.getElementById('storageValue');
            const storageProgress = document.getElementById('storageProgress');
            const storagePercent = (systemData.storage.used / systemData.storage.total) * 100;
            storageValue.textContent = systemData.storage.used.toFixed(0) + ' / ' + systemData.storage.total + ' GB';
            storageValue.className = 'status-value ' + getStatusColor(storagePercent, 'storage');
            storageProgress.style.width = storagePercent + '%';
            storageProgress.className = 'progress-fill ' + getProgressColor(storagePercent, 'storage');

            // Update GPU Temperature
            const tempValue = document.getElementById('tempValue');
            const tempProgress = document.getElementById('tempProgress');
            tempValue.textContent = systemData.gpuTemp.toFixed(0) + '°C';
            tempValue.className = 'status-value ' + getStatusColor(systemData.gpuTemp, 'temp');
            tempProgress.style.width = systemData.gpuTemp + '%';
            tempProgress.className = 'progress-fill ' + getProgressColor(systemData.gpuTemp, 'temp');
        }

        // Update Right Panel - Network Info (Real-time)
        function updateNetworkInfo() {
            // Simulate network data changes
            systemData.networkSpeed.download = Math.max(1, Math.min(15, systemData.networkSpeed.download + (Math.random() - 0.5) * 3));
            systemData.networkSpeed.upload = Math.max(20, Math.min(100, systemData.networkSpeed.upload + (Math.random() - 0.5) * 8));
            systemData.wifiStrength = Math.max(70, Math.min(100, systemData.wifiStrength + (Math.random() - 0.5) * 5));
            systemData.isOnline = Math.random() > 0.1; // 90% uptime

            // Change network name every 15-30 seconds (randomly)
            networkChangeTimer++;
            if (networkChangeTimer >= 8 + Math.floor(Math.random() * 10)) { // 16-36 seconds at 2s intervals
                systemData.currentNetwork = networkNames[Math.floor(Math.random() * networkNames.length)];
                networkChangeTimer = 0;
                console.log('🔄 Network switched to:', systemData.currentNetwork);
            }

            // Update Bandwidth
            const bandwidthValue = document.getElementById('bandwidthValue');
            bandwidthValue.textContent = systemData.networkSpeed.download.toFixed(1) + ' Mbps / ' + systemData.networkSpeed.upload.toFixed(1) + ' Mbps';

            // Update Connection Status with real-time network name
            const connectionValue = document.getElementById('connectionValue');
            const networkIcon = document.getElementById('networkIcon');
            
            if (systemData.isOnline) {
                connectionValue.textContent = systemData.currentNetwork + ' - ' + systemData.wifiStrength.toFixed(0) + '%';
                connectionValue.className = 'network-value connected';
                networkIcon.innerHTML = '<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>';
            } else {
                connectionValue.textContent = 'DISCONNECTED - 0%';
                connectionValue.className = 'network-value disconnected';
                networkIcon.innerHTML = '<path d="M24.24 8.64l-1.41-1.41C20.07 4.46 16.16 3 12 3S3.93 4.46 1.17 7.22L2.58 8.63c2.39-2.39 5.56-3.71 8.95-3.71s6.56 1.32 8.95 3.71l1.41-1.41zM3.53 10.95l1.41 1.41C6.25 11.05 9.01 10 12 10s5.75 1.05 7.06 2.36l1.41-1.41C18.73 9.22 15.46 8 12 8s-6.73 1.22-8.47 2.95zM12 15c-1.38 0-2.63.56-3.54 1.46L12 20l3.54-3.54C14.63 15.56 13.38 15 12 15z"/><path d="M22 3L2 23l1.41 1.41L5.83 22H22V3z" fill="red" opacity="0.7"/>';
            }

            console.log('🌐 Network Info Updated:', {
                network: systemData.currentNetwork,
                download: systemData.networkSpeed.download.toFixed(1) + ' Mbps',
                upload: systemData.networkSpeed.upload.toFixed(1) + ' Mbps',
                wifi: systemData.wifiStrength.toFixed(0) + '%',
                status: systemData.isOnline ? 'Connected' : 'Disconnected'
            });
        }

        // SHADOW text effect
        function shadowEffect() {
            const shadowText = document.querySelector('.shadow-text h1');
            shadowText.style.transform = 'scale(1.1)';
            shadowText.style.textShadow = `
                0 0 30px rgba(6, 182, 212, 1),
                0 0 60px rgba(6, 182, 212, 1),
                0 0 90px rgba(6, 182, 212, 0.8),
                0 0 120px rgba(6, 182, 212, 0.6)
            `;
            
            setTimeout(() => {
                shadowText.style.transform = 'scale(1)';
                shadowText.style.textShadow = `
                    0 0 20px rgba(6, 182, 212, 0.8),
                    0 0 40px rgba(6, 182, 212, 0.6),
                    0 0 60px rgba(6, 182, 212, 0.4)
                `;
            }, 300);
        }

        // Initialize dashboard
        async function initializeDashboard() {
            console.log('%c SHADOW DASHBOARD INITIALIZING... ', 'background: #00ffff; color: #000; font-size: 14px; font-weight: bold; padding: 8px;');
            
            // Initial updates
            updateTime();
            updateSystemStatus();
            updateNetworkInfo();
            
            // Fetch real IP address
            await fetchRealIP();

            document.getElementById('connectionValue').textContent = systemData.currentNetwork + ' - ' + systemData.wifiStrength.toFixed(0) + '%';
            
            console.log('%c SHADOW DASHBOARD ONLINE - MOBILE RESPONSIVE ', 'background: #00ff00; color: #000; font-size: 16px; font-weight: bold; padding: 10px;');
            console.log('📱 Mobile: 3-dot menu for panel access');
            console.log('🖥️  Desktop: Full layout with all panels');
            console.log('🔄 Real-time updates every 2 seconds');
            console.log('⌨️  Shortcuts: S for SHADOW effect, R to refresh');
        }

        // Set up all intervals
        function startRealTimeUpdates() {
            // Clock updates every second
            setInterval(updateTime, 1000);
            
            // System status updates every 2 seconds
            setInterval(updateSystemStatus, 2000);
            
            // Network info updates every 2 seconds
            setInterval(updateNetworkInfo, 2000);
            
            // IP address refresh every 30 seconds
            setInterval(fetchRealIP, 30000);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(event) {
            if (event.key.toLowerCase() === 's') {
                shadowEffect();
                console.log('🌟 SHADOW effect triggered');
            }
            if (event.key.toLowerCase() === 'r') {
                updateSystemStatus();
                updateNetworkInfo();
                fetchRealIP();
                console.log('🔄 Manual refresh triggered');
            }
            if (event.key.toLowerCase() === 'escape') {
                closePanels();
                closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 1024) {
                closePanels();
                closeMobileMenu();
            }
        });

        // Start everything when page loads
        document.addEventListener('DOMContentLoaded', function() {
            initializeDashboard();
            startRealTimeUpdates();
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                console.log('⏸️  Dashboard paused (tab hidden)');
            } else {
                console.log('▶️  Dashboard resumed (tab visible)');
                updateSystemStatus();
                updateNetworkInfo();
            }
        });