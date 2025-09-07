# ============================================================== 
#                          Automation.py (Final Updated)
# ==============================================================

import asyncio
from AppOpener import close, open as appopen
from pywhatkit import search, playonyt
from dotenv import dotenv_values
from bs4 import BeautifulSoup
from rich import print
from groq import Groq
import webbrowser
import subprocess
import requests
import keyboard
import os
import psutil
import platform
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

# ================== ENV / API KEY ================== #
env_vars = dotenv_values(".env")
GroqAPIKey = env_vars.get("GroqAPIKey")
client = Groq(api_key=GroqAPIKey) if GroqAPIKey else None

# ================== GLOBALS ================== #
messages = []
SystemChatBot = [
    {"role": "system",
     "content": "You are an AI content writer. Write content like letters, codes, applications, essays, notes, poems, etc."}
]

# ================== WEB APPS MAPPING ================== #
WEB_APPS = {
    "whatsapp": "https://web.whatsapp.com",
    # "instagram": "https://www.instagram.com",
    # "facebook": "https://www.facebook.com",
    # "github": "https://github.com",
    # "twitter": "https://twitter.com",
    "linkedin": "https://www.linkedin.com",
    "youtube": "https://www.youtube.com",
}

# ================== GOOGLE SEARCH ================== #
def GoogleSearch(topic):
    search(topic)
    return True

# ================== CONTENT WRITER ================== #
def Content(topic):
    def OpenNotepad(file):
        try:
            subprocess.Popen(["notepad.exe", file])
            return True
        except Exception as e:
            print(f"Error opening notepad: {e}")
            return False

    def ContentWriterAI(prompt):
        if not client:
            return "Error: API key missing."

        try:
            messages.append({"role": "user", "content": f"{prompt}"})
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=SystemChatBot + messages,
                max_tokens=2048,
                temperature=0.7,
                stream=True
            )
            answer = ""
            for chunk in completion:
                if chunk.choices[0].delta.content:
                    answer += chunk.choices[0].delta.content
            answer = answer.replace("</s>", "")
            messages.append({"role": "assistant", "content": answer})
            return answer
        except Exception as e:
            return f"Error generating content: {e}"

    topic = topic.replace("content", "").strip()
    content_by_ai = ContentWriterAI(topic)

    data_dir = "Data"
    os.makedirs(data_dir, exist_ok=True)
    filepath = os.path.join(data_dir, f"{topic.lower().replace(' ', '_')}.txt")

    try:
        with open(filepath, "w", encoding="utf-8") as file:
            file.write(content_by_ai)
        OpenNotepad(filepath)
        return True
    except Exception as e:
        print(f"Error writing file: {e}")
        return False

# ================== YOUTUBE ================== #
def YouTubeSearch(topic):
    webbrowser.open(f"https://www.youtube.com/results?search_query={topic}")
    return True

def PlayYoutube(query):
    try:
        playonyt(query)
        return True
    except Exception as e:
        print(f"Error playing YouTube video: {e}")
        return False

# ================== OPEN APP / WEB ================== #
def OpenWeb(url: str):
    if not url.startswith("http"):
        url = "https://" + url
    try:
        webbrowser.open(url)
        print(f"Opened website: {url}")
        return True
    except Exception as e:
        print(f"Error opening website {url}: {e}")
        return False

def OpenApp(app, sess=requests.session()):
    app = app.lower().strip()

    # ===== Case 1: "open <app>" =====
    if not app.endswith(" app"):
        try:
            appopen(app, match_closest=True, output=True, throw_error=True)
            print(f"Opening {app} app.")
            return True
        except:
            if app in WEB_APPS:
                print(f"{app.capitalize()} app not found. Opening {app} Web...")
                webbrowser.open(WEB_APPS[app])
            else:
                print(f"{app.capitalize()} app not found. Opening Web fallback...")
                webbrowser.open(f"https://{app}.com")
            return True

    # ===== Case 2: "open <app> app" =====
    else:
        base_app = app.replace(" app", "").strip()
        try:
            appopen(base_app, match_closest=True, output=True, throw_error=True)
            print(f"Opening {base_app} app.")
            return True
        except:
            print(f"{base_app.capitalize()} app not found. Opening Play Store page...")
            webbrowser.open(f"https://play.google.com/store/search?q={base_app}")
            return True

