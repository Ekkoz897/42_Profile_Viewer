from django.contrib import admin

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("42 OAuth", {"fields": ("fortytwo_id", "is_fortytwo_user", "profile_picture", "campus", "level")}),
    )
    list_display = ("username", "email", "fortytwo_id", "is_staff")
    search_fields = ("username", "email", "fortytwo_id")
