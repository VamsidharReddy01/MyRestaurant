# MYRestaurant - Full Stack Restaurant Management System

A modern, full-stack restaurant management application built with Django (Backend) and React (Frontend). This system enables customers to browse a digital menu, place orders securely, and allows kitchen staff to manage orders in real-time.

## 🚀 Features

### Customer Interface (Public)
- **Digital Menu**: Browse categories (Starters, Main Course, Drinks) with a sticky navigation bar.
- **Cart System**: Add items with quantity selection via a pop-up modal.
- **Checkout Flow**: Simple checkout process requiring Name and Table Number.
- **Real-time Order Status**: View order confirmation and ID.
- **Premium UI**: Modern dark theme with glassmorphism effects and smooth animations.

### Staff Interface (Protected)
- **Secure Login**: Authentication system for kitchen staff.
- **Kitchen Dashboard**: Real-time view of incoming orders.
- **Order Management**: Update status from *Pending* -> *preparing* -> *Ready* -> *Served*.
- **Auto-Refresh**: Dashboard polls for new orders automatically.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, React Router, Context API, Vanilla CSS (Premium Theme).
- **Backend**: Python, Django, Django REST Framework.
- **Database**: SQLite (Development) / PostgreSQL (Production ready).

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js & npm

### 1. Backend Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd Restaurant

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies  (Ensure you have a requirements.txt, if not generate one)
pip install django djangorestframework django-cors-headers

# Run Migrations
python manage.py migrate

# Create Superuser (for Admin panel and Staff login)
python manage.py createsuperuser

# Start Server
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Development Server
npm run dev
```

## 📝 Usage Guide

1.  **Admin Setup**: Access `http://127.0.0.1:8000/admin` to add a Restaurant, Categories, and Menu Items.
2.  **Customer Flow**: Open `http://localhost:5173/`. Enter Name/Table -> Browse Menu -> Checkout.
3.  **Kitchen Flow**: Open `http://localhost:5173/staff/login`. Login with superuser/staff credentials to view orders.

## 📷 Screenshots
*(Add screenshots of Landing Page, Menu, and Kitchen Dashboard here)*

## 📄 License
MIT License
