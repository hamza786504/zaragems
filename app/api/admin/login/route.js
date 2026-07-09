import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { stringifySetCookie } from 'cookie';
import { findByCredentials } from '@/lib/adminAuth';

// JWT secret key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function POST(request) {
  try {
    const { emailOrUsername, password } = await request.json();

    // Validation
    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    try {
      // Find admin using credentials helper
      const admin = await findByCredentials(emailOrUsername, password);

      if (!admin) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: admin._id,
          email: admin.email,
          username: admin.username,
          role: admin.role,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie with admin session
      const cookie = stringifySetCookie({
        name: 'admin_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      // Return success response with admin data
      const adminResponse = {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        status: admin.status,
        lastLogin: admin.lastLogin,
        token: token,
      };

      return new NextResponse(
        JSON.stringify({
          success: true,
          message: 'Login successful',
          admin: adminResponse,
        }),
        {
          status: 200,
          headers: {
            'Set-Cookie': cookie,
            'Content-Type': 'application/json',
          },
        }
      );

    } catch (error) {
      // Handle specific errors from findByCredentials
      if (error.message.includes('locked')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 423 }
        );
      }

      if (error.message.includes('Invalid credentials')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 401 }
        );
      }

      throw error; // Re-throw other errors
    }

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
