# Public Discovery API Documentation

## Overview

The Public Discovery API allows users to explore the skill swap platform and discover users, skills, and statistics without requiring authentication. This is perfect for letting potential users browse the platform before signing up.

**Base URL:** `/api/public/discovery`

**Authentication:** No authentication required - All endpoints are publicly accessible

## Table of Contents

1. [Data Types](#data-types)
2. [Endpoints](#endpoints)
3. [Error Responses](#error-responses)
4. [Usage Examples](#usage-examples)
5. [Query Parameters](#query-parameters)
6. [Filtering and Sorting](#filtering-and-sorting)

---

## Data Types

### UserProfile Interface
```typescript
interface UserProfile {
  id: string;
  name: string;
  location: string;
  avatar_url?: string;
  visibility: boolean;
  rating_avg: number;
  created_at: string;
  skills: Skill[];
  desiredSkills: DesiredSkill[];
  availability: AvailabilitySlot[];
}
```

### Skill Interface
```typescript
interface Skill {
  id: string;
  name: string;
  proficiency: number; // 1-5 scale
}
```

### DesiredSkill Interface
```typescript
interface DesiredSkill {
  id: string;
  name: string;
  priority: number; // 1-5 scale
}
```

### AvailabilitySlot Interface
```typescript
interface AvailabilitySlot {
  id: string;
  weekday: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}
```

### PopularSkill Interface
```typescript
interface PopularSkill {
  name: string;
  userCount: number;
  averageProficiency: number;
}
```

### DiscoveryStats Interface
```typescript
interface DiscoveryStats {
  totalUsers: number;
  totalSkills: number;
  usersWithAvailability: number;
  averageRating: number;
  activeUsers: number;
}
```

---

## Endpoints

### 1. Get Discovery Statistics

**GET** `/api/public/discovery/stats`

Retrieves general platform statistics including total users, skills, and average ratings.

#### Request
No parameters required.

#### Example Request
```
GET /api/public/discovery/stats
```

#### Success Response (200 OK)
```json
{
  "totalUsers": 1247,
  "totalSkills": 89,
  "usersWithAvailability": 892,
  "averageRating": 4.2,
  "activeUsers": 1247
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "message": "Internal server error"
}
```

---

### 2. Get Popular Skills

**GET** `/api/public/discovery/skills/popular`

Retrieves the most popular skills with user counts and average proficiency levels.

#### Query Parameters
- `limit` (optional): Number of skills to return (default: 20, max: 100)

#### Example Request
```
GET /api/public/discovery/skills/popular?limit=15
```

#### Success Response (200 OK)
```json
{
  "popularSkills": [
    {
      "name": "JavaScript",
      "userCount": 324,
      "averageProficiency": 3.8
    },
    {
      "name": "Python",
      "userCount": 298,
      "averageProficiency": 4.1
    },
    {
      "name": "React",
      "userCount": 267,
      "averageProficiency": 3.6
    },
    {
      "name": "Node.js",
      "userCount": 245,
      "averageProficiency": 3.7
    },
    {
      "name": "UI/UX Design",
      "userCount": 189,
      "averageProficiency": 4.0
    }
  ],
  "totalSkillTypes": 89
}
```

#### Error Response (400 Bad Request)
```json
{
  "message": "Error fetching popular skills",
  "error": "Invalid limit parameter"
}
```

---

### 3. Discover Users (Basic)

**GET** `/api/public/discovery/users`

Retrieves a list of users with their skills and basic information.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 20, max: 50)
- `sortBy` (optional): Sort criteria - `rating`, `recent`, `name`, `skills`, `availability` (default: `recent`)

#### Example Request
```
GET /api/public/discovery/users?page=1&limit=5&sortBy=rating
```

#### Success Response (200 OK)
```json
{
  "users": [
    {
      "id": "user123",
      "name": "Sarah Johnson",
      "location": "San Francisco, CA",
      "avatar_url": "https://example.com/avatars/sarah.jpg",
      "visibility": true,
      "rating_avg": 4.8,
      "created_at": "2024-01-10T14:30:00Z",
      "skills": [
        {
          "id": "skill456",
          "name": "React",
          "proficiency": 5
        },
        {
          "id": "skill789",
          "name": "JavaScript",
          "proficiency": 4
        }
      ],
      "desiredSkills": [
        {
          "id": "skill321",
          "name": "Python",
          "priority": 5
        }
      ],
      "availability": [
        {
          "id": "slot123",
          "weekday": 1,
          "start_time": "09:00",
          "end_time": "17:00"
        }
      ]
    }
  ],
  "totalCount": 1247,
  "page": 1,
  "limit": 5,
  "hasMore": true
}
```

---

### 4. Advanced User Search

**GET** `/api/public/discovery/search`

Performs advanced user search with multiple filtering options.

#### Query Parameters
- `skills` (optional): Comma-separated list of skill names to search for
- `location` (optional): Location filter (partial matching)
- `minRating` (optional): Minimum average rating (decimal)
- `availability` (optional): JSON string with weekdays and/or time range filters
- `proficiencyLevel` (optional): JSON string with min/max proficiency levels
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 50)
- `sortBy` (optional): Sort criteria - `rating`, `recent`, `name`, `skills`, `availability` (default: `rating`)

#### Example Request
```
GET /api/public/discovery/search?skills=React,JavaScript&location=San Francisco&minRating=4.0&page=1&limit=10&sortBy=rating
```

#### Complex Filter Examples

**Search by Skills and Location:**
```
GET /api/public/discovery/search?skills=Python,Django&location=New York&minRating=3.5
```

**Search with Proficiency Level Filter:**
```
GET /api/public/discovery/search?proficiencyLevel={"min":3,"max":5}&limit=15
```

**Search with Availability Filter (Weekdays):**
```
GET /api/public/discovery/search?availability={"weekdays":[1,2,3,4,5]}&limit=10
```

**Search with Availability Filter (Time Range):**
```
GET /api/public/discovery/search?availability={"timeRange":{"start":"09:00","end":"17:00"}}&limit=10
```

**Complex Combined Search:**
```
GET /api/public/discovery/search?skills=React,Node.js&location=Seattle&minRating=4.0&proficiencyLevel={"min":4,"max":5}&availability={"weekdays":[1,2,3,4,5],"timeRange":{"start":"10:00","end":"18:00"}}&sortBy=rating&limit=10
```

#### Success Response (200 OK)
```json
{
  "users": [
    {
      "id": "user456",
      "name": "Mike Chen",
      "location": "San Francisco, CA",
      "avatar_url": "https://example.com/avatars/mike.jpg",
      "visibility": true,
      "rating_avg": 4.6,
      "created_at": "2024-01-08T10:15:00Z",
      "skills": [
        {
          "id": "skill123",
          "name": "React",
          "proficiency": 5
        },
        {
          "id": "skill456",
          "name": "JavaScript",
          "proficiency": 4
        }
      ],
      "desiredSkills": [
        {
          "id": "skill789",
          "name": "Python",
          "priority": 4
        }
      ],
      "availability": [
        {
          "id": "slot456",
          "weekday": 1,
          "start_time": "10:00",
          "end_time": "18:00"
        }
      ]
    }
  ],
  "totalCount": 42,
  "page": 1,
  "limit": 10,
  "hasMore": true,
  "filters": {
    "skills": ["React", "JavaScript"],
    "location": "San Francisco",
    "minRating": 4.0,
    "availability": null,
    "proficiencyLevel": null
  }
}
```

---

### 5. Get Users by Specific Skill

**GET** `/api/public/discovery/skills/{skillName}/users`

Retrieves users who have a specific skill, sorted by proficiency level.

#### URL Parameters
- `skillName` (required): Name of the skill (case-sensitive)

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 50)
- `minProficiency` (optional): Minimum proficiency level 1-5 (default: 1)

#### Example Request
```
GET /api/public/discovery/skills/JavaScript/users?page=1&limit=10&minProficiency=3
```

#### Success Response (200 OK)
```json
{
  "skill": "JavaScript",
  "users": [
    {
      "id": "user789",
      "name": "Alex Rodriguez",
      "location": "Austin, TX",
      "avatar_url": "https://example.com/avatars/alex.jpg",
      "visibility": true,
      "rating_avg": 4.7,
      "created_at": "2024-01-05T16:20:00Z",
      "skills": [
        {
          "id": "skill123",
          "name": "JavaScript",
          "proficiency": 5
        },
        {
          "id": "skill456",
          "name": "React",
          "proficiency": 4
        }
      ],
      "desiredSkills": [
        {
          "id": "skill789",
          "name": "Vue.js",
          "priority": 3
        }
      ],
      "availability": [
        {
          "id": "slot789",
          "weekday": 2,
          "start_time": "14:00",
          "end_time": "20:00"
        }
      ]
    }
  ],
  "totalCount": 324,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

#### Error Response (400 Bad Request)
```json
{
  "message": "Skill name is required"
}
```

---

## Error Responses

### Common Error Response Format
```json
{
  "message": "Error description",
  "error": "Additional error details (optional)"
}
```

### HTTP Status Codes
- **200 OK**: Request successful
- **400 Bad Request**: Invalid request parameters
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Common Error Messages
- `"Error searching users"` (400): Invalid search parameters
- `"Error discovering users"` (400): Invalid discovery parameters
- `"Error fetching users by skill"` (400): Invalid skill name or parameters
- `"Error fetching popular skills"` (400): Invalid limit parameter
- `"Error fetching discovery stats"` (500): Server error retrieving statistics
- `"Skill name is required"` (400): Missing skill name in URL
- `"Internal server error"` (500): General server error

---

## Query Parameters

### Pagination Parameters
- `page`: Page number (starting from 1)
- `limit`: Number of items per page (max varies by endpoint)

### Sorting Parameters
- `sortBy`: Available options:
  - `rating`: Sort by average rating (descending)
  - `recent`: Sort by creation date (most recent first)
  - `name`: Sort alphabetically by name
  - `skills`: Sort by number of skills (descending)
  - `availability`: Sort by number of availability slots (descending)

### Filter Parameters
- `skills`: Comma-separated skill names (e.g., "JavaScript,Python,React")
- `location`: Partial text match for location
- `minRating`: Decimal value for minimum rating (e.g., 4.0)
- `minProficiency`: Integer 1-5 for minimum skill proficiency

### Complex Filter Parameters (JSON Format)

#### Proficiency Level Filter
```json
{
  "min": 3,
  "max": 5
}
```

#### Availability Filter
```json
{
  "weekdays": [1, 2, 3, 4, 5],
  "timeRange": {
    "start": "09:00",
    "end": "17:00"
  }
}
```

---

## Usage Examples

### Get Platform Statistics
```bash
curl -X GET "https://api.skillswap.com/api/public/discovery/stats"
```

### Get Popular Skills
```bash
curl -X GET "https://api.skillswap.com/api/public/discovery/skills/popular?limit=10"
```

### Basic User Discovery
```bash
curl -X GET "https://api.skillswap.com/api/public/discovery/users?page=1&limit=10&sortBy=rating"
```

### Search Users by Skills
```bash
curl -X GET "https://api.skillswap.com/api/public/discovery/search?skills=JavaScript,React&location=San Francisco&minRating=4.0"
```

### Search with Complex Filters
```bash
curl -X GET "https://api.skillswap.com/api/public/discovery/search?skills=Python&proficiencyLevel=%7B%22min%22%3A4%2C%22max%22%3A5%7D&availability=%7B%22weekdays%22%3A%5B1%2C2%2C3%2C4%2C5%5D%7D"
```

### Get Users by Specific Skill
```bash
curl -X GET "https://api.skillswap.com/api/public/discovery/skills/JavaScript/users?minProficiency=3&limit=15"
```

---

## Filtering and Sorting

### Available Sort Options
1. **rating**: Users with highest ratings first
2. **recent**: Most recently joined users first
3. **name**: Alphabetical order by name
4. **skills**: Users with most skills first
5. **availability**: Users with most availability slots first

### Filter Combinations
You can combine multiple filters for precise results:

```bash
# Users with React skills, in New York, rating 4+, available weekdays 9-5
GET /api/public/discovery/search?skills=React&location=New York&minRating=4.0&availability={"weekdays":[1,2,3,4,5],"timeRange":{"start":"09:00","end":"17:00"}}
```

### Proficiency Level Filtering
- Use `minProficiency` for skill-specific endpoints
- Use `proficiencyLevel` JSON object for advanced search
- Proficiency scale: 1 (Beginner) to 5 (Expert)

### Availability Filtering
- `weekdays`: Array of numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
- `timeRange`: Object with `start` and `end` times in HH:MM format
- Can use weekdays only, time range only, or both together

---

## Response Data Structure

### Pagination Response
All list endpoints return pagination information:
```json
{
  "users": [...],
  "totalCount": 1247,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

### User Object Structure
Each user object includes:
- Basic profile information (name, location, avatar, rating)
- Skills array with proficiency levels
- Desired skills array with priority levels
- Availability slots with weekday and time information

---

## Rate Limiting

- **Discovery Endpoints**: 100 requests per minute per IP
- **Search Endpoints**: 50 requests per minute per IP
- **Statistics Endpoints**: 20 requests per minute per IP

No authentication required, but rate limiting is applied based on IP address.

---

## Best Practices

1. **Use Pagination**: Always use `page` and `limit` parameters for large result sets
2. **Specific Searches**: Use skill-specific endpoints when searching for one skill
3. **Filter Early**: Apply filters to reduce result sets before pagination
4. **Cache Results**: Popular skills and stats don't change frequently
5. **Handle Errors**: Always handle potential 400/500 errors gracefully
6. **URL Encoding**: Properly encode special characters in query parameters

---

## Notes

1. **No Authentication**: All endpoints are publicly accessible
2. **Visibility**: Only users with `visibility: true` are returned
3. **Real-time Data**: Results reflect current platform state
4. **Case Sensitivity**: Skill names are case-sensitive in URLs
5. **JSON Filters**: Complex filters must be valid JSON strings
6. **Time Format**: All times use 24-hour HH:MM format
7. **Weekdays**: Use numeric values (0-6) for weekday filtering

---

This API is perfect for building preview pages, landing pages, or allowing users to explore the platform before creating an account! 