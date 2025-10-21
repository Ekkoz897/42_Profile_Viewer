
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # 42 OAuth fields
    fortytwo_id = models.IntegerField(unique=True, null=True, blank=True)
    is_fortytwo_user = models.BooleanField(default=False)

    # Profile information
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    campus = models.CharField(max_length=100, blank=True, null=True)
    level = models.FloatField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
