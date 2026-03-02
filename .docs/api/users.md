# Users API

Base path: `/api/v1/users`

All endpoints require authentication and `admin` or `staff` role (hard delete requires `admin` only).

> **Note:** The `password` field is always stripped from responses.

---

## POST /

Create a new user account.

**Roles:** `admin`, `staff`

### Request Body

| Field             | Type   | Required | Validation                     |
| ----------------- | ------ | -------- | ------------------------------ |
| `email`           | string | Yes      | Valid email                    |
| `password`        | string | Yes      | Min 8 chars                    |
| `confirmPassword` | string | Yes      | Must match `password`          |
| `role`            | string | No       | `student`, `staff`, or `admin` |

```json
{
  "email": "john@example.com",
  "password": "SecureP@ss1",
  "confirmPassword": "SecureP@ss1",
  "role": "staff"
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "user": {
      "id": "01abc...",
      "email": "john@example.com",
      "role": "staff",
      "studentId": null,
      "isActive": true,
      "isBlocked": false,
      "isSuspended": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### Errors

| Status | Message                             |
| ------ | ----------------------------------- |
| 400    | Passwords do not match              |
| 400    | User with this email already exists |

---

## GET /

List all users with pagination, search, and role filtering.

**Roles:** `admin`, `staff`

### Query Parameters

| Param    | Type   | Default | Description                                |
| -------- | ------ | ------- | ------------------------------------------ |
| `page`   | number | `1`     | Page number                                |
| `limit`  | number | `10`    | Items per page                             |
| `search` | string | -       | ILIKE search on `email`, `id`, `studentId` |
| `role`   | string | -       | Exact match: `student`, `staff`, `admin`   |

### Success Response (200)

```json
{
  "success": true,
  "message": "Users retrieved successfully.",
  "data": {
    "users": [ ... ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## GET /:id

Get a single user by ID.

**Roles:** `admin`, `staff`

### Path Parameters

| Param | Description |
| ----- | ----------- |
| `id`  | User ID     |

### Success Response (200)

```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": { "user": { ... } }
}
```

### Errors

| Status | Message        |
| ------ | -------------- |
| 404    | User not found |

---

## PATCH /:id

Update user fields.

**Roles:** `admin`, `staff`

### Request Body

All fields are optional:

| Field         | Type    | Validation                  |
| ------------- | ------- | --------------------------- |
| `email`       | string  | Valid email                 |
| `password`    | string  | Min 8 chars                 |
| `role`        | string  | `student`, `staff`, `admin` |
| `isActive`    | boolean |                             |
| `isBlocked`   | boolean |                             |
| `isSuspended` | boolean |                             |

### Success Response (200)

```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": { "user": { ... } }
}
```

### Errors

| Status | Message              |
| ------ | -------------------- |
| 404    | User not found       |
| 400    | Email already in use |

---

## DELETE /:id/soft-delete

Soft-delete a user by setting `isActive` to `false`.

**Roles:** `admin`, `staff`

### Success Response (200)

```json
{
  "success": true,
  "message": "User deleted successfully.",
  "data": null
}
```

---

## DELETE /:id/hard-delete

Permanently delete a user record from the database.

**Roles:** `admin` only

### Success Response (200)

```json
{
  "success": true,
  "message": "User permanently deleted.",
  "data": null
}
```
