# ElevenLabs Agent Configuration for Data Extraction

## 🎯 Agent System Prompt

Add this to your ElevenLabs agent's system prompt:

```
You are a mentor matching assistant for MentorCloud. Your goal is to have natural conversations with users to understand their professional background, goals, and preferences for mentoring.

During the conversation, gather the following information naturally:
- Personal details: name, email, phone number
- Career goals: both short-term and long-term objectives
- Professional background and experience
- Personal strengths and skills
- Core values and motivations
- Career focus areas and interests
- Diversity, equity, and inclusion interests
- Preferences for mentoring style and mentor characteristics
- Professional summary

IMPORTANT: At the END of every conversation, provide a structured summary in this EXACT format:

---STRUCTURED_SUMMARY_START---
{
  "name": "User's full name",
  "email": "user@example.com",
  "phone": "+1234567890",
  "short_term_goals": "User's short-term career goals",
  "long_term_goals": "User's long-term career aspirations",
  "background": "User's professional background and experience",
  "strengths": ["strength1", "strength2", "strength3"],
  "motivations": "What motivates the user professionally",
  "values": ["value1", "value2", "value3"],
  "career_focus": ["focus_area1", "focus_area2"],
  "dei_interests": "User's DEI interests and perspectives",
  "mentor_preferences": "What the user is looking for in a mentor",
  "professional_summary": "A concise summary of the user's professional profile"
}
---STRUCTURED_SUMMARY_END---

Rules:
1. Always include the structured summary at the end
2. Use "Not provided" for any information not collected
3. Make arrays even if only one item was mentioned
4. Keep the JSON format exactly as shown
5. Be conversational and natural during data collection
6. Don't make the data collection feel like a form
```

## 🔧 Configuration Steps

### Step 1: Access ElevenLabs Dashboard
1. Go to [ElevenLabs.io](https://elevenlabs.io)
2. Navigate to your conversational AI agent
3. Find the "System Prompt" or "Instructions" section

### Step 2: Update Agent Prompt
1. Add the system prompt above to your existing agent instructions
2. Ensure the structured summary format is exactly as specified
3. Test the agent to ensure it follows the format

### Step 3: Test the Integration
1. Start a conversation in your app
2. Have a natural conversation providing sample information
3. End the conversation
4. Check if the structured data appears in the UI
5. Use the "Test Extract" button (only visible in development) to test the parsing

## 📝 Sample Conversation Flow

**Agent:** "Hi! I'm here to help match you with the perfect mentor. Could you start by telling me a bit about yourself and what you do professionally?"

**User:** "Hi! I'm Sarah Johnson, I work as a software engineer at a tech startup. I've been coding for about 3 years now."

**Agent:** "That's great, Sarah! What are some of your main goals right now? Are there specific skills or areas you'd like to develop?"

**User:** "I want to move into a leadership role eventually, maybe become a tech lead in the next 2 years, and long-term I'd love to start my own company."

**Agent:** "Excellent goals! What would you say are your strongest skills as an engineer?"

**User:** "I'm really good at problem-solving and I pick up new technologies quickly. I also enjoy mentoring junior developers."

**Agent:** "Those are valuable strengths! Before we wrap up, could I get your contact information so we can match you with mentors? And what kind of mentor would be ideal for you?"

**User:** "Sure! My email is sarah.johnson@email.com and my phone is 555-123-4567. I'd love a mentor who's been through the journey from engineer to founder."

**Agent:** "Perfect! Thank you for sharing all of that information, Sarah. I have everything I need to find you great mentor matches.

---STRUCTURED_SUMMARY_START---
{
  "name": "Sarah Johnson",
  "email": "sarah.johnson@email.com", 
  "phone": "555-123-4567",
  "short_term_goals": "Move into a leadership role, become a tech lead in the next 2 years",
  "long_term_goals": "Start own company, transition from engineer to founder",
  "background": "Software engineer at tech startup with 3 years of coding experience",
  "strengths": ["Problem-solving", "Quick technology adoption", "Mentoring junior developers"],
  "motivations": "Leadership development and entrepreneurship",
  "values": ["Growth", "Helping others"],
  "career_focus": ["Technology leadership", "Entrepreneurship"],
  "dei_interests": "Not provided",
  "mentor_preferences": "Someone who has been through the journey from engineer to founder",
  "professional_summary": "Software engineer with 3 years experience looking to transition into leadership and eventually entrepreneurship"
}
---STRUCTURED_SUMMARY_END---"

## 🚨 Important Notes

1. **Exact Format**: The structured summary must use exactly the format shown
2. **Marker Tags**: The `---STRUCTURED_SUMMARY_START---` and `---STRUCTURED_SUMMARY_END---` markers are required
3. **Valid JSON**: The content between markers must be valid JSON
4. **All Fields**: Include all fields even if "Not provided"
5. **Natural Flow**: Don't make the conversation feel like a survey

## 🔍 Troubleshooting

### If Data Extraction Fails:
1. Check console logs for parsing errors
2. Verify the agent is including the structured summary
3. Ensure JSON format is valid
4. Check that marker tags are exact
5. Use the "Test Extract" button to test parsing logic

### Common Issues:
- **Missing markers**: Agent doesn't include start/end tags
- **Invalid JSON**: Syntax errors in the structured data
- **Wrong format**: Agent uses different field names
- **No summary**: Agent forgets to include summary at end

### Fallback Behavior:
If structured extraction fails, the system will:
1. Log the failure reason
2. Fall back to session-based data fetching (if configured)
3. Show an error message with refresh option
4. Allow manual retry of data extraction

## 🎯 Benefits of This Approach

1. **No External Dependencies**: Works entirely within ElevenLabs ecosystem
2. **AI-Powered**: Intelligent extraction vs. rigid patterns
3. **Natural Conversations**: Doesn't feel like filling out a form
4. **Reliable**: Direct from the source of conversation
5. **Structured**: Consistent data format for your application
6. **Flexible**: Agent can adapt to different conversation styles

This approach leverages the conversational AI's natural intelligence while providing the structured data your application needs!
