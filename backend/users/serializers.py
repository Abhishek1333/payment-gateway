from django.contrib.auth.models import User
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import KYC

class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        email = validated_data.get('email')

        if User.objects.filter(email=email).exists():
            raise ValidationError({"email": "A user with this email already exists."})

        first_name = validated_data.get('first_name')
        last_name = validated_data.get('last_name')
        password = validated_data.get('password')
        user = User.objects.create_user(username=email, email=email, password=password,first_name=first_name, last_name=last_name)
        return user

class KYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYC
        fields = '__all__'
        read_only_fields = ('user',)
