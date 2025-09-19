"""
Django REST Framework views for the Mini Event Tracker API.

This module provides comprehensive API endpoints for user authentication
and event management with proper permissions, filtering, and error handling.
Designed to demonstrate professional API development practices.

Author: Generated for Mini Event Tracker
Created: September 16, 2025
"""

from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import User, Event
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer, EventSerializer,
    EventListSerializer, PublicEventSerializer, LoginSerializer
)
import uuid


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    
    Ensures that users can only modify their own events while maintaining
    proper security boundaries in the API.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any request (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to the owner of the event
        return obj.user == request.user


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view with enhanced response data.
    
    Returns user profile information along with JWT tokens for
    better frontend integration and user experience.
    """
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle user login and return tokens with user data."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Return tokens with user profile data
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user account.
    
    Creates a new user with email-based authentication and returns
    JWT tokens for immediate login after registration.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            
            # Generate tokens for the new user
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        except Exception:
            return Response({
                'error': 'Registration failed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user's profile information.
    
    Returns authenticated user's profile data for frontend display.
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Event model with comprehensive CRUD operations.
    
    Provides full event management functionality with proper filtering,
    permissions, and search capabilities for the job interview demo.
    
    Features:
    - User-specific event listing
    - Upcoming/past event filtering
    - Search by title and location
    - Proper permissions and validation
    - Optimized queries with select_related
    """
    
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date_time']
    search_fields = ['title', 'location', 'description']
    ordering_fields = ['date_time', 'created_at', 'title']
    ordering = ['date_time']  # Default ordering by event date
    
    def get_queryset(self):
        """
        Return events for the current user only.
        
        Ensures data isolation and security by filtering events
        to only those owned by the authenticated user.
        """
        return Event.objects.filter(user=self.request.user).select_related('user')
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        
        Uses lightweight serializer for list views and full serializer
        for detail views to optimize API performance.
        """
        if self.action == 'list':
            return EventListSerializer
        return EventSerializer
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Get upcoming events for the current user.
        
        Returns events scheduled for the future, ordered by date.
        """
        upcoming_events = self.get_queryset().filter(
            date_time__gt=timezone.now()
        ).order_by('date_time')
        
        serializer = EventListSerializer(upcoming_events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """
        Get past events for the current user.
        
        Returns events that have already occurred, ordered by date (newest first).
        """
        past_events = self.get_queryset().filter(
            date_time__lt=timezone.now()
        ).order_by('-date_time')
        
        serializer = EventListSerializer(past_events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def generate_share_link(self, request, pk=None):
        """
        Generate a public share link for an event.
        
        Creates a shareable UUID that allows public access to event details
        without requiring authentication.
        """
        event = self.get_object()
        
        # Generate unique share ID if not exists
        if not event.share_id:
            try:
                event.share_id = str(uuid.uuid4())
                event.save(update_fields=['share_id'])
            except Exception:
                return Response({
                    'error': 'Failed to generate share link'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        share_url = request.build_absolute_uri(
            f'/api/public/events/{event.share_id}/'
        )
        
        return Response({
            'share_id': event.share_id,
            'share_url': share_url,
            'message': 'Share link generated successfully'
        })
    
    def perform_create(self, serializer):
        """Set the event owner to the current user."""
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new event with enhanced response.
        
        Returns created event data with success message for better UX.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        
        return Response({
            'message': 'Event created successfully',
            'event': EventSerializer(event, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """
        Update an event with enhanced response.
        
        Returns updated event data with success message for better UX.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        
        return Response({
            'message': 'Event updated successfully',
            'event': EventSerializer(event, context={'request': request}).data
        })
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete an event with confirmation message.
        
        Returns success message after deletion for better UX.
        """
        instance = self.get_object()
        event_title = instance.title
        self.perform_destroy(instance)
        
        return Response({
            'message': f'Event "{event_title}" deleted successfully'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_event_detail(request, share_id):
    """
    Get public event details by share ID.
    
    Allows anyone to view basic event information via a shared link
    without requiring authentication. Demonstrates public API capabilities.
    """
    try:
        event = get_object_or_404(Event, share_id=share_id)
        serializer = PublicEventSerializer(event)
        
        return Response({
            'event': serializer.data,
            'message': 'Public event details retrieved successfully'
        })
    except Exception:
        return Response({
            'error': 'Event not found or share link is invalid'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics for the current user.
    
    Returns event counts and summary data for dashboard display,
    demonstrating data aggregation and business logic in the API.
    """
    from django.db.models import Count, Case, When, IntegerField
    
    now = timezone.now()
    
    # Optimized single query for all counts
    stats_query = Event.objects.filter(user=request.user).aggregate(
        total_events=Count('id'),
        upcoming_events=Count(Case(
            When(date_time__gt=now, then=1),
            output_field=IntegerField()
        )),
        past_events=Count(Case(
            When(date_time__lt=now, then=1),
            output_field=IntegerField()
        ))
    )
    
    # Get recent events separately
    recent_events = Event.objects.filter(user=request.user).order_by('-created_at')[:5]
    
    stats = {
        **stats_query,
        'recent_events': EventListSerializer(recent_events, many=True).data
    }
    
    return Response(stats)


# API endpoint for health check
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    API health check endpoint.
    
    Simple endpoint to verify API is running and responsive.
    Useful for monitoring and deployment verification.
    """
    return Response({
        'status': 'healthy',
        'message': 'Event Tracker API is running',
        'timestamp': timezone.now().isoformat()
    })