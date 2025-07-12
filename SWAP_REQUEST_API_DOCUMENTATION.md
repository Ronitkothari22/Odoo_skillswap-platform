# Swap Request API Documentation

## Overview

The Swap Request API allows users to create, manage, and track skill exchange requests between users. This documentation covers all endpoints, request/response formats, and usage examples.

**Base URL:** `/api/swaps`

**Authentication:** All endpoints require authentication via Bearer token in the Authorization header.

## Table of Contents

1. [Data Types](#data-types)
2. [Endpoints](#endpoints)
3. [Error Responses](#error-responses)
4. [Usage Examples](#usage-examples)

---

## Data Types

### SwapStatus Enum
```typescript
enum SwapStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  CANCELLED = 'cancelled'
}
```

### SwapRequest Interface
```typescript
interface SwapRequest {
  id: string;
  requester_id: string;
  responder_id: string;
  give_skill_id: string;
  take_skill_id: string;
  status: SwapStatus;
  message?: string;
  created_at: string;
  updated_at?: string;
}
```

### SwapRequestWithDetails Interface
```typescript
interface SwapRequestWithDetails extends SwapRequest {
  requester: {
    id: string;
    name: string;
    avatar_url?: string;
    rating_avg: number;
  };
  responder: {
    id: string;
    name: string;
    avatar_url?: string;
    rating_avg: number;
  };
  give_skill: {
    id: string;
    name: string;
  };
  take_skill: {
    id: string;
    name: string;
  };
}
```

---

## Endpoints

### 1. Create Swap Request

**POST** `/api/swaps`

Creates a new swap request between users.

#### Request Body
```json
{
  "responder_id": "string (required)",
  "give_skill_id": "string (required)",
  "take_skill_id": "string (required)",
  "message": "string (optional)"
}
```

#### Example Request
```json
{
  "responder_id": "user123",
  "give_skill_id": "skill456",
  "take_skill_id": "skill789",
  "message": "I'd love to learn React from you in exchange for teaching Python!"
}
```

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Swap request created successfully",
  "data": {
    "id": "swap123",
    "requester_id": "current_user_id",
    "responder_id": "user123",
    "give_skill_id": "skill456",
    "take_skill_id": "skill789",
    "status": "pending",
    "message": "I'd love to learn React from you in exchange for teaching Python!",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": null
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Missing required fields: responder_id, give_skill_id, take_skill_id"
}
```

---

### 2. Get All Swap Requests

**GET** `/api/swaps`

Retrieves all swap requests for the current user (both sent and received).

#### Query Parameters
- `status` (optional): Filter by status (`pending`, `accepted`, `cancelled`)
- `skill_id` (optional): Filter by skill ID
- `date_from` (optional): Filter from date (ISO format)
- `date_to` (optional): Filter to date (ISO format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Example Request
```
GET /api/swaps?status=pending&page=1&limit=10
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "swaps": [
      {
        "id": "swap123",
        "requester_id": "user456",
        "responder_id": "current_user_id",
        "give_skill_id": "skill789",
        "take_skill_id": "skill123",
        "status": "pending",
        "message": "Would love to learn JavaScript from you!",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": null,
        "requester": {
          "id": "user456",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg",
          "rating_avg": 4.5
        },
        "responder": {
          "id": "current_user_id",
          "name": "Jane Smith",
          "avatar_url": "https://example.com/avatar2.jpg",
          "rating_avg": 4.8
        },
        "give_skill": {
          "id": "skill789",
          "name": "Python"
        },
        "take_skill": {
          "id": "skill123",
          "name": "JavaScript"
        }
      }
    ],
    "totalCount": 1,
    "page": 1,
    "limit": 10,
    "hasMore": false
  },
  "message": "Swap requests retrieved successfully"
}
```

---

### 3. Get Swap Request by ID

**GET** `/api/swaps/:id`

Retrieves a specific swap request by its ID.

#### URL Parameters
- `id` (required): Swap request ID

#### Example Request
```
GET /api/swaps/swap123
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "swap123",
    "requester_id": "user456",
    "responder_id": "current_user_id",
    "give_skill_id": "skill789",
    "take_skill_id": "skill123",
    "status": "pending",
    "message": "Would love to learn JavaScript from you!",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": null,
    "requester": {
      "id": "user456",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "rating_avg": 4.5
    },
    "responder": {
      "id": "current_user_id",
      "name": "Jane Smith",
      "avatar_url": "https://example.com/avatar2.jpg",
      "rating_avg": 4.8
    },
    "give_skill": {
      "id": "skill789",
      "name": "Python"
    },
    "take_skill": {
      "id": "skill123",
      "name": "JavaScript"
    }
  },
  "message": "Swap request retrieved successfully"
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "Swap request not found"
}
```

---

### 4. Update Swap Request

**PATCH** `/api/swaps/:id`

Updates the status of a swap request.

#### URL Parameters
- `id` (required): Swap request ID

#### Request Body
```json
{
  "status": "string (required)", // 'pending', 'accepted', 'cancelled'
  "message": "string (optional)"
}
```

#### Example Request
```json
{
  "status": "accepted",
  "message": "Great! Let's schedule our first session."
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "swap123",
    "requester_id": "user456",
    "responder_id": "current_user_id",
    "give_skill_id": "skill789",
    "take_skill_id": "skill123",
    "status": "accepted",
    "message": "Great! Let's schedule our first session.",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:30:00Z"
  },
  "message": "Swap request updated successfully"
}
```

---

### 5. Delete Swap Request

**DELETE** `/api/swaps/:id`

Deletes/withdraws a swap request.

#### URL Parameters
- `id` (required): Swap request ID

#### Example Request
```
DELETE /api/swaps/swap123
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Swap request deleted successfully"
}
```

---

### 6. Get Swap Request Statistics

**GET** `/api/swaps/stats`

Retrieves statistics about the current user's swap requests.

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalSent": 15,
    "totalReceived": 23,
    "totalAccepted": 12,
    "totalCancelled": 8,
    "totalPending": 18,
    "recentSwaps": [
      {
        "id": "swap123",
        "requester_id": "user456",
        "responder_id": "current_user_id",
        "give_skill_id": "skill789",
        "take_skill_id": "skill123",
        "status": "pending",
        "message": "Would love to learn JavaScript from you!",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": null,
        "requester": {
          "id": "user456",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg",
          "rating_avg": 4.5
        },
        "responder": {
          "id": "current_user_id",
          "name": "Jane Smith",
          "avatar_url": "https://example.com/avatar2.jpg",
          "rating_avg": 4.8
        },
        "give_skill": {
          "id": "skill789",
          "name": "Python"
        },
        "take_skill": {
          "id": "skill123",
          "name": "JavaScript"
        }
      }
    ]
  },
  "message": "Swap request statistics retrieved successfully"
}
```

