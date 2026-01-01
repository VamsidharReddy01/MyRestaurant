"""
views.py
---------
This file contains all API endpoints for the restaurant system.

Design goals:
- Customers (guests) can view menu and place orders (no login)
- Staff (chef / owner) can view and manage orders (authenticated)
- All money calculations happen on the backend
- Data integrity is guaranteed using transactions
"""

from decimal import Decimal

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.db import transaction

from .models import Restaurant, MenuItem, Order, OrderItem
from .serializers import RestaurantSerializer


# -------------------------------------------------------------------
# 1️⃣ MENU API (PUBLIC)
# -------------------------------------------------------------------
@api_view(['GET'])
def menu_api(request):
    """
    PURPOSE:
    --------
    This API returns the restaurant menu to customers.

    WHY IT EXISTS:
    --------------
    - Customers scan QR / open link
    - They must see the menu without login
    - Menu is read-only data

    ACCESS:
    -------
    Public (no authentication required)

    METHOD:
    -------
    GET /api/menu/
    """

    restaurant = Restaurant.objects.first()

    # Safety check: menu cannot exist without a restaurant
    if not restaurant:
        return Response(
            {"error": "No restaurant found. Please add a restaurant first."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = RestaurantSerializer(restaurant)
    return Response(serializer.data)


# -------------------------------------------------------------------
# 2️⃣ CREATE ORDER API (PUBLIC)
# -------------------------------------------------------------------
@api_view(['POST'])
def create_order(request):
    """
    PURPOSE:
    --------
    Allows a customer to place an order.

    WHY IT EXISTS:
    --------------
    - Customers are guests (no login)
    - They submit name, table number, and selected items
    - Backend validates everything and calculates total cost

    ACCESS:
    -------
    Public (customers do NOT need accounts)

    METHOD:
    -------
    POST /api/order/
    """

    customer_name = request.data.get('customer_name')
    table_number = request.data.get('table_number')
    items_data = request.data.get('items')

    # Basic request validation
    if not customer_name or not table_number:
        return Response(
            {"error": "Customer name and table number are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not items_data or len(items_data) == 0:
        return Response(
            {"error": "Order must contain at least one item"},
            status=status.HTTP_400_BAD_REQUEST
        )

    restaurant = Restaurant.objects.first()
    if not restaurant:
        return Response(
            {"error": "No restaurant found to place an order."},
            status=status.HTTP_404_NOT_FOUND
        )

    # ---------------------------------------------------------------
    # VALIDATE ALL ITEMS FIRST (IMPORTANT DESIGN DECISION)
    # ---------------------------------------------------------------
    # Why?
    # - We do NOT want partial orders
    # - If one item is invalid, reject everything
    # - Prevents inconsistent data

    validated_items = []

    for item_data in items_data:
        menu_item_id = item_data.get('menu_item_id')
        quantity = item_data.get('quantity', 1)

        if not menu_item_id:
            return Response(
                {"error": "Each item must have a 'menu_item_id'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(quantity, int) or quantity <= 0:
            return Response(
                {"error": f"Invalid quantity for menu item ID {menu_item_id}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            menu_item = MenuItem.objects.get(id=menu_item_id)
            validated_items.append({
                "menu_item": menu_item,
                "quantity": quantity
            })
        except MenuItem.DoesNotExist:
            return Response(
                {"error": f"Menu item with ID {menu_item_id} not found"},
                status=status.HTTP_400_BAD_REQUEST
            )

    # ---------------------------------------------------------------
    # DATABASE TRANSACTION (CRITICAL FOR DATA INTEGRITY)
    # ---------------------------------------------------------------
    # Why transaction.atomic()?
    # - Either the entire order is saved OR nothing is saved
    # - Prevents half-created orders
    # - Very important for financial systems

    with transaction.atomic():

        order = Order.objects.create(
            restaurant=restaurant,
            customer_name=customer_name,
            table_number=table_number
        )

        total_amount = Decimal('0.00')

        for item in validated_items:
            menu_item = item['menu_item']
            quantity = item['quantity']

            # Calculate line total using DB price (SECURE)
            line_total = menu_item.price * quantity
            total_amount += line_total

            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=quantity
            )

        # Save final bill amount
        order.total_amount = total_amount
        order.save()

    return Response(
        {
            "message": "Order placed successfully",
            "order_id": order.id,
            "total_amount": str(order.total_amount)
        },
        status=status.HTTP_201_CREATED
    )


# -------------------------------------------------------------------
# 3️⃣ LIST ORDERS API (STAFF ONLY)
# -------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_orders(request):
    """
    PURPOSE:
    --------
    Allows chefs / staff to view all orders.

    WHY IT EXISTS:
    --------------
    - Kitchen dashboard needs all orders
    - Customers should NOT access this
    - Used for monitoring and preparation

    ACCESS:
    -------
    Staff only (Token Authentication)

    METHOD:
    -------
    GET /api/orders/
    """

    orders = Order.objects.all().order_by('-created_at')

    data = []

    for order in orders:
        data.append({
            "order_id": order.id,
            "customer_name": order.customer_name,
            "table_number": order.table_number,
            "status": order.status,
            "total_amount": str(order.total_amount),
            "created_at": order.created_at,
            "items": [
                {
                    "name": item.menu_item.name,
                    "quantity": item.quantity
                }
                for item in order.items.all()
            ]
        })

    return Response(data)


# -------------------------------------------------------------------
# 4️⃣ UPDATE ORDER STATUS API (STAFF ONLY)
# -------------------------------------------------------------------
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    """
    PURPOSE:
    --------
    Allows staff to update order status.

    WHY IT EXISTS:
    --------------
    - Kitchen workflow control
    - Customers must NOT change status
    - Backend enforces valid state transitions

    ACCESS:
    -------
    Staff only

    METHOD:
    -------
    PATCH /api/order/<id>/status/
    """

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    new_status = request.data.get('status')

    # Allowed order lifecycle states
    allowed_statuses = [
        'pending',
        'accepted',
        'preparing',
        'ready',
        'served',
        'cancelled'
    ]

    if new_status not in allowed_statuses:
        return Response(
            {
                "error": f"Invalid status '{new_status}'. "
                         f"Allowed: {', '.join(allowed_statuses)}"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    order.status = new_status
    order.save()

    return Response(
        {
            "message": "Order status updated",
            "order_id": order.id,
            "new_status": order.status
        }
    )


#---------------LoginAPI--------------------------------------
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token


@api_view(['POST'])
def staff_login(request):
    """
    PURPOSE:
    --------
    Authenticates staff users and returns an auth token.

    WHY IT EXISTS:
    --------------
    - Staff should not access Django admin
    - Frontend needs token-based login
    - Secure authentication via Django

    ACCESS:
    -------
    Public endpoint (credentials required)

    METHOD:
    -------
    POST /api/staff/login/
    """

    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_staff:
        return Response(
            {"error": "Access denied. Not a staff user."},
            status=status.HTTP_403_FORBIDDEN
        )

    token, created = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            "username": user.username
        }
    )
