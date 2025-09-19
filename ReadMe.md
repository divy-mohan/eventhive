# 🚀 EventHive - Modern Event Management System

<div align="center">

![EventHive Logo](https://img.shields.io/badge/EventHive-Event%20Management-blue?style=for-the-badge&logo=calendar&logoColor=white)

**A beautiful, modern event management application built with Django & React**

[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.2+-green?style=flat-square&logo=django)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3+-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

[🌟 Features](#-features) • [🚀 Quick Start](#-quick-start) • [🛠️ Tech Stack](#️-tech-stack) • [📱 Screenshots](#-screenshots) • [🎯 API Documentation](#-api-documentation)

</div>

---

## ✨ Features

### 🎨 **Modern UI/UX Design**
- **Gradient Backgrounds** - Beautiful color transitions throughout the app
- **Smooth Animations** - Hover effects, transitions, and micro-interactions
- **Responsive Design** - Perfect on desktop, tablet, and mobile devices
- **Dark Mode Ready** - Modern color schemes and typography

### 📅 **Event Management**
- **Create Events** - Add title, date, time, location, and description
- **Edit & Delete** - Full CRUD operations with real-time updates
- **Smart Filtering** - Filter by upcoming, past, or all events
- **Search Functionality** - Find events quickly by title or location
- **Event Status** - Visual indicators for upcoming vs past events

### 🔐 **Authentication & Security**
- **JWT Authentication** - Secure token-based authentication
- **User Registration** - Email-based account creation
- **Password Validation** - Strong password requirements
- **Protected Routes** - Secure access to user data

### 🌐 **Sharing & Collaboration**
- **Public Event Sharing** - Generate shareable links for events
- **Social Sharing** - Native share API integration
- **Copy to Clipboard** - Easy link sharing functionality

### 🎓 **Interactive Tutorial System**
- **Step-by-Step Guide** - Interactive tutorial for new users
- **Visual Highlights** - Guided tour with element highlighting
- **Skip Option** - Users can skip or restart tutorial anytime
- **Progress Tracking** - Remember tutorial completion status

### 📊 **Dashboard Analytics**
- **Event Statistics** - Total, upcoming, and past event counts
- **Recent Events** - Quick access to latest events
- **Visual Cards** - Beautiful gradient cards with animations
- **Quick Actions** - Fast event creation from dashboard

---

## 🚀 Quick Start

### 📋 Prerequisites

Make sure you have these installed:
- **Python 3.8+** 🐍
- **Node.js 16+** 📦
- **Git** 🔧

### ⚡ One-Command Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd eventhive

# Run the automated setup script
python runproject.py
```

That's it! 🎉 The script will:
- ✅ Create virtual environment
- ✅ Install all dependencies
- ✅ Run database migrations
- ✅ Open separate terminals for backend & frontend
- ✅ Start both servers automatically

### 🌐 Access Your Application

After running the script, open your browser to:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

---

## 🛠️ Tech Stack

### 🔙 **Backend**
```
🐍 Django 5.2+          - Web framework
🔐 Django REST Framework - API development
🎫 JWT Authentication   - Secure tokens
🗄️ SQLite Database     - Local development
📊 Django Filters       - Advanced filtering
🌐 Django CORS Headers  - Cross-origin requests
```

### 🎨 **Frontend**
```
⚛️ React 18+           - UI library
🚀 Vite                - Build tool & dev server
🎨 TailwindCSS         - Utility-first CSS
🧭 React Router        - Client-side routing
🔥 React Hot Toast     - Beautiful notifications
📅 date-fns            - Date manipulation
🎯 Heroicons           - Beautiful icons
```

### 🔧 **Development Tools**
```
🐍 Python Virtual Env  - Isolated Python environment
📦 npm                 - Package management
🔄 Hot Reload          - Instant development feedback
🎯 ESLint              - Code quality
💅 Prettier            - Code formatting
```

---

## 📱 Screenshots

### 🏠 Dashboard
<div align="center">
<img src="https://via.placeholder.com/800x500/667eea/ffffff?text=Beautiful+Dashboard+with+Gradient+Cards" alt="Dashboard" width="100%">
</div>

*Modern dashboard with gradient statistics cards, recent events, and quick actions*

### 📋 Events List
<div align="center">
<img src="https://via.placeholder.com/800x500/764ba2/ffffff?text=Events+List+with+Search+%26+Filters" alt="Events List" width="100%">
</div>

*Responsive event cards with search, filtering, and beautiful animations*

### 📝 Event Details
<div align="center">
<img src="https://via.placeholder.com/800x500/f093fb/ffffff?text=Event+Details+%26+Management" alt="Event Details" width="100%">
</div>

*Detailed event view with editing capabilities and sharing options*

### 🎓 Interactive Tutorial
<div align="center">
<img src="https://via.placeholder.com/800x500/4facfe/ffffff?text=Interactive+Tutorial+System" alt="Tutorial" width="100%">
</div>

*Step-by-step guided tour for new users with visual highlights*

---

## 🎯 API Documentation

### 🔐 Authentication Endpoints
```http
POST /api/auth/register/     # User registration
POST /api/auth/login/        # User login
POST /api/auth/refresh/      # Token refresh
GET  /api/auth/profile/      # User profile
```

### 📅 Event Management
```http
GET    /api/events/                    # List user events
POST   /api/events/                    # Create new event
GET    /api/events/{id}/               # Get event details
PUT    /api/events/{id}/               # Update event
DELETE /api/events/{id}/               # Delete event
GET    /api/events/upcoming/           # Upcoming events
GET    /api/events/past/               # Past events
POST   /api/events/{id}/generate_share_link/  # Generate share link
```

### 📊 Dashboard & Analytics
```http
GET /api/dashboard/stats/              # Dashboard statistics
GET /api/public/events/{share_id}/     # Public event access
GET /api/health/                       # API health check
```

---

## 🏗️ Project Structure

```
eventhive/
├── 🐍 backend/                    # Django Backend
│   ├── event_tracker/             # Main Django project
│   ├── events/                    # Events app
│   │   ├── models.py             # Database models
│   │   ├── serializers.py        # API serializers
│   │   ├── views.py              # API views
│   │   └── urls.py               # URL routing
│   ├── requirements.txt          # Python dependencies
│   └── manage.py                 # Django management
│
├── ⚛️ frontend/event-tracker-ui/  # React Frontend
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── Tutorial.jsx      # Interactive tutorial
│   │   │   ├── TutorialButton.jsx # Tutorial trigger
│   │   │   └── LoadingSpinner.jsx # Loading states
│   │   ├── pages/                # Page components
│   │   │   ├── DashboardPage.jsx # Main dashboard
│   │   │   ├── EventsPage.jsx    # Events list
│   │   │   ├── EventDetailPage.jsx # Event details
│   │   │   ├── LoginPage.jsx     # Authentication
│   │   │   └── RegisterPage.jsx  # User registration
│   │   ├── contexts/             # React contexts
│   │   │   └── AuthContext.jsx   # Authentication state
│   │   └── utils/
│   │       └── api.js            # API client
│   ├── package.json              # Node dependencies
│   └── tailwind.config.js        # Styling configuration
│
├── 🚀 runproject.py              # Automated setup script
└── 📖 README.md                  # This file
```

---

## 🎨 Design Features

### 🌈 **Color Palette**
- **Primary**: Purple to Blue gradients (`from-purple-600 to-blue-600`)
- **Success**: Green to Emerald (`from-green-500 to-emerald-600`)
- **Warning**: Orange to Red (`from-orange-500 to-red-600`)
- **Neutral**: Gray scales with subtle gradients

### ✨ **Animations & Effects**
- **Hover Animations**: Scale transforms and shadow changes
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Transitions**: 200-300ms duration for all interactions
- **Loading States**: Elegant spinners and skeleton screens

### 📱 **Responsive Design**
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm, md, lg, xl responsive breakpoints
- **Touch Friendly**: Large tap targets and gestures
- **Cross Browser**: Works on all modern browsers

---

## 🔧 Development

### 🛠️ Manual Setup (Alternative)

If you prefer manual setup instead of using `runproject.py`:

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend/event-tracker-ui
npm install
npm run dev
```

### 🧪 Testing
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend/event-tracker-ui
npm test
```

### 🚀 Production Deployment
```bash
# Build frontend for production
cd frontend/event-tracker-ui
npm run build

# Collect static files
cd backend
python manage.py collectstatic
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **💾 Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to the branch (`git push origin feature/amazing-feature`)
5. **🔄 Open** a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Django Team** - For the amazing web framework
- **React Team** - For the powerful UI library
- **Tailwind CSS** - For the utility-first CSS framework
- **Heroicons** - For the beautiful icon set
- **Vite** - For the lightning-fast build tool

---

<div align="center">

**Made with ❤️ by [Your Name]**

[⭐ Star this repo](https://github.com/your-username/eventhive) • [🐛 Report Bug](https://github.com/your-username/eventhive/issues) • [💡 Request Feature](https://github.com/your-username/eventhive/issues)

</div>