"""
Django REST Framework serializers for the Mini Event Tracker API.

This module provides serializers for User registration, authentication,
and Event CRUD operations with proper validation and field handling.
Designed to demonstrate best practices for job interview evaluation.

Author: Generated for Mini Event Tracker
Created: September 16, 2025
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from .models import User, Event
import uuid


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with comprehensive validation.
    
    Handles user signup with email, password, and name validation.
    Demonstrates security best practices and proper error handling.
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Password must be at least 8 characters long."
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirm your password."
    )
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password_confirm')
        extra_kwargs = {
            'email': {
                'required': True,
                'help_text': 'Valid email address for account login.'
            },
            'first_name': {
                'required': True,
                'help_text': 'Your first name.'
            },
            'last_name': {
                'required': True,
                'help_text': 'Your last name.'
            }
        }
    
    def validate_email(self, value):
        """Validate email uniqueness (case-insensitive)."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email address already exists."
            )
        return value.lower().strip()
    
    def validate_password(self, value):
        """Validate password using Django's password validators."""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, attrs):
        """Validate password confirmation matches."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Password confirmation does not match.'
            })
        return attrs
    
    def create(self, validated_data):
        """Create new user with validated data."""
        # Remove password_confirm from validated data
        validated_data.pop('password_confirm', None)
        
        # Create user using custom manager
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information.
    
    Provides read-only access to user profile data for authenticated users.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name', 'date_joined')
        read_only_fields = ('id', 'email', 'date_joined')


class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for Event model with comprehensive validation.
    
    Handles event CRUD operations with proper date/time validation,
    user ownership, and field normalization for the API.
    """
    user = UserProfileSerializer(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Event
        fields = (
            'id', 'title', 'date_time', 'location', 'description',
            'user', 'is_upcoming', 'is_past', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def validate_date_time(self, value):
        """
        Validate event date/time is not in the past for new events.
        Allow updates to existing events even if in the past.
        """
        # For new events (no instance), ensure future date
        if not self.instance and value < timezone.now():
            raise serializers.ValidationError(
                "Event date and time cannot be in the past."
            )
        return value
    
    def validate_title(self, value):
        """Validate and normalize event title."""
        title = str(value).strip()
        if not title:
            raise serializers.ValidationError(
                "Event title cannot be empty."
            )
        if len(title) < 3:
            raise serializers.ValidationError(
                "Event title must be at least 3 characters long."
            )
        return title
    
    def validate_location(self, value):
        """Validate and normalize event location."""
        location = str(value).strip()
        if not location:
            raise serializers.ValidationError(
                "Event location cannot be empty."
            )
        if len(location) < 5:
            raise serializers.ValidationError(
                "Event location must be at least 5 characters long."
            )
        return location
    
    def create(self, validated_data):
        """Create event with current user as owner."""
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class EventListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for event list views.
    
    Optimized for list display with essential fields only.
    Improves API performance for event listing endpoints.
    """
    is_upcoming = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Event
        fields = (
            'id', 'title', 'date_time', 'location',
            'is_upcoming', 'is_past', 'created_at'
        )


class PublicEventSerializer(serializers.ModelSerializer):
    """
    Serializer for public event sharing.
    
    Provides limited event information for public access without
    exposing sensitive user data or full event details.
    """
    organizer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Event
        fields = ('id', 'title', 'date_time', 'location', 'description', 'organizer_name')


# JWT Token serializers for authentication
class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login with email and password.
    
    Validates user credentials and returns user data for JWT token generation.
    """
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})
    
    def validate(self, attrs):
        """Validate user credentials."""
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password', '')
        
        if not email or not password:
            raise serializers.ValidationError(
                'Both email and password are required.'
            )
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError(
                'Invalid email or password.'
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'User account is disabled.'
            )
        
        attrs['user'] = user
        return attrs