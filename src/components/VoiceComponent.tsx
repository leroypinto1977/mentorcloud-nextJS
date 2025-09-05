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
} from "lucide-react";

const VoiceChat = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [transcription, setTranscription] = useState<
    Array<{ speaker: string; text: string; timestamp: Date }>
  >([]);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      // Clear transcription when starting new conversation
      setTranscription([]);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
    },
    onMessage: (message) => {
      console.log("Received message:", message);

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
      // Clear previous transcription
      setTranscription([]);

      // Replace with your actual agent ID or URL
      const conversationId = await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
      });
      console.log("Started conversation:", conversationId);
    } catch (error) {
      setErrorMessage("Failed to start conversation");
      console.error("Error starting conversation:", error);
    }
  };

  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      setErrorMessage("Failed to end conversation");
      console.error("Error ending conversation:", error);
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="h-[600px] max-h-[80vh] flex flex-col">
        <CardHeader className="border-b bg-gray-50 dark:bg-gray-900">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="text-xl">Voice Chat Assistant</span>
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/30 max-h-[400px]">
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
          <div className="border-t bg-white dark:bg-gray-900 p-6">
            <div className="flex flex-col gap-4">
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
                <div className="flex items-center gap-4">
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
                </div>

                <div className="text-right">
                  {status === "connected" && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
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
                    </p>
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
    </div>
  );
};

export default VoiceChat;
