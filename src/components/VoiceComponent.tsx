"use client";

import React, { useEffect, useState } from "react";

// ElevenLabs
import { useConversation } from "@11labs/react";

// UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  MessageCircle,
  User,
  Bot,
  Database,
  Loader2,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
  Target,
  Heart,
  Briefcase,
  Users,
  Star,
  Send,
  Type,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  short_term_goals: string;
  long_term_goals: string;
  background: string;
  strengths: string[];
  motivations: string;
  values: string[];
  career_focus: string[];
  dei_interests: string;
  mentor_preferences: string;
  professional_summary: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  source?: string;
}

const VoiceChat = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [transcription, setTranscription] = useState<
    Array<{ speaker: string; text: string; timestamp: Date }>
  >([]);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [isSendingText, setIsSendingText] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Extract user data from agent's structured summary
  const extractUserDataFromTranscript = (transcription: Array<{ speaker: string; text: string; timestamp: Date }>): UserData | null => {
    console.log("🔍 Extracting user data from transcript...");
    console.log("📝 Total messages in transcript:", transcription.length);
    
    // Look for structured summary in the last few agent messages
    const agentMessages = transcription
      .filter(msg => msg.speaker === "Agent")
      .slice(-10); // Check last 10 agent messages for more coverage
    
    console.log("🤖 Agent messages to search:", agentMessages.length);
      
    for (const message of agentMessages.reverse()) {
      console.log("🔎 Checking agent message:", message.text.substring(0, 100) + "...");
      
      // Look for structured summary pattern
      const summaryMatch = message.text.match(
        /---STRUCTURED_SUMMARY_START---([\s\S]*?)---STRUCTURED_SUMMARY_END---/
      );
      
      if (summaryMatch) {
        try {
          console.log("📋 Found structured summary:", summaryMatch[1].trim());
          const parsed = JSON.parse(summaryMatch[1].trim());
          
          // Handle different possible structures
          if (parsed.user_profile) {
            return parsed.user_profile;
          } else if (parsed.name || parsed.email) {
            // Direct structure
            return parsed;
          }
        } catch (e) {
          console.error("❌ Failed to parse structured summary:", e);
        }
      }
      
      // Alternative: Look for JSON-like data in agent messages
      const jsonMatch = message.text.match(/\{[\s\S]*"name"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          console.log("📋 Found JSON data in message:", jsonMatch[0]);
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.name || parsed.email) {
            return parsed;
          }
        } catch (e) {
          console.error("❌ Failed to parse JSON from message:", e);
        }
      }
      
      // Try to extract data from conversation context if Maya mentions completion
      if (message.text.toLowerCase().includes("captured") && 
          message.text.toLowerCase().includes("information")) {
        console.log("🎯 Detected completion message, attempting to extract from conversation history");
        
        // Look through all messages for user information
        const userInfo: Partial<UserData> = {};
        const allMessages = transcription.map(t => t.text).join(' ');
        
        // Extract name patterns
        const nameMatch = allMessages.match(/(?:name is|I'm|call me)\s+([A-Za-z\s]+)/i);
        if (nameMatch) userInfo.name = nameMatch[1].trim();
        
        // Extract email patterns
        const emailMatch = allMessages.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) userInfo.email = emailMatch[1];
        
        // Extract phone patterns
        const phoneMatch = allMessages.match(/(\+?[\d\s\-\(\)]{10,})/);
        if (phoneMatch) userInfo.phone = phoneMatch[1];
        
        // If we found at least name or email, return what we have
        if (userInfo.name || userInfo.email) {
          console.log("📋 Extracted basic user info from conversation:", userInfo);
          return {
            id: "extracted-" + Date.now(),
            name: userInfo.name || "Not provided",
            email: userInfo.email || "Not provided", 
            phone: userInfo.phone || "Not provided",
            short_term_goals: "Not provided",
            long_term_goals: "Not provided",
            background: "Not provided",
            strengths: [],
            motivations: "Not provided",
            values: [],
            career_focus: [],
            dei_interests: "Not provided",
            mentor_preferences: "Not provided",
            professional_summary: "Not provided"
          } as UserData;
        }
      }
    }
    
    console.log("❌ No structured data found in transcript");
    return null;
  };

  // Test function to simulate Maya agent providing structured data via tool call
  const testStructuredExtraction = () => {
    // Test 1: Simulate tool call format
    const testToolCall = {
      type: "tool_call",
      tool_call: {
        name: "user-details",
        parameters: {
          body: {
            name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
            phone: "555-123-4567",
            short_term_goals: "Move into a leadership role, become a tech lead in the next 2 years",
            long_term_goals: "Start own company, transition from engineer to founder",
            background: "Software engineer at tech startup with 3 years of coding experience",
            strengths: ["Problem-solving", "Quick technology adoption", "Mentoring junior developers"],
            motivations: "Leadership development and entrepreneurship",
            values: ["Growth", "Helping others", "Innovation"],
            career_focus: ["Technology leadership", "Entrepreneurship"],
            dei_interests: "Promoting diversity in tech",
            mentor_preferences: "Someone who has been through the journey from engineer to founder",
            professional_summary: "Sarah is a software engineering professional with experience in technology development. She is recognized for problem-solving and quick technology adoption. Guided by values such as growth and innovation, Sarah is motivated by leadership development and entrepreneurship. Her near-term goals include moving into leadership roles, with aspirations to grow in entrepreneurship."
          }
        }
      }
    };

    // Simulate the onMessage handler receiving this tool call
    const messageAny = testToolCall as any;
    if (messageAny.tool_call && messageAny.tool_call.name === "user-details") {
      const userData = messageAny.tool_call.parameters.body;
      console.log("Test: Extracted user data from tool call:", userData);
      setUserData(userData);
      setConversationEnded(true);
      setIsLoadingData(false);
    }
  };

  // Generate a unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Register session with n8n
  const registerSession = async (sessionId: string) => {
    try {
      const response = await fetch(
        "https://madhan137.app.n8n.cloud/webhook/webhook/register-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionId,
            timestamp: new Date().toISOString(),
            status: "started",
          }),
        }
      );
      
      if (response.ok) {
        console.log("Session registered successfully:", sessionId);
      } else {
        console.warn("Failed to register session:", response.statusText);
      }
    } catch (error) {
      console.error("Error registering session:", error);
    }
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      // Clear transcription when starting new conversation
      setTranscription([]);
      setConversationEnded(false);
      setUserData(null);
      setDataError("");
      setTextMessage("");
    },
    onDisconnect: () => {
      console.log("🔌 Disconnected from ElevenLabs");
      // Mark conversation as ended
      setConversationEnded(true);
      
      // Check if user data was already extracted via tool call during conversation
      if (userData) {
        console.log("✅ User data already extracted via tool call");
        setIsLoadingData(false);
        return;
      }
      
      console.log("🔍 Starting data extraction process...");
      setIsLoadingData(true);
      
      // Try multiple extraction methods in sequence
      setTimeout(async () => {
        // Method 1: Try to fetch from our API endpoint (Maya's tool call might have stored data here)
        try {
          console.log("🌐 Attempting to fetch from local API...");
          const localApiResponse = await fetch('/api/user-details');
          if (localApiResponse.ok) {
            const apiData = await localApiResponse.json();
            if (apiData.success && apiData.data) {
              console.log("✅ Successfully fetched user data from local API:", apiData.data);
              setUserData(apiData.data);
              setIsLoadingData(false);
              return;
            }
          }
        } catch (apiError) {
          console.log("⚠️ Local API fetch failed:", apiError);
        }
      
        // Method 2: Try to extract user data from conversation transcript
        const extractedData = extractUserDataFromTranscript(transcription);
        if (extractedData) {
          console.log("✅ Successfully extracted user data from conversation transcript:", extractedData);
          setUserData(extractedData);
          setIsLoadingData(false);
          return;
        }
        
        // Method 3: Try session-based fetch from n8n
        if (sessionId) {
          console.log("🔄 Falling back to session-based fetch...");
          try {
            await fetchUserData(sessionId);
            return;
          } catch (sessionError) {
            console.log("⚠️ Session-based fetch failed:", sessionError);
          }
        }
        
        // Method 4: Try to fetch latest user from n8n (ultimate fallback)
        try {
          console.log("🔄 Trying to fetch latest user from n8n...");
          const response = await fetch('https://madhan137.app.n8n.cloud/webhook/webhook/get-latest-user');
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0 && data[0].success) {
              console.log("✅ Successfully fetched latest user data:", data[0].data);
              setUserData(data[0].data);
              setIsLoadingData(false);
              return;
            }
          }
        } catch (latestUserError) {
          console.log("⚠️ Latest user fetch failed:", latestUserError);
        }
        
        // If all methods fail
        console.log("❌ All data extraction methods failed");
        setIsLoadingData(false);
        setDataError("No user data found in conversation. Maya may not have completed the data collection process.");
      }, 2000); // Wait 2 seconds to ensure any pending tool calls complete
    },
    onMessage: (message) => {
      console.log("📨 Received message:", message);
      console.log("📨 Message type:", typeof message);
      console.log("📨 Message keys:", Object.keys(message));

      // Handle transcript messages from ElevenLabs
      if (message.message && message.source) {
        const speaker = message.source === "user" ? "You" : "Agent";
        setTranscription((prev) => [
          ...prev,
          {
            speaker: speaker,
            text: message.message,
            timestamp: new Date(),
          },
        ]);
        
        // Enhanced logging for agent messages
        if (speaker === "Agent") {
          console.log("🤖 Agent message:", message.message);
          
          // Check if this message contains user data information
          if (message.message.toLowerCase().includes("captured") || 
              message.message.toLowerCase().includes("information") ||
              message.message.toLowerCase().includes("perfect")) {
            console.log("🎯 Potential completion message detected");
          }
        }
      }

      // Handle tool calls from the agent (with proper type checking)
      const messageAny = message as any;
      
      // Log all properties of the message to understand its structure
      console.log("🔍 Full message structure:", JSON.stringify(messageAny, null, 2));
      
      if (messageAny.type === "tool_call" || messageAny.tool_call) {
        console.log("🛠️ Tool call detected:", messageAny);
        const toolCall = messageAny.tool_call || messageAny;
        
        // Check if this is the user-details tool call
        if (toolCall.name === "user-details" || toolCall.function?.name === "user-details") {
          const userData = toolCall.parameters?.body || toolCall.function?.arguments?.body;
          if (userData) {
            console.log("✅ Extracted user data from tool call:", userData);
            setUserData(userData);
            setConversationEnded(true);
            setIsLoadingData(false);
          }
        }
      }

      // Handle function calls (alternative format)
      if (messageAny.function_call) {
        console.log("🔧 Function call detected:", messageAny.function_call);
        if (messageAny.function_call.name === "user-details") {
          try {
            const args = JSON.parse(messageAny.function_call.arguments);
            const userData = args.body || args;
            if (userData) {
              console.log("✅ Extracted user data from function call:", userData);
              setUserData(userData);
              setConversationEnded(true);
              setIsLoadingData(false);
            }
          } catch (e) {
            console.error("❌ Failed to parse function call arguments:", e);
          }
        }
      }

      // Also check if the tool data is embedded in the message text (some ElevenLabs integrations do this)
      if (message.message && message.source !== "user") {
        const toolCallMatch = message.message.match(/user-details.*?(\{[\s\S]*?\})/);
        if (toolCallMatch) {
          try {
            const userData = JSON.parse(toolCallMatch[1]);
            if (userData.name || userData.email) {
              console.log("✅ Extracted user data from message text:", userData);
              setUserData(userData);
              setConversationEnded(true);
              setIsLoadingData(false);
            }
          } catch (e) {
            console.error("❌ Failed to parse tool data from message:", e);
          }
        }
      }
    },
    onError: (error: string | Error) => {
      setErrorMessage(typeof error === "string" ? error : error.message);
      console.error("Error:", error);
    },
  });

  const { status, isSpeaking } = conversation;

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcription]);

  useEffect(() => {
    // Request microphone permission on component mount
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch (error) {
        setErrorMessage("Microphone access denied");
        console.error("Error accessing microphone:", error);
      }
    };

    requestMicPermission();
  }, []);

  const handleStartConversation = async () => {
    try {
      // Generate a new session ID
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      console.log("Generated session ID:", newSessionId);

      // Register the session with n8n
      await registerSession(newSessionId);

      // Clear previous transcription and reset conversation state
      setTranscription([]);
      setConversationEnded(false);
      setUserData(null);
      setDataError("");
      setTextMessage("");

      // Replace with your actual agent ID or URL
      const conversationId = await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
      });
      console.log("Started conversation:", conversationId, "with session ID:", newSessionId);
    } catch (error) {
      setErrorMessage("Failed to start conversation");
      console.error("Error starting conversation:", error);
    }
  };

  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
      // Note: onDisconnect will be called automatically which sets conversationEnded to true and fetches data
    } catch (error) {
      setErrorMessage("Failed to end conversation");
      console.error("Error ending conversation:", error);
    }
  };

  const fetchUserData = async (sessionId: string) => {
    console.log("Fetching user data for session:", sessionId);
    setIsLoadingData(true);
    setDataError("");

    try {
      const response = await fetch(
        `https://madhan137.app.n8n.cloud/webhook/webhook/get-user-data?sessionId=${sessionId}`
      );

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content
      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      // Get response text first to check if it's empty
      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from server");
      }

      // Parse the JSON
      const data = JSON.parse(responseText);
      console.log("Parsed response data:", data);
      console.log("Type of data:", typeof data);
      console.log("Is array:", Array.isArray(data));

      // Handle array response format
      if (Array.isArray(data) && data.length > 0) {
        const responseData = data[0]; // Get first item from array
        console.log("First item from array:", responseData);

        if (responseData.success) {
          console.log("User data:", responseData.data);
          setUserData(responseData.data);
        } else {
          setDataError(responseData.message || "Failed to retrieve user data");
        }
      } else if (data.success) {
        // Handle direct object response format
        console.log("Direct object - User data:", data.data);
        setUserData(data.data);
      } else {
        setDataError(data.message || "Failed to retrieve user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);

      if (error instanceof SyntaxError) {
        setDataError("Invalid response format from server");
      } else if (error instanceof TypeError) {
        setDataError("Network error - please check your connection");
      } else {
        setDataError(
          error instanceof Error ? error.message : "Failed to fetch user data"
        );
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
    } catch (error) {
      setErrorMessage("Failed to change volume");
      console.error("Error changing volume:", error);
    }
  };

  const handleSendTextMessage = async () => {
    if (!textMessage.trim() || status !== "connected" || isSendingText) return;

    setIsSendingText(true);
    try {
      // Add user message to transcription immediately
      setTranscription((prev) => [
        ...prev,
        {
          speaker: "You",
          text: textMessage.trim(),
          timestamp: new Date(),
        },
      ]);

      // Send text message to ElevenLabs conversation
      // Note: ElevenLabs conversation may not support direct text input
      // This will add the message to the transcript for now
      console.log("Text message sent:", textMessage.trim());

      // Clear the input
      setTextMessage("");
    } catch (error) {
      setErrorMessage("Failed to send text message");
      console.error("Error sending text message:", error);
    } finally {
      setIsSendingText(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendTextMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="h-[700px] max-h-[85vh] flex flex-col">
        <CardHeader className="border-b bg-gray-50 dark:bg-gray-900">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="text-xl">Voice Chat Assistant</span>
              {sessionId && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                  Session: {sessionId.split('_')[1]}
                </span>
              )}
              {status === "connected" && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Live
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                disabled={status !== "connected"}
                className="h-9 w-9"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/30 max-h-[575px]">
            {transcription.length > 0 ? (
              transcription.map((entry, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    entry.speaker === "You" ? "justify-end" : "justify-start"
                  }`}
                >
                  {entry.speaker === "Agent" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-800 dark:bg-gray-200 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white dark:text-gray-800" />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                      entry.speaker === "You"
                        ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-br-md"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {entry.speaker === "You" ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium opacity-80">
                        {entry.speaker}
                      </span>
                      <span className="text-xs opacity-60">
                        {entry.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{entry.text}</p>
                  </div>

                  {entry.speaker === "You" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-600 dark:bg-gray-400 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white dark:text-gray-800" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {status === "connected"
                    ? "Start speaking to begin the conversation"
                    : "Ready to start your voice chat"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  {status === "connected"
                    ? "Your voice will be transcribed in real-time and the AI will respond naturally."
                    : "Click the button below to start a conversation with the AI assistant."}
                </p>
              </div>
            )}
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Control Panel */}
          <div className="border-t bg-white dark:bg-gray-900 px-6 pb-0 pt-6">
            <div className="flex flex-col gap-2">
              {/* Text Input Section */}
              {status === "connected" && (
                <div className="mb-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={isSendingText}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <Button
                      onClick={handleSendTextMessage}
                      disabled={!textMessage.trim() || isSendingText}
                      size="sm"
                      className="px-3"
                    >
                      {isSendingText ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Main Action Button */}
              <div className="flex justify-center">
                {status === "connected" ? (
                  <Button
                    variant="destructive"
                    onClick={handleEndConversation}
                    className="w-full max-w-xs h-12 text-base font-medium"
                  >
                    <MicOff className="mr-2 h-5 w-5" />
                    End Conversation
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartConversation}
                    disabled={!hasPermission}
                    className="w-full max-w-xs h-12 text-base font-medium bg-gray-800 hover:bg-gray-900 dark:bg-gray-200 dark:hover:bg-gray-100 text-white dark:text-gray-800"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Conversation
                  </Button>
                )}
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {transcription.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTranscription([])}
                      className="text-xs h-8 px-3"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Clear Chat
                    </Button>
                  )}
                  
                  {/* Test button for development */}
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={testStructuredExtraction}
                      className="text-xs h-8 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      <Database className="mr-1 h-3 w-3" />
                      Test Extract
                    </Button>
                  )}
                </div>

                <div className="text-right">
                  {status === "connected" && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {isSpeaking ? (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-pulse"></div>
                          Agent is speaking...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-pulse"></div>
                          Listening...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Error and Permission Messages */}
              <div className="text-center">
                {errorMessage && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">
                    {errorMessage}
                  </p>
                )}
                {!hasPermission && (
                  <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg">
                    Please allow microphone access to use voice chat
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Data Display */}
      {conversationEnded && (
        <Card className="mt-6">
          <CardHeader className="border-b bg-gray-50 dark:bg-gray-900">
            <CardTitle className="flex items-center gap-3">
              <Database className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="text-xl">Collected User Data</span>
              {isLoadingData && (
                <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-400" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading collected data...
                  </p>
                </div>
              </div>
            ) : dataError ? (
              <div className="text-center py-8">
                <p className="text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-lg mb-4">
                  {dataError}
                </p>
                <Button 
                  onClick={() => sessionId && fetchUserData(sessionId)} 
                  variant="outline"
                  disabled={!sessionId}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : userData ? (
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      {userData.name}
                    </h3>
                    {userData.status && (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {userData.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {userData.email}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {userData.phone}
                    </p>
                  </div>
                </div>

                {/* Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Target className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Short-term Goals
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {userData.short_term_goals}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Target className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Long-term Goals
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {userData.long_term_goals}
                    </p>
                  </div>
                </div>

                {/* Background */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Background
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {userData.background}
                  </p>
                </div>

                {/* Strengths and Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Strengths
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userData.strengths.map((strength, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Heart className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Values
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userData.values.map((value, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded text-xs"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Career Focus and Motivations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Briefcase className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Career Focus
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userData.career_focus.map((focus, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Target className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Motivations
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {userData.motivations}
                    </p>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Professional Summary
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {userData.professional_summary}
                  </p>
                </div>

                {/* Mentoring Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Mentor Preferences
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {userData.mentor_preferences}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Heart className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        DEI Interests
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {userData.dei_interests}
                    </p>
                  </div>
                </div>

                {/* Timestamps */}
                {(userData.created_at || userData.updated_at) && (
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t">
                    {userData.created_at && (
                      <span>
                        Created:{" "}
                        {new Date(userData.created_at).toLocaleString()}
                      </span>
                    )}
                    {userData.updated_at && (
                      <span>
                        Updated:{" "}
                        {new Date(userData.updated_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No User Data Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The conversation data might not be available yet. Please try
                  refreshing.
                </p>
                <Button 
                  onClick={() => sessionId && fetchUserData(sessionId)} 
                  variant="outline"
                  disabled={!sessionId}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceChat;
