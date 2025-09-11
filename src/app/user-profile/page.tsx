"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  ArrowLeft,
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
  created_at: string;
  updated_at: string;
  status: string;
  source: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: UserData;
}

export default function UserProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://madhan137.app.n8n.cloud/webhook/webhook/get-latest-user"
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

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
          setError(responseData.message || "Failed to retrieve user data");
        }
      } else if (data.success) {
        // Handle direct object response format
        console.log("Direct object - User data:", data.data);
        setUserData(data.data);
      } else {
        setError(data.message || "Failed to retrieve user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);

      if (error instanceof SyntaxError) {
        setError("Invalid response format from server");
      } else if (error instanceof TypeError) {
        setError("Network error - please check your connection");
      } else {
        setError(
          error instanceof Error ? error.message : "Failed to fetch user data"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Loading User Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Fetching the latest user data...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          </div>

          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
              <CardContent className="text-center py-8">
                <Database className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Failed to Load Data
                </h2>
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchUserData} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (!userData) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          </div>

          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No User Data Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Complete a voice conversation first to see user data here.
                </p>
                <Button onClick={() => router.push("/")} className="w-full">
                  Start a Conversation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Background Elements */}
      <div className="absolute -z-10 top-20 left-10 w-[400px] h-[400px] rounded-full bg-blue-200/20 dark:bg-blue-700/20 blur-[100px] animate-pulse" />
      <div className="absolute -z-10 bottom-20 right-10 w-[300px] h-[300px] rounded-full bg-purple-300/20 dark:bg-purple-600/20 blur-[80px] animate-pulse delay-1000" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                User Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Collected data from voice conversation
              </p>
            </div>
          </div>
          <Button onClick={fetchUserData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* User Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {userData.name}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userData.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {userData.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Source: {userData.source}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created:{" "}
                    {new Date(userData.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Updated:{" "}
                    {new Date(userData.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {userData.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {userData.phone}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goals & Aspirations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Short-term Goals
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      {userData.short_term_goals}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Long-term Goals
                  </h3>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      {userData.long_term_goals}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background & Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Background & Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Background
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    {userData.background}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Professional Summary
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    {userData.professional_summary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths, Values, and Motivations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userData.strengths.map((strength, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userData.values.map((value, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Career Focus and Motivations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Career Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userData.career_focus.map((focus, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {focus}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Motivations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    {userData.motivations}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mentoring Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mentoring & DEI Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Mentor Preferences
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      {userData.mentor_preferences}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    DEI Interests
                  </h3>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      {userData.dei_interests}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
