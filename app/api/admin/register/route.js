import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import { hashPassword } from '@/lib/adminAuth';

export async function POST(request) {
  try {
    const { username, email, password, fullName } = await request.json();

    // Validation
    if (!username || !email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const usernameLower = username.toLowerCase();
    const emailLower = email.toLowerCase();

    // Check if admin already exists
    const existingAdmin = await client.fetch(
      `*[_type == "admin" && (email == $email || username == $username)][0]{_id}`,
      { email: emailLower, username: usernameLower }
    );

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin with this email or username already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create new admin
    const newAdmin = await client.create({
      _type: 'admin',
      username: usernameLower,
      email: emailLower,
      password: hashedPassword,
      fullName,
      role: 'admin',
      status: 'active',
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: null,
    });

    // Return admin without password
    const adminResponse = {
      id: newAdmin._id,
      username: newAdmin.username,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      role: newAdmin.role,
      status: newAdmin.status,
      createdAt: newAdmin._createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Admin registered successfully',
        admin: adminResponse,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
