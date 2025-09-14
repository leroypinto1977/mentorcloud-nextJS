# Session-Based User Data Collection Setup

## Overview

This system now uses session-based data collection instead of fetching the latest user. Each conversation generates a unique session ID that should be used to track and retrieve user data.

## Session Flow

1. **Start Conversation**: Generate unique session ID → Register session with n8n → Start ElevenLabs conversation
2. **During Conversation**: Session ID available for any data collection needs
3. **End Conversation**: Fetch user data using session ID

## Required n8n Webhook Endpoints

### 1. Register Session Endpoint

**URL**: `https://madhan137.app.n8n.cloud/webhook/webhook/register-session`
**Method**: POST
**Purpose**: Register a new session when conversation starts

**Request Body**:

```json
{
  "sessionId": "session_1726321234567_abc123def",
  "timestamp": "2025-09-14T10:30:00.000Z",
  "status": "started"
}
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Session registered successfully",
  "sessionId": "session_1726321234567_abc123def"
}
```

### 2. Get User Data by Session Endpoint

**URL**: `https://madhan137.app.n8n.cloud/webhook/webhook/get-user-data?sessionId=SESSION_ID`
**Method**: GET
**Purpose**: Retrieve user data for a specific session

**Request**:

- Query parameter: `sessionId` (the session ID from the conversation)

**Expected Response**:

```json
[
  {
    "success": true,
    "data": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "short_term_goals": "Learn new skills",
      "long_term_goals": "Advance career",
      "background": "Software engineer with 5 years experience",
      "strengths": ["Problem solving", "Communication", "Leadership"],
      "motivations": "Drive to help others succeed",
      "values": ["Integrity", "Innovation", "Collaboration"],
      "career_focus": ["Technology", "Management"],
      "dei_interests": "Promoting diversity in tech",
      "mentor_preferences": "Someone with industry experience",
      "professional_summary": "Experienced developer looking to transition to leadership",
      "created_at": "2025-09-14T10:30:00.000Z",
      "updated_at": "2025-09-14T10:35:00.000Z",
      "status": "active",
      "source": "voice_conversation"
    }
  }
]
```

## ElevenLabs Agent Configuration

### Required Agent Prompt Updates

You need to update your ElevenLabs agent to be aware of the session ID and send it when collecting user data.

### System Prompt Addition

Add this to your agent's system prompt:

```
You are now equipped with a session tracking system. When a conversation begins, you will be provided with a unique session ID that should be used for all data collection activities.

Session ID Format: session_[timestamp]_[random_string]
Example: session_1726321234567_abc123def

IMPORTANT: When collecting user information during the conversation, you should send this data to the webhook endpoint along with the session ID so it can be properly tracked and retrieved later.

When making API calls to collect or store user data, always include the session ID in your requests.
```

### Function Configuration

If your ElevenLabs agent supports function calling, configure it to call your n8n webhook with the session ID:

```json
{
  "name": "store_user_data",
  "description": "Store collected user information with session tracking",
  "parameters": {
    "type": "object",
    "properties": {
      "sessionId": {
        "type": "string",
        "description": "The current session ID for tracking this conversation"
      },
      "userData": {
        "type": "object",
        "description": "The collected user information"
      }
    },
    "required": ["sessionId", "userData"]
  }
}
```

## Implementation Steps

### Step 1: Create n8n Workflows

1. **Register Session Workflow**:

   - Webhook trigger (POST)
   - Extract sessionId, timestamp, status from body
   - Store session record in database
   - Return success response

2. **Store User Data Workflow** (called by ElevenLabs agent):

   - Webhook trigger (POST)
   - Extract sessionId and userData from body
   - Store/update user data linked to sessionId
   - Return success response

3. **Get User Data Workflow**:
   - Webhook trigger (GET)
   - Extract sessionId from query parameters
   - Query database for user data by sessionId
   - Return user data in expected format

### Step 2: Update ElevenLabs Agent

1. Access your ElevenLabs agent configuration
2. Update the system prompt to include session awareness
3. Configure function calling to use your n8n webhooks
4. Test the integration

### Step 3: Test the Flow

1. Start a conversation in the app
2. Check console logs for session ID generation
3. Verify session registration in n8n logs
4. Have a conversation where user data is collected
5. End conversation and verify data retrieval

## Database Schema Suggestions

### Sessions Table

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'started',
  conversation_id VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### User Data Table

```sql
CREATE TABLE user_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  short_term_goals TEXT,
  long_term_goals TEXT,
  background TEXT,
  strengths JSON,
  motivations TEXT,
  values JSON,
  career_focus JSON,
  dei_interests TEXT,
  mentor_preferences TEXT,
  professional_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  source VARCHAR(50) DEFAULT 'voice_conversation',
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

## Benefits of Session-Based System

1. **Proper Data Isolation**: Each conversation's data is separate
2. **Audit Trail**: Track which data came from which conversation
3. **Concurrent Users**: Multiple users can use the system simultaneously
4. **Data Integrity**: No risk of fetching wrong user's data
5. **Session Management**: Can track conversation states and analytics
6. **Debugging**: Easier to trace issues with specific conversations

## Migration from Current System

The old endpoint (`get-latest-user`) is no longer used. The new system:

- Generates unique session IDs
- Registers sessions before starting conversations
- Fetches data by session ID instead of "latest"
- Provides better data accuracy and user isolation
