# SkillSwap Platform - Skill Discovery & Intelligent Matching Scenarios

## 📋 Overview
This document provides comprehensive scenarios for the SkillSwap Platform's Discovery & Matching features, including exact API queries and expected outputs based on our test data.

## 🧪 Test Data Context
All scenarios use the 5 test users created by our Test Data Creator:
- **Alex Python Expert** (Mumbai) - Python(5), ML(4) → wants React(4), JS(3)
- **Sarah React Developer** (Bangalore) - React(5), JS(4) → wants Python(5), ML(4)  
- **Mike Full Stack** (Delhi) - React(4), Python(4) → wants DevOps(4), AWS(3)
- **Dr. Priya ML Expert** (Hyderabad) - ML(5), Data Science(5) → wants React(3), Web Dev(2)
- **Rahul DevOps Engineer** (Pune) - DevOps(5), AWS(4) → wants Python(4), ML(3)

---

## 🔍 SKILL DISCOVERY SCENARIOS

### **Scenario 1: Basic Skill Search**
**Use Case**: User wants to find people who can teach specific skills

**Query**:
```http
GET /api/discovery/search?skills=React&page=1&limit=10
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "users": [
    {
      "id": "user2_id",
      "name": "Sarah React Developer",
      "location": "Bangalore, India",
      "skills": [
        {"name": "React", "proficiency": 5},
        {"name": "JavaScript", "proficiency": 4},
        {"name": "Node.js", "proficiency": 3},
        {"name": "CSS", "proficiency": 4}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "14:00", "end_time": "18:00"},
        {"weekday": 2, "start_time": "10:00", "end_time": "15:00"}
      ]
    },
    {
      "id": "user3_id", 
      "name": "Mike Full Stack",
      "location": "Delhi, India",
      "skills": [
        {"name": "React", "proficiency": 4},
        {"name": "Python", "proficiency": 4},
        {"name": "Node.js", "proficiency": 4},
        {"name": "SQL", "proficiency": 3}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "09:00", "end_time": "12:00"}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**Explanation**: Returns Sarah (React:5) and Mike (React:4) who can teach React, excluding the requesting user.

---

### **Scenario 2: Multi-Skill Search**
**Use Case**: User wants to find people who can teach multiple skills

**Query**:
```http
GET /api/discovery/search?skills=Python,Machine Learning&page=1&limit=10
Authorization: Bearer {{user2_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "users": [
    {
      "id": "user1_id",
      "name": "Alex Python Expert",
      "location": "Mumbai, India", 
      "skills": [
        {"name": "Python", "proficiency": 5},
        {"name": "Machine Learning", "proficiency": 4},
        {"name": "Data Science", "proficiency": 4},
        {"name": "Django", "proficiency": 3}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "10:00", "end_time": "14:00"},
        {"weekday": 3, "start_time": "09:00", "end_time": "13:00"}
      ]
    },
    {
      "id": "user4_id",
      "name": "Dr. Priya ML Expert", 
      "location": "Hyderabad, India",
      "skills": [
        {"name": "Machine Learning", "proficiency": 5},
        {"name": "Data Science", "proficiency": 5},
        {"name": "Python", "proficiency": 4},
        {"name": "TensorFlow", "proficiency": 4}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 2, "start_time": "11:00", "end_time": "16:00"}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**Explanation**: Returns Alex and Dr. Priya who have both Python and Machine Learning skills.

---

### **Scenario 3: Location-Based Search**
**Use Case**: User wants to find local mentors in specific city

**Query**:
```http
GET /api/discovery/search?location=Mumbai&page=1&limit=10
Authorization: Bearer {{user2_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "users": [
    {
      "id": "user1_id",
      "name": "Alex Python Expert",
      "location": "Mumbai, India",
      "skills": [
        {"name": "Python", "proficiency": 5},
        {"name": "Machine Learning", "proficiency": 4},
        {"name": "Data Science", "proficiency": 4},
        {"name": "Django", "proficiency": 3}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "10:00", "end_time": "14:00"},
        {"weekday": 3, "start_time": "09:00", "end_time": "13:00"}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

**Explanation**: Returns only Alex who is located in Mumbai.

---

### **Scenario 4: Combined Skill + Location Search**
**Use Case**: User wants specific skills from people in specific location

**Query**:
```http
GET /api/discovery/search?skills=React,Python&location=India&page=1&limit=10
Authorization: Bearer {{user4_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "users": [
    {
      "id": "user1_id",
      "name": "Alex Python Expert",
      "location": "Mumbai, India",
      "skills": [
        {"name": "Python", "proficiency": 5},
        {"name": "Machine Learning", "proficiency": 4},
        {"name": "Data Science", "proficiency": 4},
        {"name": "Django", "proficiency": 3}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "10:00", "end_time": "14:00"}
      ]
    },
    {
      "id": "user2_id",
      "name": "Sarah React Developer",
      "location": "Bangalore, India",
      "skills": [
        {"name": "React", "proficiency": 5},
        {"name": "JavaScript", "proficiency": 4},
        {"name": "Node.js", "proficiency": 3},
        {"name": "CSS", "proficiency": 4}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "14:00", "end_time": "18:00"}
      ]
    },
    {
      "id": "user3_id",
      "name": "Mike Full Stack",
      "location": "Delhi, India",
      "skills": [
        {"name": "React", "proficiency": 4},
        {"name": "Python", "proficiency": 4},
        {"name": "Node.js", "proficiency": 4},
        {"name": "SQL", "proficiency": 3}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "09:00", "end_time": "12:00"}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

**Explanation**: Returns Alex (Python), Sarah (React), and Mike (both React & Python) from India.

---

### **Scenario 5: Proficiency-Based Search**
**Use Case**: User wants to find experts with high proficiency in specific skills

**Query**:
```http
GET /api/discovery/search?skills=React&minProficiency=5&page=1&limit=10
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "users": [
    {
      "id": "user2_id",
      "name": "Sarah React Developer",
      "location": "Bangalore, India",
      "skills": [
        {"name": "React", "proficiency": 5},
        {"name": "JavaScript", "proficiency": 4},
        {"name": "Node.js", "proficiency": 3},
        {"name": "CSS", "proficiency": 4}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "14:00", "end_time": "18:00"}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

**Explanation**: Returns only Sarah who has React proficiency of 5. Mike (React:4) is excluded.

---

### **Scenario 6: Browse All Available Users**
**Use Case**: User wants to see all available mentors/learners

**Query**:
```http
GET /api/discovery/users?page=1&limit=10
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "users": [
    {
      "id": "user2_id",
      "name": "Sarah React Developer",
      "location": "Bangalore, India",
      "skills": [
        {"name": "React", "proficiency": 5},
        {"name": "JavaScript", "proficiency": 4}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "14:00", "end_time": "18:00"}
      ]
    },
    {
      "id": "user3_id",
      "name": "Mike Full Stack",
      "location": "Delhi, India",
      "skills": [
        {"name": "React", "proficiency": 4},
        {"name": "Python", "proficiency": 4}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "09:00", "end_time": "12:00"}
      ]
    },
    {
      "id": "user4_id",
      "name": "Dr. Priya ML Expert",
      "location": "Hyderabad, India",
      "skills": [
        {"name": "Machine Learning", "proficiency": 5},
        {"name": "Data Science", "proficiency": 5}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 2, "start_time": "11:00", "end_time": "16:00"}
      ]
    },
    {
      "id": "user5_id",
      "name": "Rahul DevOps Engineer",
      "location": "Pune, India",
      "skills": [
        {"name": "DevOps", "proficiency": 5},
        {"name": "AWS", "proficiency": 4}
      ],
      "rating_avg": 0,
      "total_sessions": 0,
      "visibility": true,
      "availability_slots": [
        {"weekday": 1, "start_time": "18:00", "end_time": "21:00"}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1
  }
}
```

**Explanation**: Returns all users except the requesting user (Alex), showing their basic info and top skills.

---

### **Scenario 7: Find Users by Specific Skill**
**Use Case**: User wants to find all users who can teach a specific skill

**Query**:
```http
GET /api/discovery/skills/Python/users?page=1&limit=10
Authorization: Bearer {{user2_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "skill": "Python",
  "users": [
    {
      "id": "user1_id",
      "name": "Alex Python Expert",
      "location": "Mumbai, India",
      "skill_proficiency": 5,
      "rating_avg": 0,
      "total_sessions": 0,
      "availability_slots": [
        {"weekday": 1, "start_time": "10:00", "end_time": "14:00"},
        {"weekday": 3, "start_time": "09:00", "end_time": "13:00"}
      ]
    },
    {
      "id": "user3_id",
      "name": "Mike Full Stack",
      "location": "Delhi, India",
      "skill_proficiency": 4,
      "rating_avg": 0,
      "total_sessions": 0,
      "availability_slots": [
        {"weekday": 1, "start_time": "09:00", "end_time": "12:00"}
      ]
    },
    {
      "id": "user4_id",
      "name": "Dr. Priya ML Expert",
      "location": "Hyderabad, India",
      "skill_proficiency": 4,
      "rating_avg": 0,
      "total_sessions": 0,
      "availability_slots": [
        {"weekday": 2, "start_time": "11:00", "end_time": "16:00"}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

**Explanation**: Returns all users who have Python skill, sorted by proficiency (Alex:5, Mike:4, Dr.Priya:4).

---

### **Scenario 8: Popular Skills Discovery**
**Use Case**: User wants to see which skills are most popular on the platform

**Query**:
```http
GET /api/discovery/skills/popular?limit=10
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "skills": [
    {
      "name": "Python",
      "user_count": 3,
      "avg_proficiency": 4.33,
      "total_proficiency": 13
    },
    {
      "name": "React",
      "user_count": 2,
      "avg_proficiency": 4.5,
      "total_proficiency": 9
    },
    {
      "name": "Machine Learning",
      "user_count": 2,
      "avg_proficiency": 4.5,
      "total_proficiency": 9
    },
    {
      "name": "Data Science",
      "user_count": 2,
      "avg_proficiency": 4.5,
      "total_proficiency": 9
    },
    {
      "name": "JavaScript",
      "user_count": 1,
      "avg_proficiency": 4.0,
      "total_proficiency": 4
    },
    {
      "name": "Node.js",
      "user_count": 2,
      "avg_proficiency": 3.5,
      "total_proficiency": 7
    },
    {
      "name": "DevOps",
      "user_count": 1,
      "avg_proficiency": 5.0,
      "total_proficiency": 5
    },
    {
      "name": "AWS",
      "user_count": 1,
      "avg_proficiency": 4.0,
      "total_proficiency": 4
    }
  ]
}
```

**Explanation**: Shows skills ranked by user count, with Python being most popular (3 users), followed by React and ML (2 users each).

---

### **Scenario 9: Discovery Statistics**
**Use Case**: User wants to see platform statistics

**Query**:
```http
GET /api/discovery/stats
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "stats": {
    "total_users": 5,
    "total_skills": 12,
    "total_locations": 5,
    "users_with_availability": 5,
    "avg_skills_per_user": 2.4,
    "top_locations": [
      {"location": "Mumbai, India", "count": 1},
      {"location": "Bangalore, India", "count": 1},
      {"location": "Delhi, India", "count": 1},
      {"location": "Hyderabad, India", "count": 1},
      {"location": "Pune, India", "count": 1}
    ],
    "skill_distribution": {
      "beginner": 0,
      "intermediate": 4,
      "advanced": 8,
      "expert": 8
    }
  }
}
```

**Explanation**: Provides comprehensive platform statistics including user count, skill distribution, and location breakdown.

---

## 🤝 INTELLIGENT MATCHING SCENARIOS

### **Scenario 10: Get Personalized Matches**
**Use Case**: User wants to find compatible learning partners

**Query**:
```http
GET /api/matching/matches?page=1&limit=10&minCompatibility=0.3
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "matches": [
    {
      "user": {
        "id": "user2_id",
        "name": "Sarah React Developer",
        "location": "Bangalore, India",
        "skills": [
          {"name": "React", "proficiency": 5},
          {"name": "JavaScript", "proficiency": 4}
        ],
        "desired_skills": [
          {"name": "Python", "priority": 5},
          {"name": "Machine Learning", "priority": 4}
        ],
        "rating_avg": 0,
        "total_sessions": 0
      },
      "compatibility": {
        "overall_score": 0.85,
        "skill_match": 0.8,
        "availability_match": 0.6,
        "location_match": 0.8,
        "rating_match": 1.0,
        "breakdown": {
          "user_can_teach": ["Python", "Machine Learning"],
          "user_can_learn": ["React", "JavaScript"],
          "mutual_availability": [
            {"weekday": 1, "overlap": "10:00-14:00"}
          ],
          "distance_km": 850
        }
      }
    },
    {
      "user": {
        "id": "user3_id",
        "name": "Mike Full Stack",
        "location": "Delhi, India",
        "skills": [
          {"name": "React", "proficiency": 4},
          {"name": "Python", "proficiency": 4}
        ],
        "desired_skills": [
          {"name": "DevOps", "priority": 4},
          {"name": "AWS", "priority": 3}
        ],
        "rating_avg": 0,
        "total_sessions": 0
      },
      "compatibility": {
        "overall_score": 0.65,
        "skill_match": 0.6,
        "availability_match": 0.4,
        "location_match": 0.7,
        "rating_match": 1.0,
        "breakdown": {
          "user_can_teach": ["Python"],
          "user_can_learn": ["React"],
          "mutual_availability": [
            {"weekday": 1, "overlap": "10:00-12:00"}
          ],
          "distance_km": 1200
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**Explanation**: Returns matches for Alex (Python Expert) showing Sarah as 85% compatible (bidirectional match) and Mike as 65% compatible.

---

### **Scenario 11: Perfect Matches (Bidirectional)**
**Use Case**: User wants to find users with mutual skill exchange potential

**Query**:
```http
GET /api/matching/perfect?page=1&limit=5
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "perfect_matches": [
    {
      "user": {
        "id": "user2_id",
        "name": "Sarah React Developer",
        "location": "Bangalore, India",
        "skills": [
          {"name": "React", "proficiency": 5},
          {"name": "JavaScript", "proficiency": 4}
        ],
        "desired_skills": [
          {"name": "Python", "priority": 5},
          {"name": "Machine Learning", "priority": 4}
        ],
        "rating_avg": 0,
        "total_sessions": 0
      },
      "perfect_match_details": {
        "bidirectional_skills": [
          {
            "skill": "Python",
            "alex_teaches": {"proficiency": 5},
            "sarah_wants": {"priority": 5}
          },
          {
            "skill": "React", 
            "sarah_teaches": {"proficiency": 5},
            "alex_wants": {"priority": 4}
          }
        ],
        "compatibility_score": 0.92,
        "mutual_availability": [
          {"weekday": 1, "overlap": "10:00-14:00"}
        ],
        "exchange_potential": "High - Both users can teach what the other wants to learn"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

**Explanation**: Returns Sarah as a perfect match for Alex due to bidirectional skill exchange (Python ↔ React).

---

### **Scenario 12: Match Analysis**
**Use Case**: User wants detailed analysis of compatibility with specific user

**Query**:
```http
GET /api/matching/analysis/user2_id
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "analysis": {
    "target_user": {
      "id": "user2_id",
      "name": "Sarah React Developer",
      "location": "Bangalore, India"
    },
    "compatibility": {
      "overall_score": 0.85,
      "skill_match": 0.8,
      "availability_match": 0.6,
      "location_match": 0.8,
      "rating_match": 1.0
    },
    "detailed_breakdown": {
      "skills_you_can_teach_them": [
        {"name": "Python", "your_proficiency": 5, "their_interest": 5},
        {"name": "Machine Learning", "your_proficiency": 4, "their_interest": 4},
        {"name": "Data Science", "your_proficiency": 4, "their_interest": 0}
      ],
      "skills_they_can_teach_you": [
        {"name": "React", "their_proficiency": 5, "your_interest": 4},
        {"name": "JavaScript", "their_proficiency": 4, "your_interest": 3},
        {"name": "CSS", "their_proficiency": 4, "your_interest": 0}
      ],
      "mutual_skills": [],
      "availability_overlap": [
        {
          "weekday": 1,
          "your_slot": "10:00-14:00",
          "their_slot": "14:00-18:00",
          "overlap": "14:00-14:00",
          "overlap_duration": "0 minutes"
        }
      ],
      "location_details": {
        "your_location": "Mumbai, India",
        "their_location": "Bangalore, India",
        "distance_km": 850,
        "same_country": true,
        "same_city": false
      }
    },
    "recommendations": [
      "Perfect bidirectional match for Python ↔ React exchange",
      "High mutual interest in each other's skills",
      "Consider scheduling sessions during overlapping time zones",
      "Both are in India, making scheduling easier"
    ]
  }
}
```

**Explanation**: Provides detailed compatibility analysis between Alex and Sarah, highlighting bidirectional learning potential.

---

### **Scenario 13: Skill Recommendations**
**Use Case**: User wants personalized skill recommendations

**Query**:
```http
GET /api/matching/recommendations/skills?limit=5
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "recommendations": [
    {
      "skill": "React",
      "priority": 5,
      "reasoning": "High demand skill with 2 expert teachers available",
      "available_teachers": [
        {"name": "Sarah React Developer", "proficiency": 5, "location": "Bangalore"},
        {"name": "Mike Full Stack", "proficiency": 4, "location": "Delhi"}
      ],
      "market_demand": "High",
      "learning_path": "Beginner → Intermediate → Advanced",
      "estimated_sessions": 8
    },
    {
      "skill": "JavaScript",
      "priority": 4,
      "reasoning": "Complements your React interest, available teacher nearby",
      "available_teachers": [
        {"name": "Sarah React Developer", "proficiency": 4, "location": "Bangalore"}
      ],
      "market_demand": "Very High",
      "learning_path": "Beginner → Intermediate",
      "estimated_sessions": 6
    },
    {
      "skill": "DevOps",
      "priority": 3,
      "reasoning": "Emerging skill with expert teacher available",
      "available_teachers": [
        {"name": "Rahul DevOps Engineer", "proficiency": 5, "location": "Pune"}
      ],
      "market_demand": "High",
      "learning_path": "Beginner → Intermediate → Advanced",
      "estimated_sessions": 10
    }
  ]
}
```

**Explanation**: Recommends React, JavaScript, and DevOps based on Alex's interests, available teachers, and market demand.

---

### **Scenario 14: Find Skill Requesters**
**Use Case**: User wants to find people who want to learn skills they can teach

**Query**:
```http
GET /api/matching/requesters?skills=Python,Machine Learning&page=1&limit=10
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "requesters": [
    {
      "user": {
        "id": "user2_id",
        "name": "Sarah React Developer",
        "location": "Bangalore, India",
        "rating_avg": 0,
        "total_sessions": 0
      },
      "requested_skills": [
        {"name": "Python", "priority": 5},
        {"name": "Machine Learning", "priority": 4}
      ],
      "compatibility": {
        "overall_score": 0.85,
        "skill_match": 0.9,
        "availability_match": 0.6,
        "location_match": 0.8
      },
      "can_offer_back": [
        {"name": "React", "proficiency": 5},
        {"name": "JavaScript", "proficiency": 4}
      ]
    },
    {
      "user": {
        "id": "user5_id",
        "name": "Rahul DevOps Engineer",
        "location": "Pune, India",
        "rating_avg": 0,
        "total_sessions": 0
      },
      "requested_skills": [
        {"name": "Python", "priority": 4},
        {"name": "Machine Learning", "priority": 3}
      ],
      "compatibility": {
        "overall_score": 0.72,
        "skill_match": 0.8,
        "availability_match": 0.4,
        "location_match": 0.9
      },
      "can_offer_back": [
        {"name": "DevOps", "proficiency": 5},
        {"name": "AWS", "proficiency": 4}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**Explanation**: Returns Sarah and Rahul who want to learn Python/ML from Alex, showing what they can offer in return.

---

### **Scenario 15: Find Skill Teachers**
**Use Case**: User wants to find people who can teach skills they want to learn

**Query**:
```http
GET /api/matching/teachers?skills=React,JavaScript&page=1&limit=10
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "teachers": [
    {
      "user": {
        "id": "user2_id",
        "name": "Sarah React Developer",
        "location": "Bangalore, India",
        "rating_avg": 0,
        "total_sessions": 0
      },
      "teaching_skills": [
        {"name": "React", "proficiency": 5},
        {"name": "JavaScript", "proficiency": 4}
      ],
      "compatibility": {
        "overall_score": 0.85,
        "skill_match": 0.9,
        "availability_match": 0.6,
        "location_match": 0.8
      },
      "interested_in": [
        {"name": "Python", "priority": 5},
        {"name": "Machine Learning", "priority": 4}
      ]
    },
    {
      "user": {
        "id": "user3_id",
        "name": "Mike Full Stack",
        "location": "Delhi, India",
        "rating_avg": 0,
        "total_sessions": 0
      },
      "teaching_skills": [
        {"name": "React", "proficiency": 4}
      ],
      "compatibility": {
        "overall_score": 0.65,
        "skill_match": 0.7,
        "availability_match": 0.4,
        "location_match": 0.7
      },
      "interested_in": [
        {"name": "DevOps", "priority": 4},
        {"name": "AWS", "priority": 3}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**Explanation**: Returns Sarah and Mike who can teach React/JavaScript to Alex, showing their teaching skills and interests.

---

### **Scenario 16: High Compatibility Matches**
**Use Case**: User wants to find highly compatible matches

**Query**:
```http
GET /api/matching/matches?page=1&limit=5&minCompatibility=0.7
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "matches": [
    {
      "user": {
        "id": "user2_id",
        "name": "Sarah React Developer",
        "location": "Bangalore, India",
        "skills": [
          {"name": "React", "proficiency": 5},
          {"name": "JavaScript", "proficiency": 4}
        ],
        "desired_skills": [
          {"name": "Python", "priority": 5},
          {"name": "Machine Learning", "priority": 4}
        ]
      },
      "compatibility": {
        "overall_score": 0.85,
        "skill_match": 0.8,
        "availability_match": 0.6,
        "location_match": 0.8,
        "rating_match": 1.0,
        "breakdown": {
          "user_can_teach": ["Python", "Machine Learning"],
          "user_can_learn": ["React", "JavaScript"],
          "mutual_availability": [
            {"weekday": 1, "overlap": "10:00-14:00"}
          ],
          "perfect_match": true
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

**Explanation**: Returns only Sarah who meets the 70% compatibility threshold with Alex.

---

### **Scenario 17: Matching Statistics**
**Use Case**: User wants to see matching statistics and trends

**Query**:
```http
GET /api/matching/stats
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "stats": {
    "total_potential_matches": 4,
    "perfect_matches": 1,
    "high_compatibility_matches": 1,
    "medium_compatibility_matches": 2,
    "low_compatibility_matches": 1,
    "avg_compatibility": 0.67,
    "skill_exchange_opportunities": {
      "bidirectional": 1,
      "one_way": 3,
      "mutual_skills": 0
    },
    "availability_overlap": {
      "users_with_overlap": 2,
      "avg_overlap_hours": 1.5,
      "best_overlap_day": "Monday"
    },
    "location_distribution": {
      "same_city": 0,
      "same_country": 4,
      "different_country": 0
    },
    "top_requested_skills": [
      {"skill": "React", "requests": 2},
      {"skill": "Python", "requests": 2},
      {"skill": "Machine Learning", "requests": 2}
    ],
    "top_offered_skills": [
      {"skill": "Python", "offers": 1},
      {"skill": "Machine Learning", "offers": 1},
      {"skill": "Data Science", "offers": 1}
    ]
  }
}
```

**Explanation**: Provides comprehensive matching statistics for Alex, showing 1 perfect match and overall compatibility trends.

---

### **Scenario 18: Location-Based Matching**
**Use Case**: User wants to find matches in specific location

**Query**:
```http
GET /api/matching/matches?location=India&page=1&limit=10&minCompatibility=0.3
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "matches": [
    {
      "user": {
        "id": "user2_id",
        "name": "Sarah React Developer",
        "location": "Bangalore, India",
        "skills": [{"name": "React", "proficiency": 5}],
        "desired_skills": [{"name": "Python", "priority": 5}]
      },
      "compatibility": {
        "overall_score": 0.85,
        "location_match": 0.8,
        "breakdown": {
          "distance_km": 850,
          "same_country": true
        }
      }
    },
    {
      "user": {
        "id": "user3_id",
        "name": "Mike Full Stack",
        "location": "Delhi, India",
        "skills": [{"name": "React", "proficiency": 4}],
        "desired_skills": [{"name": "DevOps", "priority": 4}]
      },
      "compatibility": {
        "overall_score": 0.65,
        "location_match": 0.7,
        "breakdown": {
          "distance_km": 1200,
          "same_country": true
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**Explanation**: Returns matches within India, showing distance calculations and location-based compatibility.

---

### **Scenario 19: Skill-Specific Matching**
**Use Case**: User wants matches for specific skills they want to learn

**Query**:
```http
GET /api/matching/matches?skills=React&page=1&limit=10&minCompatibility=0.4
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "matches": [
    {
      "user": {
        "id": "user2_id",
        "name": "Sarah React Developer",
        "location": "Bangalore, India",
        "skills": [
          {"name": "React", "proficiency": 5},
          {"name": "JavaScript", "proficiency": 4}
        ],
        "desired_skills": [
          {"name": "Python", "priority": 5}
        ]
      },
      "compatibility": {
        "overall_score": 0.85,
        "skill_match": 0.9,
        "breakdown": {
          "matching_skills": [
            {"skill": "React", "teacher_proficiency": 5, "learner_interest": 4}
          ],
          "perfect_match": true
        }
      }
    },
    {
      "user": {
        "id": "user3_id",
        "name": "Mike Full Stack",
        "location": "Delhi, India",
        "skills": [
          {"name": "React", "proficiency": 4},
          {"name": "Python", "proficiency": 4}
        ],
        "desired_skills": [
          {"name": "DevOps", "priority": 4}
        ]
      },
      "compatibility": {
        "overall_score": 0.65,
        "skill_match": 0.7,
        "breakdown": {
          "matching_skills": [
            {"skill": "React", "teacher_proficiency": 4, "learner_interest": 4}
          ],
          "perfect_match": false
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**Explanation**: Returns users who can teach React to Alex, with Sarah being the better match due to higher proficiency.

---

### **Scenario 20: Complex Multi-Filter Matching**
**Use Case**: User wants very specific matches with multiple criteria

**Query**:
```http
GET /api/matching/matches?skills=React&location=India&minCompatibility=0.6&minRating=0&page=1&limit=5
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "matches": [
    {
      "user": {
        "id": "user2_id",
        "name": "Sarah React Developer",
        "location": "Bangalore, India",
        "skills": [
          {"name": "React", "proficiency": 5},
          {"name": "JavaScript", "proficiency": 4}
        ],
        "desired_skills": [
          {"name": "Python", "priority": 5},
          {"name": "Machine Learning", "priority": 4}
        ],
        "rating_avg": 0,
        "total_sessions": 0
      },
      "compatibility": {
        "overall_score": 0.85,
        "skill_match": 0.9,
        "availability_match": 0.6,
        "location_match": 0.8,
        "rating_match": 1.0,
        "breakdown": {
          "matching_skills": ["React"],
          "bidirectional_skills": ["Python", "React"],
          "location_bonus": 0.1,
          "perfect_match": true
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

**Explanation**: Returns Sarah who meets all criteria: can teach React, is in India, has 85% compatibility (>60%), and meets minimum rating.

---

## 🎯 EDGE CASES & SPECIAL SCENARIOS

### **Scenario 21: Empty Results**
**Use Case**: User searches for non-existent skills

**Query**:
```http
GET /api/discovery/search?skills=Blockchain&page=1&limit=10
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "users": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  },
  "message": "No users found matching the specified criteria"
}
```

**Explanation**: Returns empty results when no users have the requested skill.

---

### **Scenario 22: Single User Platform**
**Use Case**: Only one user exists on platform

**Query**:
```http
GET /api/matching/matches?page=1&limit=10
Authorization: Bearer {{only_user_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "matches": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  },
  "message": "No other users available for matching"
}
```

**Explanation**: Returns empty results when user is the only one on the platform.

---

### **Scenario 23: High Volume Pagination**
**Use Case**: User wants to paginate through many results

**Query**:
```http
GET /api/discovery/users?page=3&limit=2
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "users": [
    {
      "id": "user5_id",
      "name": "Rahul DevOps Engineer",
      "location": "Pune, India",
      "skills": [{"name": "DevOps", "proficiency": 5}]
    }
  ],
  "pagination": {
    "page": 3,
    "limit": 2,
    "total": 4,
    "totalPages": 2,
    "hasNextPage": false,
    "hasPreviousPage": true
  }
}
```

**Explanation**: Shows pagination working correctly with page 3 of 2 results per page.

---

## 🔮 ADVANCED MATCHING SCENARIOS

### **Scenario 24: Mutual Skill Exchange**
**Use Case**: Complex bidirectional matching

**Query**:
```http
GET /api/matching/perfect?bidirectional=true&page=1&limit=5
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "perfect_matches": [
    {
      "user": {
        "id": "user2_id",
        "name": "Sarah React Developer",
        "location": "Bangalore, India"
      },
      "perfect_match_details": {
        "bidirectional_skills": [
          {
            "skill": "Python",
            "alex_proficiency": 5,
            "sarah_priority": 5,
            "exchange_score": 1.0
          },
          {
            "skill": "React",
            "sarah_proficiency": 5,
            "alex_priority": 4,
            "exchange_score": 0.9
          }
        ],
        "total_exchange_score": 0.95,
        "mutual_benefit": "Both users maximize learning potential",
        "session_recommendation": "Alternating skill sessions"
      }
    }
  ]
}
```

**Explanation**: Shows perfect bidirectional match with detailed exchange scoring.

---

### **Scenario 25: Skill Gap Analysis**
**Use Case**: User wants to understand skill gaps in their learning journey

**Query**:
```http
GET /api/matching/analysis/skill-gaps?targetSkills=React,Node.js,MongoDB
Authorization: Bearer {{user1_token}}
```

**Expected Output**:
```json
{
  "success": true,
  "skill_gap_analysis": {
    "target_skills": ["React", "Node.js", "MongoDB"],
    "current_skills": ["Python", "Machine Learning", "Data Science"],
    "skill_gaps": [
      {
        "skill": "React",
        "gap_level": "Complete beginner",
        "available_teachers": 2,
        "best_teacher": {
          "name": "Sarah React Developer",
          "proficiency": 5,
          "compatibility": 0.85
        },
        "learning_path": ["HTML/CSS", "JavaScript", "React Basics", "React Advanced"],
        "estimated_time": "3-4 months"
      },
      {
        "skill": "Node.js",
        "gap_level": "Complete beginner",
        "available_teachers": 2,
        "best_teacher": {
          "name": "Sarah React Developer",
          "proficiency": 3,
          "compatibility": 0.85
        },
        "learning_path": ["JavaScript", "Node.js Basics", "Express.js", "APIs"],
        "estimated_time": "2-3 months"
      },
      {
        "skill": "MongoDB",
        "gap_level": "Complete beginner",
        "available_teachers": 0,
        "best_teacher": null,
        "learning_path": ["Database Concepts", "NoSQL", "MongoDB Basics"],
        "estimated_time": "1-2 months",
        "recommendation": "Consider learning from external resources"
      }
    ],
    "overall_journey": {
      "total_skills_to_learn": 3,
      "skills_with_teachers": 2,
      "skills_without_teachers": 1,
      "estimated_total_time": "6-9 months",
      "recommended_order": ["JavaScript", "React", "Node.js", "MongoDB"]
    }
  }
}
```

**Explanation**: Provides comprehensive skill gap analysis with learning paths and teacher availability.

---

## 📊 SUMMARY

This document covers **25 comprehensive scenarios** including:

### **Discovery Features (9 scenarios)**
- Basic and advanced skill searches
- Location-based filtering
- Proficiency requirements
- Popular skills analysis
- Platform statistics

### **Matching Features (15 scenarios)**
- Compatibility scoring
- Perfect bidirectional matches
- Detailed match analysis
- Skill recommendations
- Teacher/requester finding
- Advanced filtering and pagination

### **Edge Cases (3 scenarios)**
- Empty results handling
- Single user scenarios
- High-volume pagination

Each scenario includes:
- ✅ **Use case description**
- ✅ **Exact API query with parameters**
- ✅ **Complete expected JSON response**
- ✅ **Detailed explanation of results**
- ✅ **Real data based on our 5 test users**

These scenarios demonstrate the **full capabilities** of the SkillSwap Platform's Discovery & Matching system! 🚀 