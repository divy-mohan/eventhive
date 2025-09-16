"""
URL configuration for the Events API.

This module defines all URL patterns for the Event Tracker API endpoints
including authentication, event management, and public sharing.
Designed for professional API structure demonstration.

Author: Generated for Mini Event Tracker
Created: September 16, 2025
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='event')

# URL patterns
urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.user_profile, name='user_profile'),
    
    # Event management endpoints (handled by ViewSet)
    path('', include(router.urls)),
    
    # Dashboard and statistics
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # Public endpoints (no authentication required)
    path('public/events/<str:share_id>/', views.public_event_detail, name='public_event_detail'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),
]

"""
API Endpoints Summary:

Authentication:
- POST /api/auth/register/           - User registration
- POST /api/auth/login/              - User login (get JWT tokens)
- POST /api/auth/refresh/            - Refresh JWT access token
- GET  /api/auth/profile/            - Get current user profile

Events (requires authentication):
- GET    /api/events/                - List user's events
- POST   /api/events/                - Create new event
- GET    /api/events/{id}/           - Get specific event details
- PUT    /api/events/{id}/           - Update entire event
- PATCH  /api/events/{id}/           - Partially update event
- DELETE /api/events/{id}/           - Delete event
- GET    /api/events/upcoming/       - List upcoming events
- GET    /api/events/past/           - List past events
- POST   /api/events/{id}/generate_share_link/ - Generate public share link

Dashboard:
- GET /api/dashboard/stats/          - Get dashboard statistics

Public Access:
- GET /api/public/events/{share_id}/ - View shared event (no auth required)

Utilities:
- GET /api/health/                   - API health check

Query Parameters (for event listing):
- ?search=query                      - Search in title, location, description
- ?ordering=date_time                - Order by field (prefix with - for desc)
- ?page=1                           - Pagination
"""