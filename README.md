# NDM + Faith Centre Platform - Ministry Management System

A comprehensive dual-brand church management platform built with FastAPI, React, and MongoDB. Single codebase supporting multiple church brands with independent content management.

## 🌟 Features

### Dual Brand System
- **Nehemiah David Ministry (NDM)**: Primary brand with tagline "Building Lives, Transforming Communities"
- **Faith Centre**: Secondary brand with tagline "Impacting Lives & Imparting Faith"
- Seamless brand switching with preserved user sessions
- Independent content per brand (events, ministries, announcements)

### Public-Facing Features
- **Dynamic Homepage**: Full-width hero section with video/image support, service times, location info
- **Events Management**: List view with filtering, event details, registration tracking (free events)
- **Ministries**: Grid display with volunteer application forms
- **Announcements**: List view with urgent popup modal functionality
- **About Page**: Mission, vision, story, values, FAQ accordion, location map
- **Contact Page**: Contact form with map integration, email capture
- **Newsletter Subscription**: Email capture in footer
- **Mobile-Responsive**: Optimized for all devices

### Admin Features
- **Secure JWT Authentication**: Email/password login with token-based auth
- **Dashboard Overview**: Stats cards showing events, ministries, announcements, volunteers
- **Brands Manager**: Create/edit brands, customize colors, logos, hero content
- **Events Manager**: Full CRUD for events with date, time, location, image URLs
- **Ministries Manager**: Create and manage ministry teams
- **Announcements Manager**: Create announcements with urgent flag and scheduling
- **Volunteer Applications**: View and manage volunteer applications with status tracking
- **Subscriber Management**: View newsletter subscribers

## 🚀 Getting Started

### Initial Setup

1. **Seed the Database**
```bash
python3 scripts/seed_data.py
```

This creates:
- Admin user: `admin@ndm.com` / `admin123`
- Two brands (NDM & Faith Centre)
- Sample events, ministries, and announcements

2. **Access the Application**
- Public Site: https://faith-dashboard-9.preview.emergentagent.com
- Admin Panel: https://faith-dashboard-9.preview.emergentagent.com/admin/login

## 🔐 Admin Credentials

- **Email**: admin@ndm.com
- **Password**: admin123

---

**Built with Emergent AI Agent**
# FC
