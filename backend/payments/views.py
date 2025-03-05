import requests
from io import BytesIO
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse
from reportlab.pdfgen import canvas
from .models import Transaction
from .serializers import TransactionSerializer

def get_exchange_rate(base_currency, target_currency):
    url = f"https://api.exchangerate-api.com/v4/latest/{base_currency}"
    response = requests.get(url)
    data = response.json()
    return data['rates'].get(target_currency)

class PaymentViewSet(viewsets.GenericViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='process')
    def process_payment(self, request):
        user = request.user
        try:
            amount = float(request.data.get('amount', 0))
        except ValueError:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        payment_method = request.data.get('payment_method')
        currency = request.data.get('currency', 'INR')

        converted_amount = amount
        if currency != 'INR':
            rate = get_exchange_rate(currency, 'INR')
            if rate:
                converted_amount = amount * rate
            else:
                return Response({"error": "Currency conversion failed."}, status=status.HTTP_400_BAD_REQUEST)

        status_str = 'Success'
        if amount > 100000:
            status_str = 'Flagged'

        extra_fields = {}
        if payment_method == 'Card':
            extra_fields['card_details'] = request.data.get('card_details')
        elif payment_method == 'UPI':
            extra_fields['utr_number'] = request.data.get('utr_number')
        elif payment_method == 'NetBanking':
            extra_fields['bank'] = request.data.get('bank')
            extra_fields['account_number'] = request.data.get('account_number')
            extra_fields['ifsc_code'] = request.data.get('ifsc_code')

        transaction = Transaction.objects.create(
            user=user,
            amount=amount,
            converted_amount=converted_amount,
            payment_method=payment_method,
            currency=currency,
            status=status_str,
            **extra_fields
        )
        serializer = self.get_serializer(transaction)
        return Response({"message": "Payment Processed", "transaction": serializer.data})

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        user = request.user
        transactions = Transaction.objects.filter(user=user)
        serializer = self.get_serializer(transactions, many=True)
        return Response({"transactions": serializer.data})

    @action(detail=False, methods=['get'], url_path='report')
    def generate_report(self, request):
        user = request.user
        transactions = Transaction.objects.filter(user=user)
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        p.drawString(100, 800, f"Transaction Report for {user.username}")
        y = 780
        for txn in transactions:
            line = f"{txn.created_at.strftime('%Y-%m-%d')} | {txn.payment_method} | {txn.amount} {txn.currency} | Status: {txn.status}"
            p.drawString(100, y, line)
            y -= 20
            if y < 50:
                p.showPage()
                y = 800
        p.save()
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename='transaction_report.pdf')
