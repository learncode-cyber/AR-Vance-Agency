import { NextRequest, NextResponse } from 'next/server';

// Mock database - in production use actual database
const mockPosts: any[] = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      posts: mockPosts,
      count: mockPosts.length 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const post = {
      id: String(Date.now()),
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    mockPosts.push(post);
    
    return NextResponse.json({ 
      success: true, 
      post 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
