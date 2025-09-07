import pygetwindow as gw
import pyautogui
import pytesseract
from PIL import Image

class ScreenAwareness:
    @staticmethod
    def get_active_window():
        try:
            window = gw.getActiveWindow()
            if window:
                return window.title
            return "No active window detected"
        except Exception as e:
            return f"Error: {str(e)}"

    @staticmethod
    def capture_screen(filename="Data/screenshots/current.png"):
        screenshot = pyautogui.screenshot()
        screenshot.save(filename)
        return filename

    @staticmethod
    def read_text_from_screen(filename="Data/screenshots/current.png"):
        img = Image.open(filename)
        text = pytesseract.image_to_string(img)
        return text.strip()