---

### 7. Get Received Swap Requests

**GET** `/api/swaps/received`

Retrieves pending swap requests received by the current user.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Example Request
```
GET /api/swaps/received?page=1&limit=5
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "swaps": [
      {
        "id": "swap123",
        "requester_id": "user456",
        "responder_id": "current_user_id",
        "give_skill_id": "skill789",
        "take_skill_id": "skill123",
        "status": "pending",
        "message": "Would love to learn JavaScript from you!",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": null,
        "requester": {
          "id": "user456",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg",
          "rating_avg": 4.5
        },
        "responder": {
          "id": "current_user_id",
          "name": "Jane Smith",
          "avatar_url": "https://example.com/avatar2.jpg",
          "rating_avg": 4.8
        },
        "give_skill": {
          "id": "skill789",
          "name": "Python"
        },
        "take_skill": {
          "id": "skill123",
          "name": "JavaScript"
        }
      }
    ],
    "totalCount": 1,
    "page": 1,
    "limit": 5,
    "hasMore": false
  },
  "message": "Received swap requests retrieved successfully"
}
```

---

### 8. Get Sent Swap Requests

**GET** `/api/swaps/sent`

Retrieves swap requests sent by the current user.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`pending`, `accepted`, `cancelled`)

#### Example Request
```
GET /api/swaps/sent?status=pending&page=1&limit=5
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "swaps": [
      {
        "id": "swap456",
        "requester_id": "current_user_id",
        "responder_id": "user789",
        "give_skill_id": "skill123",
        "take_skill_id": "skill456",
        "status": "pending",
        "message": "I'd love to learn React from you!",
        "created_at": "2024-01-15T09:00:00Z",
        "updated_at": null,
        "requester": {
          "id": "current_user_id",
          "name": "Jane Smith",
          "avatar_url": "https://example.com/avatar2.jpg",
          "rating_avg": 4.8
        },
        "responder": {
          "id": "user789",
          "name": "Alice Johnson",
          "avatar_url": "https://example.com/avatar3.jpg",
          "rating_avg": 4.7
        },
        "give_skill": {
          "id": "skill123",
          "name": "JavaScript"
        },
        "take_skill": {
          "id": "skill456",
          "name": "React"
        }
      }
    ],
    "totalCount": 1,
    "page": 1,
    "limit": 5,
    "hasMore": false
  },
  "message": "Sent swap requests retrieved successfully"
}
```

