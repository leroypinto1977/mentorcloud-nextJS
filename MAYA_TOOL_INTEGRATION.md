# Maya Agent Tool Configuration for ElevenLabs

## 🎯 Overview

Your Maya agent is already configured to use tool calling with the `user-details` tool. The frontend has been updated to automatically detect and extract user data when Maya calls this tool during conversations.

## 🔧 Current Maya Tool Configuration

Based on your system prompt, Maya uses this tool call structure:

### Tool Definition for ElevenLabs
```json
{
  "name": "user-details",
  "description": "Store collected user information for MentorCloud onboarding",
  "parameters": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "User's full name"
          },
          "email": {
            "type": "string",
            "description": "User's email address"
          },
          "phone": {
            "type": "string",
            "description": "User's phone number or '(declined)' if not provided"
          },
          "short_term_goals": {
            "type": "string",
            "description": "User's short-term career goals (6-12 months)"
          },
          "long_term_goals": {
            "type": "string",
            "description": "User's long-term career aspirations"
          },
          "background": {
            "type": "string",
            "description": "User's professional background and experience"
          },
          "strengths": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Array of user's strengths and skills"
          },
          "motivations": {
            "type": "string",
            "description": "What motivates the user professionally"
          },
          "values": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Array of user's core values"
          },
          "career_focus": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Array of career development focus areas"
          },
          "dei_interests": {
            "type": "string",
            "description": "User's diversity, equity, and inclusion interests"
          },
          "mentor_preferences": {
            "type": "string",
            "description": "What the user is looking for in a mentor"
          },
          "professional_summary": {
            "type": "string",
            "description": "A synthesized professional summary of the user"
          }
        },
        "required": ["name", "email"]
      }
    },
    "required": ["body"]
  }
}
```

## ✅ Frontend Integration Status

The VoiceComponent has been updated to handle Maya's tool calls in multiple ways:

### 1. **Real-time Tool Call Detection** ⭐ (Primary Method)
- Listens for `user-details` tool calls during conversation
- Automatically extracts data when Maya calls the tool
- Immediately displays user data without waiting for conversation end
- No external API calls needed

### 2. **Message-based Extraction** (Fallback)
- Parses agent messages for embedded tool data
- Handles cases where tool data appears in message text
- Backup method if tool calls aren't directly accessible

### 3. **Transcript Extraction** (Final Fallback)
- Looks for structured summaries in conversation transcript
- Handles legacy structured summary format
- Last resort if tool calls fail

### 4. **Session-based Fetch** (Ultimate Fallback)
- Falls back to n8n webhook if all extraction methods fail
- Maintains compatibility with external data storage

## 🚀 How It Works Now

### Normal Flow:
1. **User starts conversation** → Maya begins onboarding chat
2. **Maya collects information** → Natural conversation flow
3. **Maya calls user-details tool** → Tool call happens automatically
4. **Frontend detects tool call** → Data extracted instantly
5. **User data displayed** → No waiting, no additional API calls

### Tool Call Format Maya Uses:
```json
{
  "name": "user-details",
  "parameters": {
    "body": {
      "name": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "phone": "555-123-4567",
      "short_term_goals": "Move into leadership role",
      "long_term_goals": "Start own company",
      "background": "Software engineer with 3 years experience",
      "strengths": ["Problem-solving", "Quick learning"],
      "motivations": "Leadership development and entrepreneurship",
      "values": ["Growth", "Innovation", "Helping others"],
      "career_focus": ["Technology leadership", "Entrepreneurship"],
      "dei_interests": "Promoting diversity in tech",
      "mentor_preferences": "Someone who has been through engineer to founder journey",
      "professional_summary": "Sarah is a software engineering professional with experience in technology development..."
    }
  }
}
```

## 🧪 Testing Your Setup

### Option 1: Test with Live Agent
1. Start a conversation with your Maya agent
2. Go through the onboarding flow
3. Watch console logs for tool call detection
4. See if user data appears automatically when Maya calls the tool

### Option 2: Use Test Button
1. Click "Test Extract" button (visible in development mode)
2. Simulates Maya calling the user-details tool
3. Verifies that data extraction and display works correctly

### Console Logs to Watch For:
```
✅ "Tool call detected: ..."
✅ "Extracted user data from tool call: ..."
✅ "User data already extracted via tool call"
```

## 🔍 Troubleshooting

### If Tool Calls Aren't Working:

1. **Check ElevenLabs Tool Configuration**
   - Ensure `user-details` tool is properly configured
   - Verify tool parameters match the expected format
   - Test that Maya is actually calling the tool

2. **Check Console Logs**
   - Look for "Tool call detected" messages
   - Check if message format includes tool call data
   - Verify JSON structure matches expected format

3. **Verify Maya's System Prompt**
   - Ensure Maya knows to call the user-details tool
   - Check that the tool call happens at the right time
   - Verify the JSON structure in the tool call

### Common Issues:

1. **Tool Not Called**: Maya isn't calling the user-details tool
   - Solution: Update Maya's prompt to ensure tool calling
   
2. **Wrong Tool Format**: Tool call structure doesn't match expected format
   - Solution: Verify tool configuration in ElevenLabs matches the schema above
   
3. **Data Not Extracted**: Tool call happens but data isn't extracted
   - Solution: Check console logs for parsing errors

## 🎯 Benefits of This Approach

1. **Real-time**: Data appears as soon as Maya collects it
2. **Reliable**: Uses ElevenLabs' native tool calling system
3. **No External Dependencies**: Works entirely within the conversation
4. **Multiple Fallbacks**: Several backup methods if tool calls fail
5. **Better UX**: Users see their data immediately
6. **Simplified Architecture**: No complex session management needed

## 🔧 Next Steps

1. **Test Current Setup**: Try a conversation with Maya to see if tool calls work
2. **Monitor Console**: Check browser console for tool call detection
3. **Verify Data Display**: Ensure user data appears correctly after tool call
4. **Debug if Needed**: Use console logs to troubleshoot any issues

The system is now optimized for Maya's tool-based approach and should automatically detect and display user data when Maya calls the `user-details` tool during conversations!
