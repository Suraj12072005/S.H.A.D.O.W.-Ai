from flask import Flask, render_template

app = Flask(__name__, 
            template_folder='Frontend/templates', 
            static_folder='Frontend/static')

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=8000)



from Frontend.GUI import (
    GraphicalUserInterface,
    SetAssistantStatus,
    ShowTextToScreen,
    TempDirectoryPath,
    SetMicrophoneStatus,
    AnswerModifier,
    QueryModifier,
    GetMicrophoneStatus,
    GetAssistantStatus)
from Backend.Model import FirstLayerDMM
from Backend.RealtimeSearchEngine import RealtimeSearchEngine
from Backend.Automation import Automation
from Backend.SpeechToText import SpeechRecognition
from Backend.Chatbot import ChatBot
from Backend.TextToSpeech import TextToSpeech
from dotenv import dotenv_values
import os

# Load environment variables
env_vars = dotenv_values(".env")
Username = env_vars.get("Username", "User")
Assistantname = env_vars.get("Assistantname", "S.H.A.D.O.W.")

# Default welcome message
DefaultMessage = f'''{Username} : Hello {Assistantname}, How are you?
{Assistantname} : Welcome {Username}. I am doing well. How may I help you?'''

# List to store subprocesses
Subprocesses = []

# List of automation functions
Functions = ["open", "close", "play", "system", "content", "google search", "youtube search"]

def ShowDefaultChatIfNoChats():
    """Show default chat if no previous chats exist"""
    try:
        os.makedirs("Data", exist_ok=True)
        
        # Check if ChatLog.json exists and has content
        if not os.path.exists('Data/ChatLog.json'):
            with open('Data/ChatLog.json', 'w', encoding='utf-8') as file:
                json.dump([], file)
        
        with open('Data/ChatLog.json', "r", encoding='utf-8') as file:
            content = file.read().strip()
            
        if len(content) < 5:
            # Create Frontend/Files directory if it doesn't exist
            os.makedirs("Frontend/Files", exist_ok=True)
            
            with open(TempDirectoryPath('Database.data'), 'w', encoding='utf-8') as file:
                file.write("")

            with open(TempDirectoryPath('Responses.data'), 'w', encoding='utf-8') as file:
                file.write(DefaultMessage)
    except Exception as e:
        print(f"Error in ShowDefaultChatIfNoChats: {e}")

def ReadChatlogJson():
    """Read and return chatlog data from JSON file"""
    try:
        with open(r'Data/ChatLog.json', 'r', encoding='utf-8') as file:
            chatlog_data = json.load(file)
        return chatlog_data
    except Exception as e:
        print(f"Error reading ChatLog.json: {e}")
        return []

def ChatlogIntegration():
    """Integrate chatlog data for GUI display"""
    try:
        json_data = ReadChatlogJson()
        formatted_chatlog = ""
        
        for entry in json_data:
            if entry["role"] == "user":
                formatted_chatlog += f"{Username}: {entry['content']}\n"
            elif entry["role"] == "assistant":
                formatted_chatlog += f"{Assistantname}: {entry['content']}\n"
        
        # Replace placeholders
        formatted_chatlog = formatted_chatlog.replace("{Username}", Username)
        formatted_chatlog = formatted_chatlog.replace("{Assistantname}", Assistantname)
        
        with open(TempDirectoryPath('Database.data'), 'w', encoding='utf-8') as file:
            file.write(AnswerModifier(formatted_chatlog))
    except Exception as e:
        print(f"Error in ChatlogIntegration: {e}")

def ShowChatsOnGUI():
    """Display chats on the GUI"""
    try:
        with open(TempDirectoryPath('Database.data'), "r", encoding='utf-8') as file:
            data = file.read()
        
        if len(str(data)) > 0:
            lines = data.split('\n')
            result = '\n'.join(lines)
            
            with open(TempDirectoryPath('Responses.data'), "w", encoding='utf-8') as file:
                file.write(result)
    except Exception as e:
        print(f"Error in ShowChatsOnGUI: {e}")

def InitialExecution():
    """Initialize the application"""
    try:
        SetMicrophoneStatus("False")
        ShowTextToScreen("")
        ShowDefaultChatIfNoChats()
        ChatlogIntegration()
        ShowChatsOnGUI()
        print("✅ S.H.A.D.O.W.-AI initialized successfully!")
    except Exception as e:
        print(f"❌ Error in InitialExecution: {e}")

# Initialize the application
InitialExecution()