---

### 9. Accept Swap Request

**POST** `/api/swaps/:id/accept`

Accepts a swap request.

#### URL Parameters
- `id` (required): Swap request ID

#### Request Body
```json
{
  "message": "string (optional)"
}
```

#### Example Request
```json
{
  "message": "Excited to start our skill exchange!"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "swap123",
    "requester_id": "user456",
    "responder_id": "current_user_id",
    "give_skill_id": "skill789",
    "take_skill_id": "skill123",
    "status": "accepted",
    "message": "Excited to start our skill exchange!",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:30:00Z"
  },
  "message": "Swap request accepted successfully"
}
```

---

### 10. Reject Swap Request

**POST** `/api/swaps/:id/reject`

Rejects or cancels a swap request.

#### URL Parameters
- `id` (required): Swap request ID

#### Request Body
```json
{
  "message": "string (optional)"
}
```

#### Example Request
```json
{
  "message": "Sorry, I'm not available for skill exchanges right now."
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "swap123",
    "requester_id": "user456",
    "responder_id": "current_user_id",
    "give_skill_id": "skill789",
    "take_skill_id": "skill123",
    "status": "cancelled",
    "message": "Sorry, I'm not available for skill exchanges right now.",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:30:00Z"
  },
  "message": "Swap request rejected successfully"
}
```

---

## Error Responses

### Common Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Common Error Messages
- `"Unauthorized"` (401): Missing or invalid authentication token
- `"Swap request not found"` (404): Swap request ID doesn't exist
- `"Unauthorized to view this swap request"` (403): User doesn't have permission to view this swap
- `"Missing required fields: responder_id, give_skill_id, take_skill_id"` (400): Required fields missing
- `"Valid status is required (pending, accepted, cancelled)"` (400): Invalid status value
- `"Swap request ID is required"` (400): Missing ID parameter
- `"Internal server error"` (500): Server-side error

---

## Usage Examples

### Creating a Swap Request
```bash
curl -X POST "https://api.skillswap.com/api/swaps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "responder_id": "user123",
    "give_skill_id": "skill456",
    "take_skill_id": "skill789",
    "message": "I would love to learn React from you!"
  }'
```

### Getting All Swap Requests
```bash
curl -X GET "https://api.skillswap.com/api/swaps?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Accepting a Swap Request
```bash
curl -X POST "https://api.skillswap.com/api/swaps/swap123/accept" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Looking forward to our skill exchange!"
  }'
```

### Getting Statistics
```bash
curl -X GET "https://api.skillswap.com/api/swaps/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **Authentication**: All endpoints require a valid Bearer token in the Authorization header
2. **Permissions**: Users can only view, create, and modify swap requests they are involved in
3. **Status Flow**: Swap requests follow the flow: `pending` → `accepted` or `cancelled`
4. **Pagination**: Most list endpoints support pagination with `page` and `limit` parameters
5. **Filtering**: Several endpoints support filtering by status, skills, and dates
6. **Real-time Updates**: The system supports real-time notifications for swap request updates

---

## Rate Limiting

- **Create Swap Request**: 10 requests per minute per user
- **Get Requests**: 100 requests per minute per user
- **Update/Delete**: 20 requests per minute per user

Contact the API team for higher rate limits if needed. 