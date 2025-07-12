# Feedback & Trust System Testing Guide

## Overview
This guide explains how to use the Postman collection `SkillSwap_Feedback_System_Testing.postman_collection.json` to test the Feedback & Trust System module.

## Prerequisites
1. **Postman** installed on your system
2. **Backend server** running (default: http://localhost:3000)
3. **Database** set up with proper migrations applied
4. **Test users** created with accepted swap requests

## Setup Instructions

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select the `SkillSwap_Feedback_System_Testing.postman_collection.json` file
4. The collection will be imported with all endpoints and test cases

### 2. Set Up Environment Variables
The collection uses the following environment variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:3000/api` |
| `auth_token` | JWT authentication token | (auto-populated after login) |
| `user_id` | Current user ID | (auto-populated after login) |
| `swap_id` | Valid swap request ID | `uuid-of-accepted-swap` |
| `feedback_id` | Created feedback ID | (auto-populated after feedback creation) |

### 3. Manual Environment Setup (Optional)
If you prefer to set up manually:
1. Create a new environment in Postman
2. Add the variables listed above
3. Set the environment as active

## Testing Workflow

### Step 1: Authentication
1. **Update Login Credentials**: Edit the "Login User" request with valid credentials
2. **Run Login**: Execute the login request
3. **Verify**: Check that `auth_token` and `user_id` are automatically set

### Step 2: Prepare Test Data
Before testing feedback creation, ensure you have:
1. **Valid Swap ID**: Set the `swap_id` variable to an accepted swap request
2. **User Participation**: Ensure the logged-in user was part of the swap

### Step 3: Test Feedback Creation
1. **Create Feedback**: Run the "Create Feedback" request
2. **Verify Creation**: Check that feedback is created successfully
3. **Test Validation**: Run "Create Feedback - Invalid Data" to test error handling

### Step 4: Test Feedback Retrieval
1. **Get Feedback Stats**: Test personal feedback statistics
2. **Get My Feedback**: Test retrieving received feedback
3. **Get Feedback by ID**: Test retrieving specific feedback details

### Step 5: Test Public Queries
1. **Get User Summary**: Test public feedback summary for users
2. **Get User Feedback List**: Test paginated feedback retrieval
3. **Test Filters**: Run filtered queries (by stars, date, etc.)

### Step 6: Test Admin Functions
1. **Recalculate Rating**: Test the rating recalculation endpoint

### Step 7: Error Handling Tests
1. **Unauthorized Access**: Test without authentication
2. **Invalid Data**: Test with invalid feedback IDs
3. **Missing Fields**: Test with incomplete request data

## API Endpoints Covered

### Feedback Management
- `POST /api/feedback` - Create new feedback
- `GET /api/feedback/details/:feedbackId` - Get feedback by ID

### User Analytics
- `GET /api/feedback/stats` - Get user's feedback statistics
- `GET /api/feedback/me` - Get user's received feedback (with filters)

### Public Queries
- `GET /api/feedback/:userId` - Get user's feedback summary
- `GET /api/feedback/user/:userId` - Get user's feedback list (with filters)

### Admin Functions
- `POST /api/feedback/recalculate/:userId` - Recalculate user rating

## Test Scenarios

### 1. Feedback Creation Tests
- ✅ Valid feedback creation
- ✅ Invalid star rating (outside 1-5 range)
- ✅ Missing required fields
- ✅ Invalid swap ID
- ✅ Duplicate feedback prevention
- ✅ Non-participant feedback rejection

### 2. Feedback Retrieval Tests
- ✅ Get personal feedback statistics
- ✅ Get received feedback with pagination
- ✅ Filter by star rating
- ✅ Filter by date range
- ✅ Get feedback by ID with authorization check

### 3. Public Data Tests
- ✅ User feedback summary with rating breakdown
- ✅ Paginated user feedback lists
- ✅ Filtered public feedback queries
- ✅ Privacy controls (only visible users)

### 4. Error Handling Tests
- ✅ Unauthorized access rejection
- ✅ Invalid ID handling
- ✅ Malformed request handling
- ✅ Database constraint violations

## Expected Response Formats

### Success Response
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": {
        // Response data
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description"
}
```

### Feedback Object
```json
{
    "id": "uuid",
    "swap_id": "uuid",
    "from_user_id": "uuid",
    "to_user_id": "uuid",
    "stars": 5,
    "comment": "Great experience!",
    "created_at": "2024-01-01T00:00:00Z",
    "swap": {
        "id": "uuid",
        "give_skill": { "id": "uuid", "name": "React" },
        "take_skill": { "id": "uuid", "name": "Python" },
        "status": "accepted",
        "created_at": "2024-01-01T00:00:00Z"
    },
    "from_user": {
        "id": "uuid",
        "name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
    },
    "to_user": {
        "id": "uuid",
        "name": "Jane Smith",
        "avatar_url": "https://example.com/avatar.jpg"
    }
}
```

## Database Triggers Testing

The collection indirectly tests database triggers by:
1. **Creating feedback** → Triggers rating recalculation
2. **Verifying updated ratings** → Confirms trigger execution
3. **Manual recalculation** → Tests backup rating calculation

## Common Issues and Solutions

### 1. Authentication Failures
**Issue**: 401 Unauthorized errors
**Solution**: 
- Ensure valid credentials in login request
- Check that `auth_token` is properly set
- Verify token hasn't expired

### 2. Invalid Swap ID
**Issue**: "Swap request not found" errors
**Solution**:
- Use a valid, accepted swap request ID
- Ensure the authenticated user participated in the swap

### 3. No Test Data
**Issue**: Empty response arrays
**Solution**:
- Create test feedback using the API
- Ensure database has sample data
- Check user visibility settings

### 4. Database Constraints
**Issue**: Duplicate feedback errors
**Solution**:
- Each user can only give one feedback per swap
- Use different swap IDs for multiple tests
- Reset test data between runs

## Performance Testing

The collection includes performance checks:
- **Response time**: All requests should complete within 5 seconds
- **Database queries**: Efficient with proper indexing
- **Pagination**: Handles large datasets appropriately

## Security Testing

The collection verifies:
- **Authentication**: All endpoints require valid tokens
- **Authorization**: Users can only access their own data
- **Data validation**: Input sanitization and validation
- **RLS policies**: Database-level security enforcement

## Continuous Integration

For automated testing:
1. Use Newman (Postman CLI) to run the collection
2. Set up environment variables in CI/CD pipeline
3. Run tests after each deployment
4. Monitor test results and response times

```bash
# Install Newman
npm install -g newman

# Run the collection
newman run SkillSwap_Feedback_System_Testing.postman_collection.json \
  --env-var base_url=http://localhost:3000/api \
  --env-var auth_token=your-test-token \
  --env-var user_id=your-test-user-id \
  --env-var swap_id=your-test-swap-id
```

## Troubleshooting

### Debug Mode
Enable verbose logging in requests:
```javascript
console.log('Request:', pm.request);
console.log('Response:', pm.response.json());
```

### Manual Testing
If automated tests fail, run individual requests manually:
1. Check request headers and body
2. Verify environment variables
3. Test with known good data
4. Check server logs for errors

## Contributing

When adding new feedback endpoints:
1. Add corresponding test requests to the collection
2. Include both success and error test cases
3. Update this documentation
4. Ensure proper authentication and authorization tests 