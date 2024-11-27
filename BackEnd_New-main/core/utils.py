# import requests
# import base64
# import json
# # Your API key and endpoint details
# api_key = "<API_KEY>"  # Replace with your actual API key
# url = "https://api.interakt.ai/v1/public/message/"
 
# # Encode the API key in Base64 for Basic Auth
# encoded_api_key = base64.b64encode(api_key.encode()).decode()
# # Set headers
# headers = {
#     "Authorization": f"Basic {encoded_api_key}",
#     "Content-Type": "application/json"
# }

# # Define the payload
# payload = {
#     "countryCode": "+xx",            # Replace with the actual country code
#     "phoneNumber": "xxxxxxxxxx",      # Replace with the actual phone number
#     "type": "Template",
#     "callbackData": "some_callback_data",  # Optional

#     "template": {
#         "name": "delivered_alert_101",     # Replace with the actual template name
#         "languageCode": "en",
#         "headerValues": [
#             "Alert"                       # Header text variable
#         ],
#         "fileName": "dummy.pdf",          # Optional, if using document header
#         "bodyValues": [
#             "There",                      # Body variable {{1}}
#             "1234"                        # Body variable {{2}}
#         ],
#         "buttonValues": {
#             "0": [
#                 "12344"                   # Value for dynamic URL in button at index 0
#             ]
#         }
#     }
# }
# # Send POST request
# response = requests.post(url, headers=headers, data=json.dumps(payload))
 
# # Check response
# if response.status_code == 200:
#     print("Message sent successfully!")
#     print("Response ID:", response.json().get("id"))
# else:
#     print("Failed to send message:", response.status_code, response.text)

# ---------------------------------------------------------------------------------------------------------------------
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
    
    def send_message(self, country_code: str, phone_number: str, template_name: str,
                     header_values: list, body_values: list, button_values: dict, 
                     file_name: str = None, callback_data: str = None):
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