def CloseApp(app):
    if "chrome" in app.lower():
        try:
            subprocess.run(["taskkill", "/f", "/im", "chrome.exe"], check=True)
            return True
        except:
            pass
    try:
        close(app, match_closest=True, output=True, throw_error=True)
        return True
    except Exception as e:
        print(f"Error closing {app}: {e}")
        return False

# ================== SYSTEM COMMANDS ================== #
def System(command):
    try:
        if "volume" in command:
            if "%" in command:
                percent = int(command.replace("volume", "").replace("%", "").strip())
                percent = max(0, min(100, percent))
                devices = AudioUtilities.GetSpeakers()
                interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
                volume = cast(interface, POINTER(IAudioEndpointVolume))
                volume.SetMasterVolumeLevelScalar(percent/100, None)
                print(f"Volume set to {percent}%")
                return True
            elif "mute" in command:
                keyboard.press_and_release("volume mute")
            elif "up" in command:
                keyboard.press_and_release("volume up")
            elif "down" in command:
                keyboard.press_and_release("volume down")

        elif "brightness" in command:
            percent = int(command.replace("brightness", "").replace("%", "").strip())
            percent = max(0, min(100, percent))
            os.system(f"powershell (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,{percent})")
            print(f"Brightness set to {percent}%")
            return True

        elif "keyboard light on" in command or "keyboard light off" in command:
            try:
                keyboard.press_and_release("f10")
                print("Toggled keyboard light (requires FN lock).")
                return True
            except Exception as e:
                print(f"Cannot toggle keyboard light: {e}")
                return False

        elif "battery" in command:
            battery = psutil.sensors_battery()
            if battery:
                percent = battery.percent
                print(f"Battery level: {percent}%")
                return percent
            else:
                print("Battery info not available")
                return False

        else:
            print(f"Unknown system command: {command}")
            return False

        return True
    except Exception as e:
        print(f"Error executing system command {command}: {e}")
        return False

# ================== AUTOMATION ENGINE ================== #
async def TranslateAndExecute(commands: list[str]):
    funcs = []
    for command in commands:
        if command.startswith("open "):
            app_name = command.removeprefix("open ").strip()
            funcs.append(asyncio.to_thread(OpenApp, app_name))
        elif command.startswith("close "):
            funcs.append(asyncio.to_thread(CloseApp, command.removeprefix("close ").strip()))
        elif command.startswith("play "):
            funcs.append(asyncio.to_thread(PlayYoutube, command.removeprefix("play ").strip()))
        elif command.startswith("content "):
            funcs.append(asyncio.to_thread(Content, command.removeprefix("content ").strip()))
        elif command.startswith("google search "):
            funcs.append(asyncio.to_thread(GoogleSearch, command.removeprefix("google search ").strip()))
        elif command.startswith("youtube search "):
            funcs.append(asyncio.to_thread(YouTubeSearch, command.removeprefix("youtube search ").strip()))
        elif command.startswith("system "):
            funcs.append(asyncio.to_thread(System, command.removeprefix("system ").strip()))
        else:
            print(f"No function found for command: {command}")

    if funcs:
        results = await asyncio.gather(*funcs, return_exceptions=True)
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"Command {i+1} failed: {result}")
            else:
                print(f"Command {i+1} result: {result}")
            yield result

async def Automation(commands: list[str]):
    results = []
    async for result in TranslateAndExecute(commands):
        results.append(result)
    print(f"Automation completed. Results: {results}")
    return True

# ================== TEST ================== #
if __name__ == "__main__":
    test_commands = [
        "system volume 30%",
        "system brightness 40%",
        "system battery",
        "open notepad",
        "open github web",
        "open whatsapp",
        "open instagram app",
        "play bollywood songs"
    ]
    asyncio.run(Automation(test_commands))
