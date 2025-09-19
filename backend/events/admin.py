from django.contrib import admin
from .models import User, Event

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'date_time', 'location', 'created_at')
    list_filter = ('date_time', 'created_at', 'user')
    search_fields = ('title', 'location', 'description')
    ordering = ('-date_time',)
    readonly_fields = ('created_at', 'updated_at', 'share_id')
