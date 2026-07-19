from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import logging
import json
import requests
from django.views.decorators.csrf import csrf_exempt
from .models import CarMake, CarModel
from .populate import initiate
from .restapis import analyze_review_sentiments, get_request, post_review


# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.

# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        username = data['userName'].strip()
        password = data['password']
    except (json.JSONDecodeError, KeyError, AttributeError):
        return JsonResponse({'status': 'Invalid login request'}, status=400)

    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'userName': username, 'status': 'Authenticated'})
    return JsonResponse({'userName': username, 'status': 'Unauthenticated'}, status=401)


@csrf_exempt
def logout_request(request):
    if request.method not in ('GET', 'POST'):
        return JsonResponse({'status': 'Method not allowed'}, status=405)
    logout(request)
    return JsonResponse({'userName': ''})


@csrf_exempt
def registration(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        username = data['userName'].strip()
        password = data['password']
        first_name = data.get('firstName', '').strip()
        last_name = data.get('lastName', '').strip()
        email = data.get('email', '').strip()
    except (json.JSONDecodeError, KeyError, AttributeError):
        return JsonResponse({'status': 'Invalid registration request'}, status=400)

    if not username or not password:
        return JsonResponse({'status': 'Username and password are required'}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({'userName': username, 'error': 'Already Registered'})

    user = User.objects.create_user(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
    )
    login(request, user)
    return JsonResponse({'userName': user.username, 'status': 'Authenticated'})


def get_cars(request):
    if CarMake.objects.count() == 0:
        initiate()

    car_models = CarModel.objects.select_related('car_make')
    cars = [
        {'CarModel': car_model.name, 'CarMake': car_model.car_make.name}
        for car_model in car_models
    ]
    return JsonResponse({'CarModels': cars})

def get_dealerships(request, state=None):
    endpoint = 'fetchDealers' if not state or state == 'All' else f'fetchDealers/{state}'
    try:
        dealerships = get_request(endpoint)
        return JsonResponse({'status': 200, 'dealers': dealerships})
    except requests.RequestException:
        logger.exception('Unable to retrieve dealerships')
        return JsonResponse({'status': 502, 'error': 'Dealership service is unavailable'}, status=502)


def get_dealer_details(request, dealer_id):
    try:
        dealership = get_request(f'fetchDealer/{dealer_id}')
        dealers = [dealership] if dealership else []
        return JsonResponse({'status': 200, 'dealer': dealers})
    except requests.RequestException:
        logger.exception('Unable to retrieve dealership %s', dealer_id)
        return JsonResponse({'status': 502, 'error': 'Dealership service is unavailable'}, status=502)


def get_dealer_reviews(request, dealer_id):
    try:
        reviews = get_request(f'fetchReviews/dealer/{dealer_id}')
        for review in reviews:
            try:
                sentiment = analyze_review_sentiments(review['review'])
                review['sentiment'] = sentiment.get('sentiment', 'neutral')
            except (requests.RequestException, KeyError, ValueError):
                review['sentiment'] = 'neutral'
        return JsonResponse({'status': 200, 'reviews': reviews})
    except requests.RequestException:
        logger.exception('Unable to retrieve reviews for dealership %s', dealer_id)
        return JsonResponse({'status': 502, 'error': 'Review service is unavailable'}, status=502)


@csrf_exempt
def add_review(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'Method not allowed'}, status=405)
    try:
        review = json.loads(request.body)
        post_review(review)
        return JsonResponse({'status': 200})
    except (json.JSONDecodeError, TypeError, requests.RequestException):
        logger.exception('Unable to submit review')
        return JsonResponse({'status': 502, 'error': 'Review could not be submitted'}, status=502)
