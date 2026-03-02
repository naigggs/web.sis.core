# Auth API

Base path: `/api/v1/auth`

Authentication is cookie-based. On successful login or token refresh, the server sets `accessToken` and `refreshToken` as **httpOnly cookies**.

---

## POST /login

Authenticate a user by email and password.

**Auth:** None  
**Roles:** Any

### Request Body

| Field      | Type   | Required | Validation  |
| ---------- | ------ | -------- | ----------- |
| `email`    | string | Yes      | Valid email |
| `password` | string | Yes      | Min 8 chars |

```json
{
  "email": "admin@sis.edu",
  "password": "Admin@1234"
}
```

### Success Response (200)

Sets cookies `accessToken` and `refreshToken`, then returns:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "01abc...",
      "email": "admin@sis.edu",
      "role": "admin"
    }
  }
}
```

### Cookie Details

| Cookie         | httpOnly | Secure (prod) | SameSite (prod) | MaxAge                       |
| -------------- | -------- | ------------- | --------------- | ---------------------------- |
| `accessToken`  | `true`   | `true`        | `None`          | `JWT_ACCESS_TOKEN_LIFETIME`  |
| `refreshToken` | `true`   | `true`        | `None`          | `JWT_REFRESH_TOKEN_LIFETIME` |

In development, `Secure` is `false` and `SameSite` is `Lax`.

### Errors

| Status | Message             |
| ------ | ------------------- |
| 400    | Validation error    |
| 401    | Invalid credentials |

---

## POST /logout

Clear authentication cookies.

**Auth:** Required (accessToken cookie)  
**Roles:** Any authenticated user

### Request Body

None.

### Success Response (200)

```json
{
  "success": true,
  "message": "Logout successful.",
  "data": null
}
```

---

## POST /refresh

Exchange a valid refresh token for a new access token.

**Auth:** None (reads `refreshToken` cookie)  
**Roles:** Any

### Request Body

None. The refresh token is read from the `refreshToken` cookie.

### Success Response (200)

Sets a new `accessToken` cookie and returns:

```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "user": {
      "id": "01abc...",
      "email": "admin@sis.edu",
      "role": "admin"
    }
  }
}
```

### Errors

| Status | Message                 |
| ------ | ----------------------- |
| 401    | Refresh token not found |
| 401    | Invalid refresh token   |

---

## GET /me

Retrieve the currently authenticated user's profile.

**Auth:** Required  
**Roles:** Any authenticated user

### Success Response (200)

```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "user": {
      "id": "01abc...",
      "email": "admin@sis.edu",
      "role": "admin",
      "studentId": null,
      "isActive": true,
      "isBlocked": false,
      "isSuspended": false,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

### JWT Payload Structure

**Access Token:**

| Field       | Description                    |
| ----------- | ------------------------------ |
| `sub`       | User ID (UUIDv7)               |
| `role`      | `admin`, `staff`, or `student` |
| `studentId` | Linked student ID (if student) |
| `type`      | `"access"`                     |
| `exp`       | Expiration (Unix timestamp)    |

**Refresh Token:**

| Field  | Description                 |
| ------ | --------------------------- |
| `sub`  | User ID (UUIDv7)            |
| `type` | `"refresh"`                 |
| `exp`  | Expiration (Unix timestamp) |
