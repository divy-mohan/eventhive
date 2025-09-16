"""
URL configuration for event_tracker project.

Main URL configuration for the Mini Event Tracker API.
Routes all API endpoints and admin interface.

Author: Generated for Mini Event Tracker
Created: September 16, 2025
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('events.urls')),
]
