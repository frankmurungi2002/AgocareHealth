# Agocare Navigation Structure Diagram

## Overall Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    START: index.html                        │
│              (Auto-detect authentication)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
     NOT AUTHENTICATED        AUTHENTICATED
            │                     │
       ┌────▼────┐          ┌─────┴──────────────────┐
       │  Login  │          │  Redirect by role      │
       │  Signup │          │  (navigateToDashboard) │
       └─────────┘          └─────┬──────────────────┘
            │                    │
       ┌────▼────┐          ┌────┴──────────────────────┐
       │ Validate│          │                           │
       │ & Store │      ┌───┴────────┬────────┬────────┐
       │  User   │      │            │        │        │
       │  Role   │      │            │        │        │
       └────┬────┘      │            │        │        │
            │           │            │        │        │
       ┌────▼──────────────────────────────────────────┐
       │  DASHBOARD ROUTERS                           │
       └────┬──────────────────────────────────────────┘
            │
        ┌───┴─────────────────────────────────────┐
        │                                         │
    ┌───▼──────┐              ┌─────────┐    ┌──▼──────┐
    │ PATIENT   │              │ DOCTOR  │    │ ADMIN   │
    │ Dashboard │              │Dashboard│    │Dashboard│
    └───┬──────┘              └────┬────┘    └──┬──────┘
        │                          │            │
    ┌───┴────────────────────┐  ┌──┴──────────┐ │
    │   PATIENT PAGES        │  │ DOCTOR PAGES│ │
    └───┬────────────────────┘  └──┬──────────┘ │
        │                          │            │
   ┌────┴────────┬──────────┬─────┴──┬─────┐   │
   │             │          │        │     │   │
   │             │          │        │     │   │
```

## User Role Navigation

### Patient User Path
```
index.html
    │
    └─→ Signup.html (select "Community")
    │       └─→ patientDashboard.html (requireAuth)
    │           │
    │           ├─→ pediatrics_moderation.html
    │           ├─→ pregnancy_moderation.html
    │           ├─→ infectious_moderation.html
    │           ├─→ sexual_moderation.html
    │           ├─→ mental_moderation.html
    │           ├─→ medical_centers.html
    │           ├─→ medical-library(1).html
    │           ├─→ appointments.html
    │           ├─→ doctor-profile(1).html
    │           └─→ settings(1).html
    │                   │
    │                   └─→ Logout → Login.html
```

### Doctor User Path
```
index.html
    │
    └─→ Signup.html (select "Health Worker")
    │       └─→ doctor-dashboard.html (requireRole: doctor)
    │           │
    │           ├─→ questions-feed.html
    │           ├─→ appointments.html
    │           ├─→ my-patients.html
    │           ├─→ medical-library(1).html
    │           ├─→ analytics.html
    │           ├─→ doctor-profile(1).html
    │           └─→ settings(1).html
    │                   │
    │                   └─→ Logout → Login.html
```

### Admin User Path
```
index.html
    │
    └─→ Signup.html (select "Admin" - if available)
    │       └─→ agocare_admin_exact (1).html (requireRole: admin)
    │           │
    │           ├─→ medical_centers.html
    │           ├─→ analytics.html
    │           └─→ questions-feed.html
    │                   │
    │                   └─→ Logout → Login.html
```

## Page Protection Structure

```
┌──────────────────────────────────────────────┐
│            ALL PAGES                         │
└──────────────────────────────────────────────┘
                    │
        ┌───────────┴──────────────┐
        │                          │
        │                  ┌───────┴────────────┐
        │                  │                    │
    UNPROTECTED        PROTECTED            ROLE-SPECIFIC
    (Public)        (requireAuth)         (requireRole)
        │                  │                    │
        │                  │              ┌──────┴──────┬─────────┐
        │                  │              │             │         │
        │                  │          patient-only  doctor-only  admin-only
        │                  │              │             │         │
    ┌───▼──┐          ┌─────┴──────┐  ┌──┴──────┐  ┌──┴────┐  ┌──┴──────┐
    │index │          │ Dashboard  │  │Patient  │  │Doctor │  │Admin    │
    │Login │          │ Features   │  │Pages    │  │Pages  │  │Pages    │
    │Signup│          │ Profile    │  │         │  │       │  │         │
    │      │          │ Settings   │  │         │  │       │  │         │
    └──────┘          └────────────┘  └─────────┘  └───────┘  └─────────┘
```

## Authentication & Session Flow

```
┌─────────────────────────────────────────────┐
│         Browser LocalStorage                │
│  ┌─────────────────────────────────────┐   │
│  │ userRole: "patient"                 │   │
│  │ currentUser: {                      │   │
│  │   username: "francis",                 │   │
│  │   name: "Murungi Francis",                 │   │
│  │   email: "francis@example.com"         │   │
│  │ }                                   │   │
│  │ authToken: "mock-token-..."         │   │
│  └─────────────────────────────────────┘   │
└────────────────┬────────────────────────────┘
                 │
            ┌────┴──────────┐
            │               │
        Every Page      Every Page
      onload checks:  Navigation uses:
            │               │
        isAuthenticated  getUserRole()
        requireAuth()    getCurrentUser()
        requireRole()    setUserRole()
                        logout()
