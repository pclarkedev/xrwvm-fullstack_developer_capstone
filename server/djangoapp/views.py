from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import logging
import json
from django.views.decorators.csrf import csrf_exempt


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
    return JsonResponse({'status': 'Logged out'})


@csrf_exempt
def registration(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        username = data['userName'].strip()
        password = data['password']
        email = data.get('email', '').strip()
    except (json.JSONDecodeError, KeyError, AttributeError):
        return JsonResponse({'status': 'Invalid registration request'}, status=400)

    if not username or not password:
        return JsonResponse({'status': 'Username and password are required'}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({'status': 'Username already exists'}, status=409)

    user = User.objects.create_user(username=username, email=email, password=password)
    login(request, user)
    return JsonResponse({'userName': user.username, 'status': 'Registered'}, status=201)

# # Update the `get_dealerships` view to render the index page with
# a list of dealerships
# def get_dealerships(request):
# ...

# Create a `get_dealer_reviews` view to render the reviews of a dealer
# def get_dealer_reviews(request,dealer_id):
# ...

# Create a `get_dealer_details` view to render the dealer details
# def get_dealer_details(request, dealer_id):
# ...

# Create a `add_review` view to submit a review
# def add_review(request):
# ...
