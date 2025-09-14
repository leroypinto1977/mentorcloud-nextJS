import { NextRequest, NextResponse } from 'next/server';

// This API route can intercept Maya's user-details tool calls
export async function POST(request: NextRequest) {
  try {
    console.log('📨 Received user-details tool call');
    
    const body = await request.json();
    console.log('🎯 Tool call body:', JSON.stringify(body, null, 2));
    
    // Extract user data from the tool call
    const userData = body.body || body;
    
    // Store in temporary storage (you can modify this to save to your database)
    const globalAny = global as any;
    globalAny.tempUserData = userData;
    
    console.log('💾 Stored user data:', userData);
    
    // Also forward to your n8n webhook if needed
    try {
      const n8nResponse = await fetch('https://madhan137.app.n8n.cloud/webhook/webhook/user-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      console.log('🔗 Forwarded to n8n:', n8nResponse.status);
    } catch (n8nError) {
      console.error('❌ Failed to forward to n8n:', n8nError);
    }
    
    // Return success response to ElevenLabs
    return NextResponse.json({
      success: true,
      message: 'User data received successfully',
      data: userData
    });
    
  } catch (error) {
    console.error('❌ Error processing user-details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process user data' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve stored user data
export async function GET(request: NextRequest) {
  try {
    const userData = (global as any).tempUserData;
    
    if (userData) {
      console.log('📤 Returning stored user data:', userData);
      return NextResponse.json({
        success: true,
        data: userData
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No user data found'
      });
    }
  } catch (error) {
    console.error('❌ Error retrieving user data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve user data' },
      { status: 500 }
    );
  }
}
