# SkillSwap Platform - Feedback System API Documentation

## Overview

The Feedback System API provides comprehensive functionality for managing feedback and ratings in the SkillSwap platform. Users can create feedback for completed skill swaps, view feedback statistics, and manage their feedback history.

**Base URL:** `http://localhost:8080/api`

**Authentication:** All endpoints require Bearer token authentication

```
Authorization: Bearer <your-access-token>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Feedback Management](#feedback-management)
3. [Feedback Analytics](#feedback-analytics)
4. [Public Feedback Queries](#public-feedback-queries)
5. [Admin Functions](#admin-functions)
6. [Error Handling](#error-handling)
7. [Data Types](#data-types)

---

## Authentication

### Get Access Token

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

---

## Feedback Management

### Create Feedback

**POST** `/api/feedback`

Create new feedback for a completed swap.

**Request Body:**
```json
{
  "swap_id": "6f285db5-880e-473d-acbf-81193c46cd5f",
  "stars": 5,
  "comment": "Excellent experience! Very knowledgeable and patient teacher. Highly recommend."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Feedback created successfully",
  "data": {
    "id": "feedback-uuid",
    "swap_id": "6f285db5-880e-473d-acbf-81193c46cd5f",
    "from_user_id": "user-uuid",
    "to_user_id": "recipient-uuid",
    "stars": 5,
    "comment": "Excellent experience! Very knowledgeable and patient teacher. Highly recommend.",
    "created_at": "2024-01-15T10:30:00Z",
    "swap": {
      "id": "6f285db5-880e-473d-acbf-81193c46cd5f",
      "give_skill": {
        "id": "skill-uuid",
        "name": "Python Programming"
      },
      "take_skill": {
        "id": "skill-uuid",
        "name": "JavaScript"
      },
      "status": "completed",
      "created_at": "2024-01-10T08:00:00Z"
    },
    "from_user": {
      "id": "user-uuid",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "to_user": {
      "id": "recipient-uuid",
      "name": "Jane Smith",
      "avatar_url": "https://example.com/avatar2.jpg"
    }
  }
}
```

**Validation Rules:**
- `swap_id` is required
- `stars` is required and must be between 1-5
- `comment` is optional
- User must be a participant in the swap
- Feedback can only be created once per swap per user

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User not authorized to create feedback for this swap
- `409 Conflict`: Feedback already exists for this swap

---

## Feedback Analytics

### Get My Feedback Statistics

**GET** `/api/feedback/stats`

Get comprehensive feedback statistics for the current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_given": 15,
    "total_received": 12,
    "average_given": 4.3,
    "average_received": 4.7,
    "recent_feedback_given": [
      {
        "id": "feedback-uuid",
        "swap_id": "swap-uuid",
        "from_user_id": "user-uuid",
        "to_user_id": "recipient-uuid",
        "stars": 5,
        "comment": "Great teacher!",
        "created_at": "2024-01-15T10:30:00Z",
        "swap": {
          "id": "swap-uuid",
          "give_skill": {
            "id": "skill-uuid",
            "name": "Python Programming"
          },
          "take_skill": {
            "id": "skill-uuid",
            "name": "JavaScript"
          },
          "status": "completed",
          "created_at": "2024-01-10T08:00:00Z"
        },
        "from_user": {
          "id": "user-uuid",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "to_user": {
          "id": "recipient-uuid",
          "name": "Jane Smith",
          "avatar_url": "https://example.com/avatar2.jpg"
        }
      }
    ],
    "recent_feedback_received": [
      {
        "id": "feedback-uuid",
        "swap_id": "swap-uuid",
        "from_user_id": "giver-uuid",
        "to_user_id": "user-uuid",
        "stars": 4,
        "comment": "Very helpful session!",
        "created_at": "2024-01-14T14:20:00Z",
        "swap": {
          "id": "swap-uuid",
          "give_skill": {
            "id": "skill-uuid",
            "name": "React Development"
          },
          "take_skill": {
            "id": "skill-uuid",
            "name": "Node.js"
          },
          "status": "completed",
          "created_at": "2024-01-12T09:00:00Z"
        },
        "from_user": {
          "id": "giver-uuid",
          "name": "Alice Johnson",
          "avatar_url": "https://example.com/avatar3.jpg"
        },
        "to_user": {
          "id": "user-uuid",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        }
      }
    ]
  },
  "message": "Feedback statistics retrieved successfully"
}
```

### Get My Feedback (Received)

**GET** `/api/feedback/me`

Get feedback received by the current user with filtering and pagination.

**Query Parameters:**
- `stars` (optional): Filter by star rating (1-5)
- `date_from` (optional): Start date filter (YYYY-MM-DD)
- `date_to` (optional): End date filter (YYYY-MM-DD)
- `skill_id` (optional): Filter by skill ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Example:** `/api/feedback/me?stars=5&page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": "feedback-uuid",
        "swap_id": "swap-uuid",
        "from_user_id": "giver-uuid",
        "to_user_id": "user-uuid",
        "stars": 5,
        "comment": "Outstanding teacher! Explained everything clearly.",
        "created_at": "2024-01-15T10:30:00Z",
        "swap": {
          "id": "swap-uuid",
          "give_skill": {
            "id": "skill-uuid",
            "name": "Python Programming"
          },
          "take_skill": {
            "id": "skill-uuid",
            "name": "JavaScript"
          },
          "status": "completed",
          "created_at": "2024-01-10T08:00:00Z"
        },
        "from_user": {
          "id": "giver-uuid",
          "name": "Alice Johnson",
          "avatar_url": "https://example.com/avatar3.jpg"
        },
        "to_user": {
          "id": "user-uuid",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        }
      }
    ],
    "totalCount": 5,
    "page": 1,
    "limit": 10,
    "hasMore": false
  },
  "message": "Your feedback retrieved successfully"
}
```

### Get Feedback by ID

**GET** `/api/feedback/details/:feedbackId`

Get specific feedback details by ID.

**Path Parameters:**
- `feedbackId` (required): The feedback ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "feedback-uuid",
    "swap_id": "swap-uuid",
    "from_user_id": "giver-uuid",
    "to_user_id": "recipient-uuid",
    "stars": 5,
    "comment": "Excellent experience! Very knowledgeable and patient teacher.",
    "created_at": "2024-01-15T10:30:00Z",
    "swap": {
      "id": "swap-uuid",
      "give_skill": {
        "id": "skill-uuid",
        "name": "Python Programming"
      },
      "take_skill": {
        "id": "skill-uuid",
        "name": "JavaScript"
      },
      "status": "completed",
      "created_at": "2024-01-10T08:00:00Z"
    },
    "from_user": {
      "id": "giver-uuid",
      "name": "Alice Johnson",
      "avatar_url": "https://example.com/avatar3.jpg"
    },
    "to_user": {
      "id": "recipient-uuid",
      "name": "Jane Smith",
      "avatar_url": "https://example.com/avatar2.jpg"
    }
  },
  "message": "Feedback retrieved successfully"
}
```

---

## Public Feedback Queries

### Get User Feedback Summary

**GET** `/api/feedback/:userId`

Get feedback summary for a specific user including rating breakdown and recent feedback.

**Path Parameters:**
- `userId` (required): The user ID

**Query Parameters:**
- `limit` (optional): Number of recent feedback items to include (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user-uuid",
    "user_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "rating_avg": 4.7,
    "total_feedback_count": 25,
    "feedback_breakdown": {
      "five_star": 15,
      "four_star": 8,
      "three_star": 2,
      "two_star": 0,
      "one_star": 0
    },
    "recent_feedback": [
      {
        "id": "feedback-uuid",
        "swap_id": "swap-uuid",
        "from_user_id": "giver-uuid",
        "to_user_id": "user-uuid",
        "stars": 5,
        "comment": "Excellent teacher! Highly recommend.",
        "created_at": "2024-01-15T10:30:00Z",
        "swap": {
          "id": "swap-uuid",
          "give_skill": {
            "id": "skill-uuid",
            "name": "Python Programming"
          },
          "take_skill": {
            "id": "skill-uuid",
            "name": "JavaScript"
          },
          "status": "completed",
          "created_at": "2024-01-10T08:00:00Z"
        },
        "from_user": {
          "id": "giver-uuid",
          "name": "Alice Johnson",
          "avatar_url": "https://example.com/avatar3.jpg"
        },
        "to_user": {
          "id": "user-uuid",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        }
      }
    ]
  },
  "message": "User feedback summary retrieved successfully"
}
```

