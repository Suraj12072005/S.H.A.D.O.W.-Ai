import sys
import os
import json
import psutil
import datetime
import asyncio
import threading
import time
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.serving import make_server
from dotenv import load_dotenv
from bs4 import BeautifulSoup
# from Backend.RealtimeSearchEngine import RealtimeSearchEngine

import requests

# ✅ Debug info
print("\U0001F4C2 Current working directory:", os.getcwd())
print("\U0001F4C1 backend folder exists?:", os.path.exists('Backend'))
print("\U0001F4C4 Files in backend:", os.listdir('Backend') if os.path.exists('Backend') else "backend not found")

# ✅ Import backend modules
from Backend.RealtimeSearchEngine import RealtimeSearchEngine
from Backend.Chatbot import ChatBot
from Backend.Model import FirstLayerDMM
from Backend.Automation import Automation

# ✅ Load environment variables
load_dotenv()

# ✅ Create Flask app
app = Flask(__name__, template_folder="Frontend", static_folder="Frontend/static")
CORS(app)

# ✅ Real-time system data
system_data = {
    'cpu': 0,
    'memory': {'used': 0, 'total': 0, 'percent': 0},
    'storage': {'used': 0, 'total': 0, 'percent': 0},
    'battery': {'charging': None, 'percent': 0},
    'network': {'ip': '192.168.1.4', 'bandwidth': '7.1 Mbps / 59.5 Mbps', 'connection': 'SHADOW_NET_5G - 89%'}
}

def update_system_data():
    while True:
        try:
            system_data['cpu'] = round(psutil.cpu_percent(interval=1), 1)
            memory = psutil.virtual_memory()
            system_data['memory'] = {
                'used': round(memory.used / (1024**3), 1),
                'total': round(memory.total / (1024**3), 1),
                'percent': round(memory.percent, 1)
            }
            disk = psutil.disk_usage('/')
            system_data['storage'] = {
                'used': round(disk.used / (1024**3), 1),
                'total': round(disk.total / (1024**3), 1),
                'percent': round((disk.used / disk.total) * 100, 1)
            }
            battery = psutil.sensors_battery()
            if battery:
                system_data['battery'] = {
                    'charging': battery.power_plugged,
                    'percent': round(battery.percent, 1)
                }
            else:
                system_data['battery'] = {'charging': True, 'percent': 100}
        except Exception as e:
            print(f"Error updating system data: {e}")
        time.sleep(2)

# ✅ Start monitoring thread
threading.Thread(target=update_system_data, daemon=True).start()

# ✅ Routes
@app.route('/')
def index():
    return render_template("index.html")
@app.route('/about')

def about():
    return render_template("about.html")

@app.route('/versions')
def versions():
    return render_template("version.html")

@app.route('/admin')
def admin():
    return render_template("admin.html")

@app.route('/chat')
def chat():
    return render_template("chat.html")

@app.route('/login')
def login():
    return render_template("login.html")

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('Frontend/static', filename)

@app.route('/system-data')
def get_system_data():
    return jsonify(system_data)

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        decision = FirstLayerDMM(user_message)
        response = ""
        for task in decision:
            if task.startswith('general'):
                response = ChatBot(task.replace('general', '').strip())
            elif task.startswith('realtime'):
                response = RealtimeSearchEngine(task.replace('realtime', '').strip())
            elif any(task.startswith(prefix) for prefix in ['open', 'close', 'play', 'content', 'google search', 'youtube search', 'system']):
                asyncio.run(Automation([task]))
                response = f"Executing: {task}"
            else:
                response = ChatBot(user_message)

        return jsonify({
            'response': response,
            'decision': decision,
            'timestamp': datetime.datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice-recognition', methods=['POST'])
def voice_recognition():
    try:
        return jsonify({'status': 'listening', 'message': 'Voice recognition started'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/automation', methods=['POST'])
def automation_endpoint():
    try:
        data = request.get_json()
        commands = data.get('commands', [])
        if not commands:
            return jsonify({'error': 'No commands provided'}), 400
        result = asyncio.run(Automation(commands))
        return jsonify({'status': 'success', 'result': result, 'commands_executed': commands})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/weather')
def get_weather():
    try:
        api_key = os.getenv("WEATHER_API_KEY")  # .env me rakho
        city = "Yeola"

        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
        response = requests.get(url)
        data = response.json()

        if data.get("cod") != 200:
            return jsonify({'error': data.get("message", "Weather data not available")}), 400

        # Extract data
        temperature = f"{data['main']['temp']}°C"
        condition = data['weather'][0]['description'].upper()
        humidity = f"{data['main']['humidity']}%"
        wind = f"{data['wind']['speed']} km/h"

        return jsonify({
            'city': city.upper() + " CITY",
            'temperature': temperature,
            'condition': condition,
            'humidity': humidity,
            'wind': wind
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/api/network-info')
def get_network_info():
    try:
        return jsonify(system_data['network'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Start the server
if __name__ == "__main__":
    # Create required folders
    os.makedirs('Data', exist_ok=True)
    os.makedirs('Backend', exist_ok=True)
    os.makedirs('Frontend', exist_ok=True)
    os.makedirs('Frontend/static', exist_ok=True)

    print("\U0001F680 SHADOW AI Server Starting...")
    print("\U0001F4CA System monitoring active")
    print("\U0001F916 AI modules loaded")
    print("✨ Server running on http://localhost:5000")

    app = Flask(__name__)

if __name__ == "__main__":
    app.run(debug=True)     
    
    
    
    
