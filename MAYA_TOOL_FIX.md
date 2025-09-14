# Maya Tool Configuration Fix

## 🎯 Problem Identified

Maya is successfully calling the `user-details` tool and capturing user information, but the tool call is going directly to your n8n webhook (`https://madhan137.app.n8n.cloud/webhook/webhook/user-details`) instead of being intercepted by the frontend.

## ✅ Solution Implemented

I've created multiple extraction methods and an API route to capture the data:

### 1. **Local API Endpoint Created**
- **URL**: `/api/user-details` (http://localhost:3004/api/user-details)
- **Purpose**: Intercept Maya's tool calls and store data locally
- **Forwards to n8n**: Also forwards data to your existing n8n webhook

### 2. **Enhanced Data Extraction**
- **Method 1**: Real-time tool call detection (during conversation)
- **Method 2**: Local API fetch (after conversation ends)
- **Method 3**: Enhanced transcript parsing (with basic info extraction)
- **Method 4**: Session-based n8n fetch (fallback)
- **Method 5**: Latest user n8n fetch (ultimate fallback)

### 3. **Comprehensive Logging**
- All extraction attempts are logged with emojis for easy debugging
- Check browser console for detailed extraction process

## 🔧 Maya Configuration Options

### Option A: Update Maya's Tool URL (Recommended)
Update Maya's `user-details` tool configuration in ElevenLabs to point to your local API:

**Change from:**
```
https://madhan137.app.n8n.cloud/webhook/webhook/user-details
```

**Change to:**
```
http://localhost:3004/api/user-details
```

Or for production:
```
https://yourdomain.com/api/user-details
```

### Option B: Dual Tool Configuration
Configure Maya with two tools:
1. `user-details-local` → Points to `/api/user-details`
2. `user-details-n8n` → Points to your n8n webhook

Update Maya's prompt to call both tools.

### Option C: Keep Current Setup (Testing)
The current implementation should work as fallback by fetching from n8n, but let's test the extraction first.

## 🧪 Testing Steps

### Step 1: Test Current Implementation
1. Open browser console (F12)
2. Start a conversation with Maya
3. Complete the onboarding process
4. Watch for these log messages:

```
🔌 Disconnected from ElevenLabs
🔍 Starting data extraction process...
🌐 Attempting to fetch from local API...
🔍 Extracting user data from transcript...
🔄 Falling back to session-based fetch...
🔄 Trying to fetch latest user from n8n...
```

### Step 2: Debug Tool Calls
During the conversation, watch for:
```
📨 Received message: ...
🛠️ Tool call detected: ...
✅ Extracted user data from tool call: ...
```

### Step 3: Check API Route
Test the API route directly:
```bash
# Check if user data was stored
curl http://localhost:3004/api/user-details
```

## 🚀 Expected Behavior After Fix

1. **During Conversation**: Maya calls `user-details` tool
2. **Tool Call Intercepted**: Local API route captures and stores data
3. **Data Forwarded**: Data sent to n8n webhook for persistence
4. **Immediate Display**: User data appears in UI instantly
5. **Fallback Protection**: Multiple backup methods ensure data is never lost

## 🔍 Current Status

The app now has enhanced debugging and multiple fallback methods. Try a conversation and check the browser console to see which extraction method works. The most likely fix will be updating Maya's tool URL to point to the local API endpoint.

## 📋 Next Steps

1. **Test Current Setup**: Try a conversation and check console logs
2. **Update Maya's Tool URL**: Point to local API if tool calls aren't being intercepted
3. **Monitor Extraction**: Watch for successful data extraction logs
4. **Verify Display**: Ensure user data appears in the UI

The system is now much more robust and should successfully capture Maya's user data!
