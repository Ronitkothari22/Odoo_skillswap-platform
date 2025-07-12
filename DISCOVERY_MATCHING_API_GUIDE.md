# Skill Discovery & Intelligent Matching API Guide

## 📋 Overview
This guide covers the new Skill Discovery and Intelligent Matching features of the SkillSwap Platform API. The system provides advanced user discovery, compatibility analysis, and personalized skill recommendations.

## 🚀 Getting Started

### 1. Import the Postman Collection
1. Download the `SkillSwap_Discovery_Matching_API.postman_collection.json` file
2. Open Postman
3. Click "Import" and select the JSON file
4. The collection will be organized into three main folders:
   - 🔍 **Skill Discovery** - Find and search users
   - 🎯 **Intelligent Matching** - Get personalized matches
   - 🔧 **Setup & Testing** - Helper endpoints for testing

### 2. Configure Environment Variables
Set these variables in your Postman environment:
- `base_url`: `http://localhost:8080` (or your server URL)
- `access_token`: Your JWT token from authentication
- `target_user_id`: A valid user UUID for testing match analysis

### 3. Authentication Flow
1. **Create a test user** using `Create Test User` endpoint
2. **Login** using `Login (Get Token)` endpoint
3. **Copy the access_token** from the response and update the environment variable
4. **Setup profile data** using the setup endpoints

## 🔍 Skill Discovery Endpoints

### Search Users
`GET /api/discovery/search`

**Purpose**: Advanced user search with multiple filters

**Key Parameters**:
- `skills`: Comma-separated skills (e.g., "JavaScript,Python")
- `location`: Location filter
- `minRating`: Minimum user rating (1-5)
- `availability`: JSON format availability filter
- `proficiencyLevel`: JSON format proficiency filter
- `sortBy`: Sort criteria (rating, recent, name, skills, availability)

**Example**:
```
GET /api/discovery/search?skills=JavaScript,Python&location=New York&minRating=4&page=1&limit=10
```

### Discover Users
`GET /api/discovery/users`

**Purpose**: Browse all available users with basic filtering

**Key Parameters**:
- `page`, `limit`: Pagination
- `sortBy`: Sort order
- `excludeViewed`: Exclude previously viewed users

### Get Users by Skill
`GET /api/discovery/skills/{skillName}/users`

**Purpose**: Find all users who have a specific skill

**Example**:
```
GET /api/discovery/skills/JavaScript/users?minProficiency=3
```

### Get Popular Skills
`GET /api/discovery/skills/popular`

**Purpose**: Get most popular skills on the platform

**Use Case**: Show trending skills, suggest skills to learn

### Get Discovery Stats
`GET /api/discovery/stats`

**Purpose**: Platform statistics for discovery dashboard

## 🎯 Intelligent Matching Endpoints

### Get Matches
`GET /api/matching/matches`

**Purpose**: Get personalized matches based on compatibility algorithms

**Key Parameters**:
- `minCompatibility`: Minimum compatibility score (0-1)
- `sortBy`: Sort by compatibility, rating, or recent
- `includeMatchScore`: Include detailed scoring breakdown

**Algorithm considers**:
- Skill compatibility (40%)
- Availability overlap (30%)
- Location proximity (20%)
- Rating similarity (10%)

### Get Match Analysis
`GET /api/matching/analysis/{targetUserId}`

**Purpose**: Deep compatibility analysis between two users

**Returns**:
- Detailed match scores
- What each user can teach/learn
- Compatibility breakdown
- Recommendation reasoning

### Get Skill Recommendations
`GET /api/matching/recommendations/skills`

**Purpose**: Suggest new skills to learn based on platform data

**Algorithm considers**:
- Skill popularity
- Average teacher ratings
- Demand vs supply

### Get Skill Requesters
`GET /api/matching/requesters`

**Purpose**: Find users who want to learn what you can teach

**Use Case**: Proactive matching, find students for your skills

### Get Skill Teachers
`GET /api/matching/teachers`

**Purpose**: Find users who can teach what you want to learn

**Parameters**:
- `minProficiency`: Minimum teacher skill level required

### Get Perfect Matches
`GET /api/matching/perfect`

**Purpose**: Find bidirectional skill exchanges

**Criteria**:
- Current user can teach something target user wants
- Target user can teach something current user wants

### Get Matching Stats
`GET /api/matching/stats`

**Purpose**: Personal matching statistics and insights

## 🔧 Setup & Testing Workflow

### Initial Setup
1. **API Health Check** - Verify server is running
2. **Create Test User** - Create a test account
3. **Login** - Get authentication token
4. **Add Test Skills** - Add skills you can teach
5. **Add Desired Skills** - Add skills you want to learn
6. **Update Profile** - Add location and other info

### Testing Discovery
1. Search for users with specific skills
2. Browse users by popularity or recent activity
3. Look for users with specific skills like "JavaScript"
4. Check popular skills on the platform
5. View discovery statistics

### Testing Matching
1. Get your personalized matches
2. Analyze compatibility with a specific user
3. Check skill recommendations
4. Find people who want to learn from you
5. Find people who can teach you
6. Look for perfect bidirectional matches
7. View your matching statistics

## 📊 Response Examples

### Match Response
```json
{
  "success": true,
  "matches": [
    {
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "location": "New York, NY",
        "rating_avg": 4.5,
        "skills": [...],
        "desiredSkills": [...],
        "availability": [...]
      },
      "score": {
        "totalScore": 0.85,
        "skillCompatibility": 0.9,
        "availabilityOverlap": 0.7,
        "locationProximity": 1.0,
        "ratingMatch": 0.8
      },
      "mutualSkills": [
        {
          "skill": "JavaScript",
          "userProficiency": 4,
          "partnerDesire": 5,
          "compatibility": 0.8
        }
      ],
      "matchType": "perfect_match",
      "recommendationReason": "Perfect for JavaScript and Python skill exchange"
    }
  ],
  "totalCount": 25,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

### Discovery Response
```json
{
  "users": [
    {
      "id": "user-uuid",
      "name": "Jane Smith",
      "location": "San Francisco, CA",
      "rating_avg": 4.2,
      "skills": [
        {
          "id": "skill-uuid",
          "name": "Python",
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
      "availability": [...]
    }
  ],
  "totalCount": 50,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

## 🔐 Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## 🚦 Error Handling
- **401 Unauthorized**: Invalid or missing token
- **404 Not Found**: User or resource not found
- **400 Bad Request**: Invalid parameters
- **500 Internal Server Error**: Server error

## 🎯 Best Practices

1. **Testing Order**: Always start with setup endpoints to create test data
2. **Token Management**: Keep your JWT token updated in environment variables
3. **Pagination**: Use pagination for large result sets
4. **Filtering**: Use specific filters to reduce response size
5. **Rate Limiting**: Be mindful of API rate limits during testing

## 🔄 Matching Algorithm Details

### Compatibility Scoring
- **Skill Compatibility (40%)**: Mutual teaching/learning opportunities
- **Availability Overlap (30%)**: Shared available time slots
- **Location Proximity (20%)**: Geographic closeness
- **Rating Match (10%)**: Similar reputation levels

### Match Types
- **Perfect Match**: High compatibility + mutual skills
- **Good Match**: High overall compatibility
- **Skill Complementary**: Strong skill alignment
- **Availability Match**: Good schedule overlap
- **Location Based**: Geographic proximity
- **Similar Interests**: Shared skill interests

This comprehensive API enables rich user discovery and intelligent matching for the SkillSwap platform! 