from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import KYCSerializer
from .models import KYC

class AuthViewSet(viewsets.GenericViewSet):
    """
    A viewset providing endpoints for registration, login, and KYC.
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"error": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=email, email=email, password=password)
        return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(username=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            })
        else:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'post', 'patch'], url_path='kyc', permission_classes=[IsAuthenticated])
    def kyc(self, request):
        try:
            kyc = request.user.kyc 
        except KYC.DoesNotExist:
            kyc = None

        if request.method == "GET":
            if kyc:
                serializer = KYCSerializer(kyc)
                return Response(serializer.data)
            else:
                return Response({"message": "KYC not submitted yet."}, status=status.HTTP_404_NOT_FOUND)

        elif request.method == "POST":
            if kyc:
                return Response({"message": "KYC already submitted. Use PATCH to update."}, status=status.HTTP_400_BAD_REQUEST)

            data = request.data.copy()
            data['user'] = request.user.id
            serializer = KYCSerializer(data=data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response({"message": "KYC submitted successfully.", "data": serializer.data})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == "PATCH":
            if not kyc:
                return Response({"message": "KYC not submitted yet. Use POST to create a KYC record."}, status=status.HTTP_404_NOT_FOUND)
            serializer = KYCSerializer(kyc, data=request.data, partial=True)  
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "KYC updated successfully.", "data": serializer.data})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)