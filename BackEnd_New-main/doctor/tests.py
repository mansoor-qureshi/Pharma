import requests
import base64
import json
from src.settings import INTERAKT_API_KEY

class MessageSender:
    def __init__(self):
        self.api_key = INTERAKT_API_KEY
        self.url = "https://api.interakt.ai/v1/public/message/"
        self.headers = self._create_headers()

    def _create_headers(self):
        encoded_api_key = base64.b64encode(self.api_key.encode()).decode()
        return {
            "Authorization": f"Basic {encoded_api_key}",
            "Content-Type": "application/json"
        }
        
    def send_message(self,  country_code: str, phone_number: str, template_name: str, 
                header_values: list, body_values: list, button_values: dict, file_name: str = None, callback_data: str = None):
        payload = {
            "countryCode": country_code,
            "phoneNumber": phone_number,
            "type": "Template",
            "callbackData": callback_data,
            "template": {
                "name": template_name,
                "languageCode": "en",
                "headerValues": header_values,
                "fileName": file_name,  # Optional, if using document header
                "bodyValues": body_values,
                "buttonValues": button_values
            }
        }

        response = requests.post(url=self.url, headers=self.headers, data=json.dumps(payload))
        
        if response.status_code == 200:
            print("Message sent successfully!")
            print("Response ID:", response.json().get("id"))
            return response.json()
        else:
            print("Failed to send message:", response.status_code, response.text)
            return None
        
# -------------------------------------------------------------------------------------------------------------------

import requests
import base64
import json
from src.settings import INTERAKT_API_KEY

class MessageSender:
    def __init__(self):
        self.api_key = INTERAKT_API_KEY  # Your API key fetched from settings or environment
        self.url = "https://api.interakt.ai/v1/public/message/"
        self.headers = self._create_headers()

    def _create_headers(self):
        """Encodes the API key and sets the required headers for the request."""
        encoded_api_key = base64.b64encode(self.api_key.encode()).decode()
        return {
            "Authorization": f"Basic {encoded_api_key}",
            "Content-Type": "application/json"
        }

    def send_message(self, country_code: str, phone_number: str, template_name: str,
                     header_values: list, body_values: list, button_values: dict, 
                     file_name: str = None, callback_data: str = None):
        """Sends a message using the Interakt API with dynamic values."""
        # Construct the payload dynamically
        payload = {
            "countryCode": country_code,
            "phoneNumber": phone_number,
            "type": "Template",
            "callbackData": callback_data,
            "template": {
                "name": template_name,
                "languageCode": "en",
                "headerValues": header_values,
                "fileName": file_name,  # Optional, if using document header
                "bodyValues": body_values,
                "buttonValues": button_values
            }
        }

        # Send POST request to the API
        response = requests.post(url=self.url, headers=self.headers, data=json.dumps(payload))
        
        # Check response status and return the result
        if response.status_code == 200:
            print("Message sent successfully!")
            print("Response ID:", response.json().get("id"))
            return response.json()
        else:
            print("Failed to send message:", response.status_code, response.text)
            return None
