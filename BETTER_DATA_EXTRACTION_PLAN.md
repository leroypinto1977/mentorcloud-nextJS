# Better Data Extraction Plan: Using ElevenLabs Agent Intelligence

## 🎯 The Better Approach

Instead of manually managing sessions, we can leverage the ElevenLabs conversational AI agent itself to extract and provide user data. This is more reliable, intelligent, and eliminates external session management complexity.

## 🔄 Recommended Approaches (Best to Good)

### Approach 1: Agent Function Calling (BEST) ⭐⭐⭐⭐⭐

**How it Works:**
- Configure the ElevenLabs agent with function calling capabilities
- Agent automatically extracts user information during conversation
- Agent calls your webhook with structured data when conversation ends
- No manual session management needed

**Implementation:**

1. **Configure Agent Functions in ElevenLabs:**
```json
{
  "functions": [
    {
      "name": "save_user_profile",
      "description": "Save collected user information at the end of conversation",
      "parameters": {
        "type": "object",
        "properties": {
          "user_data": {
            "type": "object",
            "properties": {
              "name": {"type": "string"},
              "email": {"type": "string"},
              "phone": {"type": "string"},
              "short_term_goals": {"type": "string"},
              "long_term_goals": {"type": "string"},
              "background": {"type": "string"},
              "strengths": {"type": "array", "items": {"type": "string"}},
              "motivations": {"type": "string"},
              "values": {"type": "array", "items": {"type": "string"}},
              "career_focus": {"type": "array", "items": {"type": "string"}},
              "dei_interests": {"type": "string"},
              "mentor_preferences": {"type": "string"},
              "professional_summary": {"type": "string"}
            }
          },
          "conversation_id": {"type": "string"},
          "timestamp": {"type": "string"}
        }
      }
    }
  ]
}
```

2. **Agent System Prompt:**
```
You are a mentor matching assistant. During conversations, gather comprehensive user information including:
- Personal details (name, email, phone)
- Career goals (short-term and long-term)
- Professional background
- Strengths and values
- Motivations and interests
- Mentoring preferences

At the END of each conversation, automatically call the save_user_profile function with all collected information in a structured format.
```

3. **Your n8n Webhook** (`save-user-profile`):
```javascript
// Receives function call from ElevenLabs agent
{
  "user_data": {...},
  "conversation_id": "conv_12345",
  "timestamp": "2025-09-14T10:30:00Z"
}
```

---

### Approach 2: Agent-Generated Summary (VERY GOOD) ⭐⭐⭐⭐

**How it Works:**
- Agent generates a structured summary at conversation end
- Extract this summary from the final agent message
- Parse the structured data automatically

**Implementation:**

1. **Agent Prompt Addition:**
```
At the end of each conversation, provide a STRUCTURED SUMMARY in this exact JSON format:

---STRUCTURED_SUMMARY_START---
{
  "user_profile": {
    "name": "extracted_name",
    "email": "extracted_email",
    "phone": "extracted_phone",
    "short_term_goals": "extracted_goals",
    "long_term_goals": "extracted_goals",
    "background": "extracted_background",
    "strengths": ["strength1", "strength2"],
    "motivations": "extracted_motivations",
    "values": ["value1", "value2"],
    "career_focus": ["focus1", "focus2"],
    "dei_interests": "extracted_interests",
    "mentor_preferences": "extracted_preferences",
    "professional_summary": "extracted_summary"
  }
}
---STRUCTURED_SUMMARY_END---
```

2. **Frontend Parsing:**
```typescript
const extractUserDataFromMessages = (transcription: any[]) => {
  const lastAgentMessage = transcription
    .filter(msg => msg.speaker === "Agent")
    .pop();
    
  if (lastAgentMessage?.text) {
    const summaryMatch = lastAgentMessage.text.match(
      /---STRUCTURED_SUMMARY_START---(.*?)---STRUCTURED_SUMMARY_END---/s
    );
    
    if (summaryMatch) {
      try {
        return JSON.parse(summaryMatch[1].trim());
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }
  return null;
};
```

---

### Approach 3: Conversation ID + ElevenLabs API (GOOD) ⭐⭐⭐

**How it Works:**
- Use the conversation ID from ElevenLabs
- Query ElevenLabs API for conversation transcript
- Use AI to extract structured data from transcript

**Implementation:**

1. **Get Conversation ID:**
```typescript
const conversation = useConversation({
  onConnect: (conversationId) => {
    setCurrentConversationId(conversationId);
  },
  onDisconnect: () => {
    if (currentConversationId) {
      extractDataFromConversation(currentConversationId);
    }
  }
});
```

