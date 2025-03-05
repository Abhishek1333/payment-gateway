from django.db import models
from django.contrib.auth.models import User

class KYC(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    dob = models.DateField()
    aadhar_number = models.CharField(max_length=12)
    pan_number = models.CharField(max_length=10)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return self.full_name