```

## Navigation Function Relationships

```
┌────────────────────────────────────┐
│       navigation.js                │
│   (Core Navigation Library)        │
└─────────┬────────────────────────────┘
          │
    ┌─────┴──────────────────────────┐
    │                                │
  ┌─┴───────────────┐      ┌────────┴─────────┐
  │ Authentication  │      │ Navigation       │
  │ Functions       │      │ Functions        │
  ├─────────────────┤      ├──────────────────┤
  │ setUserRole()   │      │ navigateTo()     │
  │ getUserRole()   │      │ navigateToDash() │
  │ setCurrentUser()│      │ logout()         │
  │ getCurrentUser()│      │                  │
  │ isAuth()        │      │                  │
  │ requireAuth()   │      │                  │
  │ requireRole()   │      │                  │
  └─────────────────┘      └──────────────────┘
          │                        │
          └────────────┬───────────┘
                       │
              ┌────────┴─────────┐
              │                  │
           On Page        In Navigation
           Load Check      Links/Buttons
           onload=""       onclick=""
```

## Feature Accessibility Matrix

```
┌──────────────────────┬─────────┬────────┬───────┐
│ Feature              │ Patient │ Doctor │ Admin │
├──────────────────────┼─────────┼────────┼───────┤
│ Dashboard            │    ✓    │   ✓    │   ✓   │
│ Appointments         │    ✓    │   ✓    │   ✗   │
│ Medical Centers      │    ✓    │   ✗    │   ✓   │
│ Medical Library      │    ✓    │   ✓    │   ✗   │
│ Questions Feed       │    ✗    │   ✓    │   ✓   │
│ My Patients          │    ✗    │   ✓    │   ✗   │
│ Analytics            │    ✗    │   ✓    │   ✓   │
│ Settings             │    ✓    │   ✓    │   ✓   │
│ Profile              │    ✓    │   ✓    │   ✓   │
│ Health Topics        │    ✓    │   ✗    │   ✗   │
└──────────────────────┴─────────┴────────┴───────┘
```

## Error Handling Flow

```
Page Load
    │
    ├─→ Check onload attribute
    │       │
    │       ├─→ requireAuth()
    │       │   ├─→ isAuthenticated() = false
    │       │   └─→ Redirect to Login.html
    │       │
    │       └─→ requireRole(role)
    │           ├─→ isAuthenticated() = false
    │           │   └─→ Redirect to Login.html
    │           │
    │           ├─→ getUserRole() ≠ role
    │           │   └─→ Redirect to Dashboard
    │           │
    │           └─→ ✓ Access Granted
    │
    └─→ No protection
            └─→ Page Loads
```

## File Structure Tree

```
agrocare/
│
├── index.html ........................ Welcome page
├── Login.html ........................ Login page
├── Signup.html ....................... Registration page
│
├── navigation.js ..................... Core navigation system
├── navbar.html ....................... Reusable nav component
│
├── patientDashboard.html ............ Patient main dashboard
├── doctor-dashboard.html ............ Doctor main dashboard
├── agocare_admin_exact (1).html ...... Admin main dashboard
│
├── appointments.html ................ Appointment management
├── medical_centers.html ............. Medical facility management
├── medical-library(1).html .......... Medical resources
├── questions-feed.html .............. Q&A feed
├── my-patients.html ................. Patient roster
├── analytics.html ................... Analytics view
├── doctor-profile(1).html ........... User profile
├── settings(1).html ................. User settings
│
├── pediatrics_moderation.html ....... Pediatrics topic
├── pregnancy_moderation.html ........ Pregnancy topic
├── infectious_moderation.html ....... Infectious diseases topic
├── sexual_moderation.html ........... Sexual health topic
├── mental_moderation.html ........... Mental health topic
│
├── NAVIGATION_GUIDE.md .............. Complete documentation
├── IMPLEMENTATION_SUMMARY.md ........ Implementation details
├── QUICK_START.md ................... Quick start guide
├── IMPLEMENTATION_CHECKLIST.md ...... Feature checklist
│
├── login.css ......................... Login styling
├── doctor.css ........................ Doctor dashboard styling
├── AdminDassboardstyle.css .......... Admin dashboard styling
├── medical_centers.css .............. Medical centers styling
│
├── login.js .......................... Login logic (updated)
├── admin.js .......................... Admin logic
└── patientDashboard.js .............. Patient dashboard logic
```

---

**This diagram helps visualize the complete navigation flow, access control, and page relationships in the Agocare application.**