2. **Extract Data from Transcript:**
```typescript
const extractDataFromConversation = async (conversationId: string) => {
  try {
    // Get transcript from ElevenLabs API
    const transcript = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!
      }
    });
    
    // Send transcript to your AI extraction service
    const userData = await fetch('https://madhan137.app.n8n.cloud/webhook/extract-user-data', {
      method: 'POST',
      body: JSON.stringify({ transcript: transcript.data })
    });
    
    setUserData(userData);
  } catch (error) {
    console.error('Failed to extract data:', error);
  }
};
```

---

### Approach 4: Message Pattern Recognition (SIMPLE) ⭐⭐⭐

**How it Works:**
- Train agent to use specific patterns when collecting data
- Parse messages in real-time for these patterns
- Build user profile incrementally

**Implementation:**

1. **Agent Prompt Pattern:**
```
When collecting user information, use these exact patterns:
- "USER_NAME: [name]"
- "USER_EMAIL: [email]"
- "USER_PHONE: [phone]"
- "SHORT_TERM_GOAL: [goal]"
- "LONG_TERM_GOAL: [goal]"
- "USER_BACKGROUND: [background]"
- "USER_STRENGTH: [strength]"
- "USER_VALUE: [value]"
- "CAREER_FOCUS: [focus]"
```

2. **Real-time Parsing:**
```typescript
const parseUserInfo = (message: string) => {
  const patterns = {
    name: /USER_NAME:\s*(.+)/i,
    email: /USER_EMAIL:\s*(.+)/i,
    phone: /USER_PHONE:\s*(.+)/i,
    // ... more patterns
  };
  
  const extracted: Partial<UserData> = {};
  
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = message.match(pattern);
    if (match) {
      extracted[key] = match[1].trim();
    }
  });
  
  return extracted;
};
```

---

## 🎯 Recommended Implementation Plan

### Phase 1: Implement Approach 2 (Agent-Generated Summary)
**Why:** Quick to implement, doesn't require complex ElevenLabs configurations

**Steps:**
1. Update agent prompt to include structured summary requirement
2. Modify `onDisconnect` handler to parse final agent message
3. Extract JSON data from structured summary
4. Test with existing agent

### Phase 2: Upgrade to Approach 1 (Function Calling)
**Why:** Most robust and professional approach

**Steps:**
1. Configure ElevenLabs agent with function calling
2. Create webhook endpoint for function calls
3. Update frontend to handle function-based data
4. Comprehensive testing

### Phase 3: Add Fallback (Approach 4)
**Why:** Backup method if structured approaches fail

**Steps:**
1. Add pattern recognition as fallback
2. Implement incremental data building
3. Create data validation and completion checks

---

## 🔧 Implementation Code for Approach 2 (Recommended Start)

Let me update your current VoiceComponent to implement the agent-generated summary approach:

```typescript
// Add this function to extract data from agent messages
const extractUserDataFromTranscript = (transcription: any[]): UserData | null => {
  // Look for structured summary in the last few agent messages
  const agentMessages = transcription
    .filter(msg => msg.speaker === "Agent")
    .slice(-3); // Check last 3 agent messages
    
  for (const message of agentMessages.reverse()) {
    const summaryMatch = message.text.match(
      /---STRUCTURED_SUMMARY_START---(.*?)---STRUCTURED_SUMMARY_END---/s
    );
    
    if (summaryMatch) {
      try {
        const parsed = JSON.parse(summaryMatch[1].trim());
        return parsed.user_profile;
      } catch (e) {
        console.error("Failed to parse structured summary:", e);
      }
    }
  }
  
  return null;
};

// Update onDisconnect handler
onDisconnect: () => {
  console.log("Disconnected from ElevenLabs");
  setConversationEnded(true);
  
  // Try to extract user data from conversation transcript
  const extractedData = extractUserDataFromTranscript(transcription);
  if (extractedData) {
    console.log("Extracted user data from conversation:", extractedData);
    setUserData(extractedData);
  } else {
    console.log("No structured data found, falling back to webhook");
    // Fallback to session-based approach if needed
  }
}
```

## 🎯 Benefits of Agent-Based Extraction

1. **Intelligence**: Agent understands context and can extract nuanced information
2. **Reliability**: No external session management dependencies
3. **Scalability**: Works with ElevenLabs' infrastructure
4. **Accuracy**: AI-powered extraction is more accurate than pattern matching
5. **Simplicity**: Eliminates complex session tracking
6. **Real-time**: Can extract data as conversation progresses

## 🚀 Next Steps

1. **Choose Approach 2** for immediate implementation
2. **Update agent prompt** with structured summary requirements
3. **Test extraction** with sample conversations
4. **Plan upgrade** to function calling (Approach 1)
5. **Monitor accuracy** and refine extraction logic

This approach leverages the AI agent's intelligence instead of fighting it with external session management!