def MainExecution():
    """Main execution function for processing user queries"""
    try:
        TaskExecution = False
        ImageExecution = False
        ImageGenerationQuery = ""

        # Get user input through speech recognition
        SetAssistantStatus("Listening ...")
        Query = SpeechRecognition()
        ShowTextToScreen(f"{Username} : {Query}")
        
        # Process the query through the decision model
        SetAssistantStatus("Thinking ...")
        Decision = FirstLayerDMM(Query)

        print(f"\n🧠 Decision : {Decision}\n")

        # Check for general and realtime queries
        G = any([i for i in Decision if i.startswith("general")])
        R = any([i for i in Decision if i.startswith("realtime")])

        # Merge general and realtime queries
        merged_queries = [i.split(" ", 1)[1] if " " in i else i for i in Decision if i.startswith('general') or i.startswith('realtime')]
        Merged_query = " and ".join(merged_queries)

        # Check for image generation requests
        for queries in Decision:
            if "generate" in queries:
                ImageGenerationQuery = str(queries)
                ImageExecution = True

        # Execute automation tasks
        for queries in Decision:
            if TaskExecution == False:
                if any(queries.startswith(func) for func in Functions):
                    run(Automation(list(Decision)))
                    TaskExecution = True

        # Handle image generation
        if ImageExecution == True:
            try:
                os.makedirs("Frontend/Files", exist_ok=True)
                with open(r"Frontend/Files/ImageGeneration.data", "w") as file:
                    file.write(f"{ImageGenerationQuery},True")

                p1 = subprocess.Popen(['python', r'Backend/ImageGeneration.py'],
                                     stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                     stdin=subprocess.PIPE, shell=False)
                Subprocesses.append(p1)
            except Exception as e:
                print(f"❌ Error starting ImageGeneration.py: {e}")

        # Handle realtime queries
        if (G and R) or R:
            SetAssistantStatus("Searching ...")
            Answer = RealtimeSearchEngine(QueryModifier(Merged_query))
            ShowTextToScreen(f"{Assistantname} : {Answer}")
            SetAssistantStatus("Answering ...")
            TextToSpeech(Answer)
            return True

        # Handle individual queries
        else:
            for Queries in Decision:
                if "general" in Queries:
                    SetAssistantStatus("Thinking ...")
                    QueryFinal = Queries.replace("general", "").strip()
                    Answer = ChatBot(QueryModifier(QueryFinal))
                    ShowTextToScreen(f"{Assistantname} : {Answer}")
                    SetAssistantStatus("Answering ...")
                    TextToSpeech(Answer)
                    return True

                elif "realtime" in Queries:
                    SetAssistantStatus("Searching ...")
                    QueryFinal = Queries.replace("realtime", "").strip()
                    Answer = RealtimeSearchEngine(QueryModifier(QueryFinal))
                    ShowTextToScreen(f"{Assistantname} : {Answer}")
                    SetAssistantStatus("Answering ...")
                    TextToSpeech(Answer)
                    return True

                elif "exit" in Queries:
                    QueryFinal = "Okay, Bye!"
                    Answer = ChatBot(QueryModifier(QueryFinal))
                    ShowTextToScreen(f"{Assistantname} : {Answer}")
                    SetAssistantStatus("Answering ...")
                    TextToSpeech(Answer)
                    SetAssistantStatus("Shutting down ...")
                    os._exit(1)
    
    except Exception as e:
        print(f"❌ Error in MainExecution: {e}")
        SetAssistantStatus("Error occurred")

def FirstThread():
    """Main thread for handling user interactions"""
    while True:
        try:
            CurrentStatus = GetMicrophoneStatus()

            if CurrentStatus == "True":
                MainExecution()
            else:
                AIStatus = GetAssistantStatus()

                if "Available..." in AIStatus:
                    sleep(0.1)
                else:
                    SetAssistantStatus("Available ...")
        except Exception as e:
            print(f"❌ Error in FirstThread: {e}")
            sleep(1)

def SecondThread():
    """Second thread for GUI"""
    try:
        GraphicalUserInterface()
    except Exception as e:
        print(f"❌ Error in SecondThread: {e}")

if __name__ == "__main__":
    try:
        print("🚀 Starting S.H.A.D.O.W.-AI...")
        
        # Start the main thread
        thread1 = threading.Thread(target=FirstThread, daemon=True)
        thread1.start()
        
        # Start the GUI thread
        thread2 = threading.Thread(target=SecondThread, daemon=True)
        thread2.start()
        
        # Keep the main thread alive
        while True:
            sleep(1)
            
    except KeyboardInterrupt:
        print("\n⏹️ S.H.A.D.O.W.-AI stopped by user")
    except Exception as e:
        print(f"❌ Fatal error in main: {e}")