### Get User Feedback List

**GET** `/api/feedback/user/:userId`

Get feedback for a specific user with filtering and pagination.

**Path Parameters:**
- `userId` (required): The user ID

**Query Parameters:**
- `stars` (optional): Filter by star rating (1-5)
- `date_from` (optional): Start date filter (YYYY-MM-DD)
- `date_to` (optional): End date filter (YYYY-MM-DD)
- `skill_id` (optional): Filter by skill ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Example:** `/api/feedback/user/user-uuid?stars=4&page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": "feedback-uuid",
        "swap_id": "swap-uuid",
        "from_user_id": "giver-uuid",
        "to_user_id": "user-uuid",
        "stars": 4,
        "comment": "Very helpful session!",
        "created_at": "2024-01-14T14:20:00Z",
        "swap": {
          "id": "swap-uuid",
          "give_skill": {
            "id": "skill-uuid",
            "name": "React Development"
          },
          "take_skill": {
            "id": "skill-uuid",
            "name": "Node.js"
          },
          "status": "completed",
          "created_at": "2024-01-12T09:00:00Z"
        },
        "from_user": {
          "id": "giver-uuid",
          "name": "Alice Johnson",
          "avatar_url": "https://example.com/avatar3.jpg"
        },
        "to_user": {
          "id": "user-uuid",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        }
      }
    ],
    "totalCount": 12,
    "page": 1,
    "limit": 10,
    "hasMore": true
  },
  "message": "User feedback retrieved successfully"
}
```

