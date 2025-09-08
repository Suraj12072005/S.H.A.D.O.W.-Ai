from groq import Groq, GroqError  # Groq API
from json import load, dump
import datetime
import os
from dotenv import load_dotenv

# -------------------- Load environment variables --------------------
load_dotenv()  # loads .env if present
Username = os.getenv("Username", "Suraj")
Assistantname = os.getenv("Assistantname", "Shadow AI")
GroqAPIKey = os.getenv("GROQ_API_KEY")  # must be set in env

# -------------------- Lazy Groq Client Initialization --------------------
_client = None
def get_groq_client():
    global _client
    if _client is None:
        if not GroqAPIKey:
            print("⚠️ Warning: GROQ_API_KEY not set. Groq features disabled.")
            _client = None
        else:
            try:
                _client = Groq(api_key=GroqAPIKey)
            except GroqError as e:
                print(f"⚠️ Failed to initialize Groq client: {e}")
                _client = None
    return _client

# -------------------- File paths --------------------
CHAT_LOG_FILE = r"Data\ChatLog.json"
MEMORY_FILE = r"Data\ShadowMemory.json"

# -------------------- Load or create chat log --------------------
if not os.path.exists(CHAT_LOG_FILE):
    with open(CHAT_LOG_FILE, "w") as f:
        dump([], f)

# -------------------- Load or create memory --------------------
def load_memory():
    try:
        with open(MEMORY_FILE, "r") as f:
            return load(f)
    except:
        return {"responses": {}}

def save_memory(memory):
    with open(MEMORY_FILE, "w") as f:
        dump(memory, f, indent=4)

memory = load_memory()

# -------------------- System message --------------------
System = f"""Hello, I am {Username}, You are a very accurate and advanced AI chatbot named {Assistantname} which also has real-time up-to-date information from the internet.
*** Do not tell time until I ask, do not talk too much, just answer the question.***
*** Reply in only English, even if the question is in Hindi, reply in English.***
*** Do not provide notes in the output, just answer the question and never mention your training data. ***
"""
SystemChatBot = [{"role": "system", "content": System}]

# -------------------- Real-time info --------------------
def RealtimeInformation():
    now = datetime.datetime.now()
    data = f"Please use this real-time information if needed, \n"
    data += f"Day: {now.strftime('%A')}\nDate: {now.strftime('%d')} \nMonth: {now.strftime('%B')}\nYear: {now.strftime('%Y')}\n"
    data += f"Time: {now.strftime('%H')} hours :{now.strftime('%M')} minutes :{now.strftime('%S')} seconds. \n"
    return data

# -------------------- Answer modifier --------------------
def AnswerModifier(Answer):
    lines = Answer.split('\n')
    non_empty_lines = [line for line in lines if line.strip()]
    return '\n'.join(non_empty_lines)

# -------------------- Main chatbot function --------------------
def ChatBot(Query):
    global memory

    try:
        # -------------------- Load chat log --------------------
        with open(CHAT_LOG_FILE, "r") as f:
            messages = load(f)

        # -------------------- Owner correction feature --------------------
        if "sir bolo" in Query.lower():
            memory["responses"]["hello"] = "Hello Suraj Sir"
            save_memory(memory)
            return "Ok, Suraj Sir"

        # Correct previous answer manually
        if Query.lower().startswith("correct:"):
            try:
                parts = Query.split(":", 2)
                question = parts[1].strip().lower()
                correct_answer = parts[2].strip()
                memory["responses"][question] = correct_answer
                save_memory(memory)
                return f"Got it! I will remember the correct answer for '{question}'."
            except:
                return "Format error! Use: correct:question:correct_answer"

        # Predefined memory response
        if Query.lower() in memory["responses"]:
            answer = memory["responses"][Query.lower()]
            messages.append({"role": "assistant", "content": answer})
            with open(CHAT_LOG_FILE, "w") as f:
                dump(messages, f, indent=4)
            return answer

        # -------------------- Normal AI response via Groq API --------------------
        client = get_groq_client()
        if client is None:
            return "Groq API key not configured. Unable to answer AI queries."

        messages.append({"role": "user", "content": Query})
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=SystemChatBot + [{"role": "system", "content": RealtimeInformation()}] + messages,
            max_tokens=1024,
            temperature=0.7,
            top_p=1,
            stream=True,
            stop=None
        )

        Answer = ""
        for chunk in completion:
            if chunk.choices[0].delta.content:
                Answer += chunk.choices[0].delta.content

        Answer = Answer.replace("</s>", "")
        messages.append({"role": "assistant", "content": Answer})

        with open(CHAT_LOG_FILE, "w") as f:
            dump(messages, f, indent=4)

        return AnswerModifier(Answer)

    except Exception as e:
        print(f"Error: {e}")
        return "An error occurred while processing your query."

# -------------------- Run chatbot in terminal --------------------
if __name__ == "__main__":
    print(f"{Assistantname} is online. Type your questions or commands:")
    while True:
        user_input = input("Owner: ")
        print(f"{Assistantname}: {ChatBot(user_input)}")
