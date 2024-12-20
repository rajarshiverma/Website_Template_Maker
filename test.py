import google.generativeai as genai
api_key = "AIzaSyAaSetPbQmuQK3CMTvaVUygFXIk69oNQV8"
genai.configure(api_key="AIzaSyAaSetPbQmuQK3CMTvaVUygFXIk69oNQV8")
model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("How much total tokens I have using gemini api key")
print(response.text)