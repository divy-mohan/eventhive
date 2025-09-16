"""
Django models for the Mini Event Tracker application.

This module defines the core data models for managing users and events.
The models follow Django best practices with proper validation, relationships,
and comprehensive documentation for maintainability.

Author: Generated for Mini Event Tracker
Created: September 16, 2025
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinLengthValidator
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Custom user manager that uses email as the unique identifier
    instead of username for authentication.
    """
    
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        """
        Create and return a regular user with email and password.
        """
        if not email:
            raise ValueError('The Email field must be set')
        if not first_name:
            raise ValueError('The First Name field must be set')
        if not last_name:
            raise ValueError('The Last Name field must be set')
        
        # Normalize email (lowercase and strip whitespace)
        email = self.normalize_email(email.strip().lower())
        
        # Create user instance
        user = self.model(
            email=email,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            **extra_fields
        )
        
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        """
        Create and return a superuser with email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, first_name, last_name, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    
    This model extends the default Django User model to ensure we have
    full control over user authentication and can add custom fields in the future.
    We make email required and unique for modern authentication patterns.
    
    Design Decisions:
    - Email is required and unique for better user identification
    - First name and last name are required for personalization
    - Username is inherited from AbstractUser for Django compatibility
    - Password validation is handled by Django's built-in validators
    
    Future extensibility:
    - Can easily add fields like profile_picture, phone_number, etc.
    - Can add custom user permissions or roles
    - Can integrate with social authentication
    """
    
    email = models.EmailField(
        unique=True,
        blank=False,
        null=False,
        help_text="User's email address. Must be unique and is required for login."
    )
    
    first_name = models.CharField(
        max_length=150,
        blank=False,
        null=False,
        validators=[MinLengthValidator(1)],
        help_text="User's first name. Required for personalization."
    )
    
    last_name = models.CharField(
        max_length=150,
        blank=False,
        null=False,
        validators=[MinLengthValidator(1)],
        help_text="User's last name. Required for personalization."
    )
    
    # Custom manager for email-based authentication
    objects = UserManager()
    
    # Remove username field as we're using email for authentication
    username = None
    
    # Authentication configuration for email-based login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']  # email is excluded as it's the USERNAME_FIELD
    
    class Meta(AbstractUser.Meta):
        """Meta configuration for User model."""
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["last_name", "first_name"]  # Alphabetical ordering
        constraints = [
            # Case-insensitive unique constraint for email
            UniqueConstraint(
                Lower('email'),
                name='unique_lower_email',
                violation_error_message='A user with this email already exists.'
            ),
        ]
        
    def __str__(self):
        """
        String representation of the User model.
        
        Returns a user-friendly string combining first name, last name, and email.
        This is useful in Django admin and debugging.
        """
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def get_full_name(self):
        """
        Return the user's full name.
        
        Returns:
            str: Full name combining first and last name
        """
        return f"{self.first_name} {self.last_name}".strip()
    
    def save(self, *args, **kwargs):
        """
        Override save method to ensure email is properly normalized.
        
        This prevents duplicate users with different email cases and
        ensures consistent email storage format. Also validates required fields.
        """
        # Normalize email (lowercase and strip whitespace)
        if self.email:
            self.email = str(self.email).lower().strip()
        
        # Ensure first_name and last_name are properly trimmed
        if self.first_name:
            self.first_name = str(self.first_name).strip()
        if self.last_name:
            self.last_name = str(self.last_name).strip()
            
        super().save(*args, **kwargs)


# Custom manager for Event model
class EventManager(models.Manager):
    """
    Custom manager for Event model with common query methods.
    
    This manager provides convenient methods for frequently used queries,
    improving code reusability and readability throughout the application.
    """
    
    def upcoming(self):
        """Get all upcoming events ordered by date."""
        return self.filter(date_time__gt=timezone.now()).order_by('date_time')
    
    def past(self):
        """Get all past events ordered by date (most recent first)."""
        return self.filter(date_time__lt=timezone.now()).order_by('-date_time')
    
    def for_user(self, user):
        """Get all events for a specific user."""
        return self.filter(user=user)
    
    def upcoming_for_user(self, user):
        """Get upcoming events for a specific user."""
        return self.upcoming().filter(user=user)


