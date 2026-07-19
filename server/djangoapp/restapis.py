import os

import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv('backend_url', 'http://localhost:3030')
if not backend_url.startswith(('http://', 'https://')):
    backend_url = 'http://localhost:3030'

sentiment_analyzer_url = os.getenv('sentiment_analyzer_url', 'http://localhost:5050/')
if not sentiment_analyzer_url.startswith(('http://', 'https://')):
    sentiment_analyzer_url = 'http://localhost:5050/'

def get_request(endpoint, **kwargs):
    request_url = f"{backend_url.rstrip('/')}/{endpoint.lstrip('/')}"
    response = requests.get(request_url, params=kwargs, timeout=10)
    response.raise_for_status()
    return response.json()

def analyze_review_sentiments(text):
    request_url = f"{sentiment_analyzer_url.rstrip('/')}/analyze/{text}"
    response = requests.get(request_url, timeout=10)
    response.raise_for_status()
    return response.json()

def post_review(data_dict):
    request_url = f"{backend_url.rstrip('/')}/insert_review"
    response = requests.post(request_url, json=data_dict, timeout=10)
    response.raise_for_status()
    return response.json()
