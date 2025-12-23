from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Restaurant, MenuItem, Order, OrderItem
from .serializers import RestaurantSerializer
from rest_framework.permissions import IsAuthenticated
from django.db import transaction


@api_view(['GET'])
def menu_api(request):
    restaurant = Restaurant.objects.first()
    if not restaurant:
        return Response(
            {"error": "No restaurant found. Please add a restaurant first."},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = RestaurantSerializer(restaurant)
    return Response(serializer.data)


@api_view(['POST'])
def create_order(request):
    customer_name = request.data.get('customer_name')
    table_number = request.data.get('table_number')
    items_data = request.data.get('items')

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

    # Validate all menu items before creating the order
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
                {"error": f"Invalid quantity for menu item ID {menu_item_id}. Quantity must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            menu_item = MenuItem.objects.get(id=menu_item_id)
            validated_items.append({'menu_item': menu_item, 'quantity': quantity})
        except MenuItem.DoesNotExist:
            return Response(
                {"error": f"Menu item with ID {menu_item_id} not found"},
                status=status.HTTP_400_BAD_REQUEST
            )

    with transaction.atomic():
        order = Order.objects.create(
            restaurant=restaurant,
            customer_name=customer_name,
            table_number=table_number
        )

        for item in validated_items:
            OrderItem.objects.create(
                order=order,
                menu_item=item['menu_item'],
                quantity=item['quantity']
            )

    return Response(
        {
            "message": "Order placed successfully",
            "order_id": order.id
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_orders(request):
    orders = Order.objects.all().order_by('-created_at')

    data = []
    for order in orders:
        data.append({
            "order_id": order.id,
            "customer_name": order.customer_name,
            "table_number": order.table_number,
            "status": order.status,
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


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    new_status = request.data.get('status')

    # Consider defining these choices in the Order model for better maintainability
    allowed_statuses = ['pending', 'accepted', 'preparing', 'ready', 'served', 'cancelled']

    if new_status not in allowed_statuses:
        return Response(
            {"error": f"Invalid status '{new_status}'. Allowed statuses are: {', '.join(allowed_statuses)}"},
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