class Event(models.Model):
    """
    Event model representing scheduled events in the application.
    
    This model stores all information about events that users can create,
    view, and manage. Each event belongs to a specific user and contains
    all necessary details for event planning.
    
    Design Decisions:
    - Title has a reasonable 200 character limit for readability
    - DateTime field stores both date and time for precise scheduling
    - Location is a TextField to allow flexible address/location formats
    - Description is optional to allow quick event creation
    - User foreign key with CASCADE delete for data integrity
    - Auto timestamps for audit trail and sorting
    
    Business Rules:
    - Events must have a title, date/time, location, and owner
    - Events are automatically deleted when the owner is deleted
    - Events track creation and modification times automatically
    - Events can be sorted by date for chronological display
    """
    
    # Custom manager
    objects = EventManager()
    
    title = models.CharField(
        max_length=200,
        blank=False,
        null=False,
        validators=[MinLengthValidator(3)],
        help_text="Event title. Must be between 3-200 characters."
    )
    
    date_time = models.DateTimeField(
        blank=False,
        null=False,
        help_text="Date and time when the event will occur. Required field."
    )
    
    location = models.TextField(
        blank=False,
        null=False,
        validators=[MinLengthValidator(5)],
        help_text="Event location or address. Free text format for flexibility."
    )
    
    description = models.TextField(
        blank=True,  # Optional field
        null=True,   # Can be empty in database
        help_text="Optional detailed description of the event."
    )
    
    # Foreign key relationship to User
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,  # Delete events when user is deleted
        related_name='events',     # Allows user.events.all() queries
        help_text="The user who created this event."
    )
    
    # Automatic timestamp fields for audit trail
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the event was created. Set automatically."
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the event was last modified. Updated automatically."
    )
    
    class Meta:
        """Meta configuration for Event model."""
        verbose_name = "Event"
        verbose_name_plural = "Events"
        ordering = ["date_time"]  # Order by event date/time by default
        indexes = [
            # Index for efficient queries by user
            models.Index(fields=['user']),
            # Index for efficient queries by date
            models.Index(fields=['date_time']),
            # Composite index for user's events by date
            models.Index(fields=['user', 'date_time']),
        ]
        
    def __str__(self):
        """
        String representation of the Event model.
        
        Returns a descriptive string with title, date, and owner information.
        This is useful in Django admin, debugging, and logging.
        """
        # Simplified datetime formatting - explicit field value access
        date_time_value = getattr(self, 'date_time', None)
        if date_time_value:
            formatted_date = date_time_value.strftime("%Y-%m-%d %H:%M")
        else:
            formatted_date = "No date"
        
        # Simplified user name access - explicit field value access
        user_obj = getattr(self, 'user', None)
        if user_obj:
            first_name = getattr(user_obj, 'first_name', '')
            last_name = getattr(user_obj, 'last_name', '')
            user_name = f"{first_name} {last_name}".strip()
        else:
            user_name = "No user"
        
        return f"{self.title} - {formatted_date} ({user_name})"
    
    def is_upcoming(self):
        """
        Check if the event is scheduled for the future.
        
        Returns:
            bool: True if event is in the future, False otherwise
        """
        return self.date_time > timezone.now()
    
    def is_past(self):
        """
        Check if the event has already occurred.
        
        Returns:
            bool: True if event is in the past, False otherwise
        """
        return self.date_time < timezone.now()
    
    def clean(self):
        """
        Custom validation for the Event model.
        
        Validates that the event date/time is not in the past when creating new events.
        This prevents accidental creation of past events, though updates are allowed.
        
        Raises:
            ValidationError: If validation fails
        """
        from django.core.exceptions import ValidationError
        
        # Normalize and validate title and location
        if self.title:
            self.title = str(self.title).strip()
            if not self.title:
                raise ValidationError({
                    'title': 'Event title cannot be empty after trimming whitespace.'
                })
        
        if self.location:
            self.location = str(self.location).strip()
            if not self.location:
                raise ValidationError({
                    'location': 'Event location cannot be empty after trimming whitespace.'
                })
        
        # Only validate for new events (no pk yet) or if date_time has changed
        if not self.pk:
            # For new events, just check if date_time is in the past
            if self.date_time and self.date_time < timezone.now():
                raise ValidationError({
                    'date_time': 'Event date and time cannot be in the past.'
                })
        else:
            # For existing events, check if date_time has changed
            try:
                from django.apps import apps
                EventModel = apps.get_model('events', 'Event')
                existing_event = EventModel.objects.get(pk=self.pk)
                if self.date_time != existing_event.date_time and self.date_time < timezone.now():
                    raise ValidationError({
                        'date_time': 'Event date and time cannot be in the past.'
                    })
            except Exception:
                # Handle any exception (DoesNotExist, etc.)
                pass
    
    def save(self, *args, **kwargs):
        """
        Override save method to normalize fields and run validation.
        
        This ensures that our custom validation in clean() is always
        executed when saving through the ORM and fields are normalized.
        """
        # Normalize title and location by stripping whitespace
        if self.title:
            self.title = str(self.title).strip()
        if self.location:
            self.location = str(self.location).strip()
        
        self.full_clean()
        super().save(*args, **kwargs)


