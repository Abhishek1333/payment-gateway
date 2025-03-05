from django.db import models
from django.contrib.auth.models import User

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.FloatField()
    converted_amount = models.FloatField(null=True, blank=True)
    payment_method = models.CharField(
        max_length=50, 
        choices=[('Card', 'Card'), ('UPI', 'UPI'), ('NetBanking', 'NetBanking')]
    )
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=20, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    

    card_details = models.JSONField(null=True, blank=True)
    utr_number = models.CharField(max_length=100, null=True, blank=True)
    bank = models.CharField(max_length=100, null=True, blank=True)
    account_number = models.CharField(max_length=100, null=True, blank=True)
    ifsc_code = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} {self.currency}"
