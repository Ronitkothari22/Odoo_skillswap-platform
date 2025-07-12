# Profile Management API Documentation

## Overview
This document provides comprehensive documentation for the Profile Management API endpoints in the Skill Swap Platform. The API allows users to manage their profiles, skills, desired skills, and availability slots.

## Base URL
```
http://localhost:3000/api/profile
```

## Authentication
All endpoints require authentication using JWT Bearer tokens in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Profile Management

#### Get Profile
Retrieve the complete user profile including skills, desired skills, and availability.

```
GET /profile
```

**Response:**
```json
{
  "profile": {
    "id": "user-uuid",
    "name": "John Doe",
    "location": "New York, NY",
    "avatar_url": "https://example.com/avatar.jpg",
    "visibility": true,
    "rating_avg": 4.5,
    "created_at": "2023-01-01T00:00:00Z",
    "skills": [
      {
        "id": "skill-uuid",
        "name": "JavaScript",
        "proficiency": 4
      }
    ],
    "desiredSkills": [
      {
        "id": "skill-uuid",
        "name": "Machine Learning",
        "priority": 5
      }
    ],
    "availability": [
      {
        "id": "slot-uuid",
        "weekday": 1,
        "start_time": "09:00",
        "end_time": "12:00"
      }
    ]
  }
}
```

#### Update Profile
Update basic profile information.

```
PATCH /profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "location": "New York, NY",
  "avatar_url": "https://example.com/avatar.jpg",
  "visibility": true
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "user-uuid",
    "name": "John Doe",
    "location": "New York, NY",
    "avatar_url": "https://example.com/avatar.jpg",
    "visibility": true,
    "rating_avg": 4.5,
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

### 2. Skills Management

#### Get All Skills
Retrieve all available skills in the system.

```
GET /profile/skills/all
```

**Response:**
```json
{
  "skills": [
    {
      "id": "skill-uuid",
      "name": "JavaScript"
    },
    {
      "id": "skill-uuid",
      "name": "Python"
    }
  ]
}
```

#### Add/Update Skills
Add or update user's offered skills.

```
POST /profile/skills
```

**Request Body:**
```json
{
  "skills": [
    {
      "name": "JavaScript",
      "proficiency": 4
    },
    {
      "name": "Python",
      "proficiency": 3
    },
    {
      "name": "React",
      "proficiency": 5
    }
  ]
}
```

**Proficiency Scale:** 1-5 (1 = Beginner, 5 = Expert)

**Response:**
```json
{
  "message": "Skills updated successfully",
  "skills": [
    {
      "id": "skill-uuid",
      "name": "JavaScript",
      "proficiency": 4
    },
    {
      "id": "skill-uuid",
      "name": "Python",
      "proficiency": 3
    },
    {
      "id": "skill-uuid",
      "name": "React",
      "proficiency": 5
    }
  ]
}
```

#### Remove Skill
Remove a specific skill from user's offered skills.

```
DELETE /profile/skills/:skillId
```

**Response:**
```json
{
  "message": "Skill removed successfully"
}
```

### 3. Desired Skills Management

#### Add/Update Desired Skills
Add or update user's desired skills.

```
POST /profile/desired-skills
```

**Request Body:**
```json
{
  "skills": [
    {
      "name": "Machine Learning",
      "priority": 5
    },
    {
      "name": "UI/UX Design",
      "priority": 4
    },
    {
      "name": "Data Science",
      "priority": 3
    }
  ]
}
```

**Priority Scale:** 1-5 (1 = Low Priority, 5 = High Priority)

**Response:**
```json
{
  "message": "Desired skills updated successfully",
  "skills": [
    {
      "id": "skill-uuid",
      "name": "Machine Learning",
      "priority": 5
    },
    {
      "id": "skill-uuid",
      "name": "UI/UX Design",
      "priority": 4
    },
    {
      "id": "skill-uuid",
      "name": "Data Science",
      "priority": 3
    }
  ]
}
```

#### Remove Desired Skill
Remove a specific skill from user's desired skills.

```
DELETE /profile/desired-skills/:skillId
```

**Response:**
```json
{
  "message": "Desired skill removed successfully"
}
```

### 4. Availability Management

#### Add/Update Availability
Set user's availability slots. This replaces all existing availability slots.

```
POST /profile/availability
```

**Request Body:**
```json
{
  "slots": [
    {
      "weekday": 1,
      "start_time": "09:00",
      "end_time": "12:00"
    },
    {
      "weekday": 1,
      "start_time": "14:00",
      "end_time": "17:00"
    },
    {
      "weekday": 3,
      "start_time": "10:00",
      "end_time": "15:00"
    },
    {
      "weekday": 6,
      "start_time": "09:00",
      "end_time": "13:00"
    }
  ]
}
```

**Weekday Values:**
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

**Time Format:** HH:MM (24-hour format)

**Response:**
```json
{
  "message": "Availability updated successfully",
  "slots": [
    {
      "id": "slot-uuid",
      "user_id": "user-uuid",
      "weekday": 1,
      "start_time": "09:00",
      "end_time": "12:00"
    },
    {
      "id": "slot-uuid",
      "user_id": "user-uuid",
      "weekday": 1,
      "start_time": "14:00",
      "end_time": "17:00"
    }
  ]
}
```

#### Remove Availability Slot
Remove a specific availability slot.

```
DELETE /profile/availability/:slotId
```

**Response:**
```json
{
  "message": "Availability slot removed successfully"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request
```json
{
  "message": "Validation error message",
  "error": "Detailed error information"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Testing with Postman

1. **Import the Collection:**
   - Import the `Profile_Management_API.postman_collection.json` file into Postman

2. **Set Variables:**
   - Set the `baseUrl` variable to your API base URL (default: `http://localhost:3000/api`)
   - Set the `authToken` variable to your JWT authentication token

3. **Test Sequence:**
   1. First, authenticate and get your JWT token
   2. Use "Get Profile" to see your current profile
   3. Use "Update Profile" to set basic information
   4. Use "Add/Update Skills" to add your offered skills
   5. Use "Add/Update Desired Skills" to add skills you want to learn
   6. Use "Add/Update Availability" to set your availability slots
   7. Use "Get Profile" again to verify all changes

## Sample Test Flow

### Step 1: Update Profile
```bash
PATCH /api/profile
{
  "name": "Jane Smith",
  "location": "San Francisco, CA",
  "visibility": true
}
```

### Step 2: Add Skills
```bash
POST /api/profile/skills
{
  "skills": [
    {"name": "JavaScript", "proficiency": 4},
    {"name": "React", "proficiency": 5},
    {"name": "Node.js", "proficiency": 3}
  ]
}
```

### Step 3: Add Desired Skills
```bash
POST /api/profile/desired-skills
{
  "skills": [
    {"name": "Machine Learning", "priority": 5},
    {"name": "Python", "priority": 4}
  ]
}
```

### Step 4: Add Availability
```bash
POST /api/profile/availability
{
  "slots": [
    {"weekday": 1, "start_time": "19:00", "end_time": "21:00"},
    {"weekday": 6, "start_time": "10:00", "end_time": "16:00"}
  ]
}
```

### Step 5: Verify Profile
```bash
GET /api/profile
```

## Notes

- All skills are automatically created if they don't exist in the system
- Proficiency and priority values must be between 1 and 5
- Availability slots are completely replaced when updating (not merged)
- Time format must be HH:MM (24-hour format)
- All endpoints require authentication
- Skills and desired skills support upsert operations (create or update) 