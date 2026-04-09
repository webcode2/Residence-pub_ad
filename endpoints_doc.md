# ResidentPass API Endpoints Reference

This document lists the available endpoints for the IAM and Token services, routed through the unified Traefik gateway.

**Prefix:** `/api/v1/`

---

## IAM Service
The IAM service handles authentication, user management, and estate configurations.

- **POST `iam/auth/login`**
  // Authenticate user and receive JWT
- **POST `iam/auth/register`**
  // Register a new user account
- **POST `iam/auth/register-estate`**
  // Register a new estate and its primary caretaker admin
- **GET `iam/auth/me`**
  // Retrieve the profile of the currently authenticated user
- **GET `iam/health`**
  // Health check for the IAM service
- **POST `iam/estates`**
  // Create a new estate configuration
- **GET `iam/estates/:app_id?`**
  // Retrieve estate details by App ID
- **POST `iam/houses`**
  // Register a new house/unit within an estate
- **GET `iam/houses`**
  // List all houses registered in the estate
- **POST `iam/allocations`**
  // Assign a user to a specific house/unit
- **POST `iam/registration-tokens`**
  // Generate a registration token for landlord onboarding
- **PATCH `iam/registration-tokens/:code/revoke`**
  // Revoke an active registration token
- **POST `iam/reports`**
  // Resident: Submit a new community report (SOS, Maintenance, etc.)
- **GET `iam/reports`**
  // Retrieve list of community reports
- **PATCH `iam/reports/:id`**
  // Update the status or details of a specific report
- **DELETE `iam/reports/:id`**
  // Remove a community report
- **POST `iam/sos`**
  // Trigger an emergency SOS distress alert
- **GET `iam/sos`**
  // Retrieve active SOS alerts for security personnel
- **GET `iam/dashboard/stats`**
  // Retrieve high-level statistics for the estateiam dashboard
- **GET `iam/dashboard/activity`**
  // Retrieve a feed of recent activities in the estate
- **POST `iam/landlords/import`**
  // Bulk import landlord data into the system
- **GET `iam/landlords`**
  // Retrieve the directory of registerediam landlords
- **POST `iam/users`**
  // Caretaker: Manually create a new user account

---

## Tokens Service
The Tokens service manages visitor access codes and verification.

- **GET `tokens/health`**
  // Health check for the Tokens service
- **POST `tokens/verify/visitor`**
  // Security: Verify a 4-digit visitor code for estate entry
- **POST `tokens/visitor`**
  // Resident: Generate a visitor access code (24h expiry)
- **GET `tokens/visitor/history`**
  // Resident: View history of generated visitor tokens
- **DELETE `tokens/visitor/{code}`**
  // Resident: Revoke/Delete an active visitor access code

---

## Notification Service
The Notification service handles device registration and push notifications.

- **GET `notifications/health`**
  // Health check for the Notification service
- **POST `notifications/devices`**
  // Register a mobile device FCM token for push notifications
- **GET `notifications/notifications`**
  // Retrieve list of unread notifications for the user
- **POST `notifications/{notification_id}/read`**
  // Mark a specific notification as read
- **POST `notifications/read-all`**
  // Mark all unread notifications for the user as read
