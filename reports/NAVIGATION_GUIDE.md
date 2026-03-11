# Agocare Application Navigation Guide

## Overview
This document outlines the organized page structure and navigation flow for the Agocare healthcare platform.

## Application Structure

### Entry Points
- **index.html** - Welcome/landing page (redirects authenticated users to their dashboard)
- **Login.html** - User login page
- **Signup.html** - User registration page

### User Dashboards
- **patientDashboard.html** - Patient home dashboard
- **doctor-dashboard.html** - Doctor home dashboard  
- **agocare_admin_exact (1).html** - Admin control center

### Feature Pages

#### Health Topics/Categories
- **pediatrics_moderation.html** - Pediatrics discussions & resources
- **pregnancy_moderation.html** - Pregnancy-related content
- **infectious_moderation.html** - Infectious diseases
- **sexual_moderation.html** - Sexual health
- **mental_moderation.html** - Mental health

#### Medical Services
- **medical_centers.html** - Medical facility management
- **medical-library(1).html** - Medical educational resources
- **appointments.html** - Schedule & manage appointments
- **questions-feed.html** - Community Q&A feed

#### User Management
- **doctor-profile(1).html** - Doctor/user profile view & edit
- **my-patients.html** - Patient roster (for doctors)
- **settings(1).html** - User preferences & account settings
- **analytics.html** - Analytics dashboard

## Navigation Architecture

### Navigation System Files
- **navigation.js** - Core navigation utilities and routing logic
- **navbar.html** - Reusable navigation component (optional)

### Key Features

#### User Authentication
- Login/Signup forms store user data in localStorage
- User roles: PATIENT, DOCTOR, ADMIN
- Automatic role-based dashboard routing
- Session persistence across pages

#### Role-Based Access
Users are routed based on their role:
- **PATIENT** → patientDashboard.html
- **DOCTOR** → doctor-dashboard.html
- **ADMIN** → agocare_admin_exact (1).html

#### Protected Pages
Pages use `requireAuth()` to prevent unauthorized access:
```javascript
// At page load
<body onload="requireAuth()">
```

#### Role-Specific Protection
Some pages require specific roles:
```javascript
// At page load
<body onload="requireRole('doctor')">
```

## Navigation Flow Examples

### Patient User Flow
1. User starts at index.html
2. Clicks "Sign Up" or "Login"
3. After authentication, auto-redirects to patientDashboard.html
4. Can access health topics, medical library, appointments
5. Can update profile in settings
6. Logout from user menu (top right)

### Doctor User Flow
1. Signs up as "Health Worker" role in Signup.html
2. Auto-redirects to doctor-dashboard.html
3. Can manage appointments, view patients, access resources
4. Can view medical library and analytics
5. Updates profile in settings

### Admin User Flow
1. Admins access agocare_admin_exact (1).html
2. Can manage medical centers, view analytics
3. Can moderate content feeds
4. Access control panel

## Page Navigation Links

### From Patient Dashboard
- Home → patientDashboard.html
- Medical Centers → medical_centers.html
- Medical Library → medical-library(1).html
- Topics (Pediatrics, Pregnancy, etc.) → respective moderation pages
- Appointments → appointments.html
- Profile → doctor-profile(1).html
- Settings → settings(1).html
- Logout → Back to Login.html

### From Doctor Dashboard
- Dashboard → doctor-dashboard.html
- Questions Feed → questions-feed.html
- Appointments → appointments.html
- My Patients → my-patients.html
- Medical Library → medical-library(1).html
- Analytics → analytics.html
- Settings → settings(1).html
- Profile → doctor-profile(1).html
- Logout → Back to Login.html

### From Admin Dashboard
- Back to Dashboard → agocare_admin_exact (1).html
- Medical Centers → medical_centers.html
- Analytics → analytics.html
- Questions Feed → questions-feed.html

## JavaScript Functions

### Navigation Functions (in navigation.js)
```javascript
// Get current user
getCurrentUser()

// Get user role
getUserRole()

// Navigate to appropriate dashboard
navigateToDashboard()

// Check authentication
isAuthenticated()

// Protect routes
requireAuth()
requireRole(role)

// Logout
logout()
```

### Usage in HTML
```html
<!-- Include navigation script in page head -->
<script src="navigation.js"></script>

<!-- Protect page with authentication check -->
<body onload="requireAuth()">

<!-- Protect page with role check -->
<body onload="requireRole('doctor')">

<!-- Navigate to dashboard -->
<a href="#" onclick="navigateToDashboard(); return false;">Dashboard</a>

<!-- Logout -->
<a href="#" onclick="logout(); return false;">Logout</a>
```

## Data Storage

### LocalStorage Keys
- `userRole` - Current user's role (patient, doctor, admin)
- `currentUser` - User object (name, username, email)
- `authToken` - Session authentication token

### Example User Object
```json
{
  "username": "francism",
  "name": "Murungi Francis",
  "email": "francis@example.com"
}
```

## Best Practices

1. **Always include navigation.js** in page `<head>`
2. **Add authentication checks** to protected pages with `onload="requireAuth()"`
3. **Use navigateToDashboard()** instead of hardcoding redirect URLs
4. **Use logout()** function for proper session cleanup
5. **Test navigation flow** between different user roles
6. **Maintain consistent naming** of files (avoid case sensitivity issues)

## Future Enhancements

- Add breadcrumb navigation
- Implement user preference-based sidebar customization
- Add search functionality across all pages
- Create page transitions/animations
- Add mobile-responsive menu
- Implement deep linking with URL parameters
- Add back button history management

## Troubleshooting

### Users redirected to login
- Check if `requireAuth()` is preventing access
- Verify localStorage has `userRole` and `currentUser` set

### Incorrect dashboard on login
- Check user's role in localStorage matches expected role
- Verify correct role is set in `handleLogin()` function

### Broken navigation links
- Verify filename case matches exactly (case-sensitive)
- Check for spaces in filenames (e.g., "doctor-profile(1).html")
- Ensure all referenced files exist in workspace

## Files Summary

| File | Purpose | Protected |
|------|---------|-----------|
| index.html | Landing page | No |
| Login.html | Authentication | No |
| Signup.html | Registration | No |
| patientDashboard.html | Patient home | Yes (Patient) |
| doctor-dashboard.html | Doctor home | Yes (Doctor) |
| agocare_admin_exact (1).html | Admin panel | Yes (Admin) |
| appointments.html | Appointment booking | Yes |
| medical_centers.html | Center management | Yes |
| All moderation pages | Content discussions | Yes |
| settings(1).html | User settings | Yes |
| doctor-profile(1).html | User profile | Yes |

---
Last Updated: December 22, 2025
