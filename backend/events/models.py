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
    Custom user manager - handles creating users with email instead of username
    """
    
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        """
        Create a regular user account
        """
        # Validate required fields
        if not email:
            raise ValueError('Email is required')
        if not first_name:
            raise ValueError('First name is required')
        if not last_name:
            raise ValueError('Last name is required')
        
        # Clean up email - make it lowercase and remove extra spaces
        email = self.normalize_email(email.strip().lower())
        
        # Create the user with clean data
        user = self.model(
            email=email,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            **extra_fields
        )
        
        # Hash the password and save user to database
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
    Custom User model - uses email for login instead of username
    """
    
    # Email field - this is what users log in with
    email = models.EmailField(
        unique=True,
        blank=False,
        null=False,
        help_text="User's email address for login"
    )
    
    # Required name fields for personalization
    first_name = models.CharField(
        max_length=150,
        blank=False,
        null=False,
        validators=[MinLengthValidator(1)],
        help_text="User's first name"
    )
    
    last_name = models.CharField(
        max_length=150,
        blank=False,
        null=False,
        validators=[MinLengthValidator(1)],
        help_text="User's last name"
    )
    
    # Use our custom manager for creating users
    objects = UserManager()
    
    # We don't need username - email is used for login
    username = None
    
    # Tell Django to use email for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Required when creating superuser
    
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
    
    @property
    def full_name(self):
        """
        Property for accessing full name.
        
        Returns:
            str: Full name combining first and last name
        """
        return self.get_full_name()
    
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
        return self.filter(date_time__gt=timezone.now(), user=user).order_by('date_time')


class Event(models.Model):
    """
    Event model - stores user's scheduled events
    """
    
    # Use our custom manager with helper methods
    objects = EventManager()
    
    # Basic event information
    title = models.CharField(
        max_length=200,
        blank=False,
        null=False,
        validators=[MinLengthValidator(3)],
        help_text="Event title (3-200 characters)"
    )
    
    date_time = models.DateTimeField(
        blank=False,
        null=False,
        help_text="When the event happens"
    )
    
    location = models.TextField(
        blank=False,
        null=False,
        validators=[MinLengthValidator(5)],
        help_text="Where the event takes place"
    )
    
    # Optional details
    description = models.TextField(
        blank=True,  # User doesn't have to fill this
        null=True,   # Can be empty in database
        help_text="Extra details about the event"
    )
    
    # For sharing events publicly (generated when needed)
    share_id = models.UUIDField(
        null=True,
        blank=True,
        unique=True,
        help_text="UUID for public sharing"
    )
    
    # Who owns this event
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,  # Delete events when user is deleted
        related_name='events',     # Allows user.events.all() queries
        help_text="Event owner"
    )
    
    # Automatic timestamps - Django handles these
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When event was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When event was last updated"
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
        formatted_date = self.date_time.strftime("%Y-%m-%d %H:%M") if self.date_time else "No date"
        user_name = f"{self.user.first_name} {self.user.last_name}".strip() if self.user else "No user"
        
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
        return self.date_time and self.date_time < timezone.now()
    
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
            # Skip validation for existing events to avoid unnecessary DB queries
            pass
    
    def save(self, *args, **kwargs):
        """
        Override save method to run validation.
        
        This ensures that our custom validation in clean() is always
        executed when saving through the ORM.
        """
        try:
            self.full_clean()
        except ValidationError as e:
            # Re-raise ValidationError for proper handling
            raise e
        super().save(*args, **kwargs)


