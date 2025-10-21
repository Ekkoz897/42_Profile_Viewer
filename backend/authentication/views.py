from django.shortcuts import render
import requests
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from urllib.parse import urlencode, urljoin

@api_view(["GET"])
@permission_classes([AllowAny])
def fortytwo_login(request):

	params = {
		"client_id": settings.FORTYTWO_CLIENT_ID,
		"redirect_uri": settings.FORTYTWO_REDIRECT_URI,
		"response_type": "code",
		"scope": "public",
	}
	authorization_url = f"https://api.intra.42.fr/oauth/authorize?{urlencode(params)}"
	return Response({"authorize_url": authorization_url})



@api_view(['GET'])
@permission_classes([AllowAny])
def fortytwo_callback(request):
	code = request.GET.get('code')
	if not code:
		return Response(
			{'error': 'No authorization code provided'},
			status=status.HTTP_400_BAD_REQUEST
		)

	token_url = 'https://api.intra.42.fr/oauth/token'
	token_data = {
		'grant_type': 'authorization_code',
		'client_id': settings.FORTYTWO_CLIENT_ID,
		'client_secret': settings.FORTYTWO_CLIENT_SECRET,
		'code': code,
		'redirect_uri': settings.FORTYTWO_REDIRECT_URI,
	}
	token_response = requests.post(token_url, data=token_data, timeout=10)
	if token_response.status_code != 200:
		return Response(
			{"error": "Failed to obtain access token", "raw": token_response.text},
			status=status.HTTP_400_BAD_REQUEST,
		)

	token_json = token_response.json()
	access_token = token_json.get('access_token')

	user_info_url = 'https://api.intra.42.fr/v2/me'
	headers = {
		'Authorization': f'Bearer {access_token}'
		}

	user_response = requests.get(user_info_url, headers=headers, timeout=10)
	if user_response.status_code != 200:
		return Response(
			{"error": "Failed to fetch 42 profile", "raw": user_response.text},
			status=status.HTTP_400_BAD_REQUEST,
		)
	user_data = user_response.json()
	fortytwo_id = user_data.get('id')
	username = user_data.get('login')
	email = user_data.get('email')
	profile_picture = user_data.get('image', {}).get('link')

	campus_list = user_data.get('campus', [])
	campus = campus_list[0].get('name') if campus_list else None

	cursus_users = user_data.get('cursus_users', [])
	level = cursus_users[0].get('level') if cursus_users else None

	try:
		user = User.objects.get(fortytwo_id=fortytwo_id);

		user.email = email
		user.profile_picture = profile_picture
		user.campus = campus
		user.level = level
		user.save()

	except User.DoesNotExist:
		original_name = username
		counter = 1

		# ensure unique username if login already exists
		while User.objects.filter(username=username).exists():
			username = f"{original_name}_{counter}"
			counter +=1

		user = User(
		username=username,
		email=email,
		fortytwo_id=fortytwo_id,
		is_fortytwo_user=True,
		profile_picture=profile_picture,
		campus=campus,
		level=level,
		)
		user.set_unusable_password()
		user.save()
		print(f"Created new user: {user.username}")

	#JWT Tokens handling
	refresh = RefreshToken.for_user(user)

	access_token = str(refresh.access_token)
	refresh_token = str(refresh)

	target = urljoin(settings.FRONTEND_URL.rstrip('/') + '/', 'me')
	frag = urlencode({
		"access": access_token,
		"refresh": refresh_token,
		"username": user.username,
	})
	return redirect(f"{target}#{frag}")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
	return Response({
		"id": request.user.id,
		"username": request.user.username,
		"email": request.user.email,
		"profile_picture": getattr(request.user, "profile_picture", None),
	})
