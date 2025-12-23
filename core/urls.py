from django.urls import path
from .views import menu_api, create_order, list_orders, update_order_status

urlpatterns = [
    path('menu/', menu_api),
    path('order/', create_order),
    path('orders/', list_orders),
    path('order/<int:order_id>/status/', update_order_status),
]
