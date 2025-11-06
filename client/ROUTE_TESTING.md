# Route Testing Checklist

## Public Routes (No Authentication Required)

- [ ] **GET /** → Home page loads with login/signup links
- [ ] **GET /login** → Login page loads
- [ ] **GET /signup** → Signup page loads

## Authentication Flow

- [ ] **Login** → Redirects to /dashboard after successful login
- [ ] **Signup** → Redirects to /dashboard after successful signup
- [ ] **Already Authenticated** → Visiting /login redirects to /dashboard
- [ ] **Already Authenticated** → Visiting /signup redirects to /dashboard

## Protected Routes (Authentication Required)

- [ ] **GET /dashboard** → Dashboard loads with navbar (authenticated)
- [ ] **GET /marketplace** → Marketplace loads with navbar (authenticated)
- [ ] **GET /notifications** → Notifications loads with navbar (authenticated)

## Route Guards

- [ ] **No Token** → Accessing /dashboard redirects to /login
- [ ] **No Token** → Accessing /marketplace redirects to /login
- [ ] **No Token** → Accessing /notifications redirects to /login
- [ ] **Invalid Token** → API returns 401 → Logout and redirect to /login

## 404 and Error Handling

- [ ] **Invalid Route** → /invalid-path redirects to /404 page
- [ ] **Logout** → User redirected to /login
- [ ] **Error Boundary** → Application error shows error page, not crash

## Navigation Tests

- [ ] **Dashboard → Marketplace** → Navigation works without reload
- [ ] **Marketplace → Notifications** → Navigation works without reload
- [ ] **Any Page → Logout** → Returns to /login
- [ ] **Navbar Badge** → Shows notification count and updates

## Full User Flow Test

- [ ] User signup → Dashboard loads → Create event → Mark swappable → Go to marketplace → See event → Request swap → Go to notifications → Accept/Reject → Verify changes in dashboard → Logout → Redirects to login
