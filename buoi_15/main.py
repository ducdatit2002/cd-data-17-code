from openai import OpenAI
from dotenv import load_dotenv
import os 
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(
    api_key=api_key
)
user_question = input("Nhập câu hỏi của bạn: ")
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "system",
            "content": "Bạn là một trợ lý AI hữu ích."
        },
        {
            "role": "user",
            "content": user_question
        }
    ]
)
answer = response.choices[0].message.content
print(answer)