---

## Admin Functions

### Recalculate User Rating

**POST** `/api/feedback/recalculate/:userId`

Recalculate the average rating for a specific user (admin function).

**Path Parameters:**
- `userId` (required): The user ID

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user-uuid",
    "old_rating": 4.5,
    "new_rating": 4.7,
    "feedback_count": 25,
    "calculation_date": "2024-01-15T10:30:00Z"
  },
  "message": "User rating recalculated successfully"
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Stars rating must be between 1 and 5"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Missing Authorization header"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "User not authorized to create feedback for this swap"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Feedback not found"
}
```

**409 Conflict**
```json
{
  "success": false,
  "message": "Feedback already exists for this swap"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Data Types

### Feedback

```typescript
interface Feedback {
  id: string;
  swap_id: string;
  from_user_id: string;
  to_user_id: string;
  stars: number; // 1-5 scale
  comment?: string;
  created_at: string;
}
```

### FeedbackWithDetails

```typescript
interface FeedbackWithDetails extends Feedback {
  swap: {
    id: string;
    give_skill: {
      id: string;
      name: string;
    };
    take_skill: {
      id: string;
      name: string;
    };
    status: string;
    created_at: string;
  };
  from_user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  to_user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}
```

### UserFeedbackSummary

```typescript
interface UserFeedbackSummary {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  rating_avg: number;
  total_feedback_count: number;
  feedback_breakdown: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
  recent_feedback: FeedbackWithDetails[];
}
```

### FeedbackStats

```typescript
interface FeedbackStats {
  total_given: number;
  total_received: number;
  average_given: number;
  average_received: number;
  recent_feedback_given: FeedbackWithDetails[];
  recent_feedback_received: FeedbackWithDetails[];
}
```

---

## Testing with Postman

### Environment Variables

Set up the following environment variables in Postman:

```
base_url: http://localhost:3000/api
auth_token: <your-access-token>
user_id: <your-user-id>
swap_id: 6f285db5-880e-473d-acbf-81193c46cd5f
feedback_id: <feedback-id>
```

### Authentication Headers

Add to all requests:
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

### Test Scenarios

1. **Create Feedback Flow**
   - Login to get access token
   - Create feedback with valid swap_id
   - Verify feedback was created successfully

2. **Get Statistics Flow**
   - Get user feedback statistics
   - Verify calculations are correct

3. **Pagination Testing**
   - Test pagination with different page sizes
   - Verify totalCount and hasMore flags

4. **Error Handling**
   - Test with invalid star ratings
   - Test with non-existent swap_id
   - Test without authentication

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Standard endpoints**: 100 requests per minute per user
- **Creation endpoints**: 10 requests per minute per user
- **Admin endpoints**: 50 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1642694400
```

---

## Best Practices

1. **Always validate input** before making requests
2. **Handle errors gracefully** with appropriate user feedback
3. **Use pagination** for large result sets
4. **Cache responses** when appropriate to reduce API calls
5. **Implement retry logic** for transient failures
6. **Use proper HTTP status codes** for different scenarios

---

## Support

For API support and questions:
- Email: support@skillswap.com
- Documentation: https://docs.skillswap.com
- GitHub Issues: https://github.com/skillswap/api/issues 