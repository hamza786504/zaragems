import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// JWT secret key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Verify the admin token from cookies
 * @param {Request} request - Next.js request object
 * @returns {Object} - { success: true, admin: {...} } or { success: false, error: string, status: number }
 */
export function verifyAdminToken(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return { error: 'No authentication token provided', status: 401 };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach admin info to request (can be used by route handlers)
    return {
      success: true,
      admin: {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
      },
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'Authentication token expired', status: 401 };
    }
    return { error: 'Invalid authentication token', status: 401 };
  }
}

/**
 * Verify the customer token from cookies (storefront account auth).
 * @param {Request} request - Next.js request object
 * @returns {Object} - { success: true, customer: {...} } or { error, status }
 */
export function verifyCustomerToken(request) {
  try {
    const token = request.cookies.get('customer_token')?.value;

    if (!token) {
      return { error: 'No authentication token provided', status: 401 };
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      success: true,
      customer: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      },
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'Authentication token expired', status: 401 };
    }
    return { error: 'Invalid authentication token', status: 401 };
  }
}

/**
 * Higher-order function to protect API routes with customer authentication.
 * On success, attaches request.customer for the wrapped handler.
 * @param {Function} handler - The route handler function
 * @returns {Function} - Wrapped handler with authentication
 */
export function withCustomerAuth(handler) {
  return async (request, ...args) => {
    const authResult = verifyCustomerToken(request);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    request.customer = authResult.customer;
    return handler(request, ...args);
  };
}

/**
 * Higher-order function to protect API routes with admin authentication
 * @param {Function} handler - The route handler function
 * @returns {Function} - Wrapped handler with authentication
 */
export function withAdminAuth(handler) {
  return async (request, ...args) => {
    const authResult = verifyAdminToken(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    // Attach admin info to request for use in handler
    request.admin = authResult.admin;
    
    // Call the original handler
    return handler(request, ...args);
  };
}

/**
 * Middleware function for app router (for page routes)
 * Note: For app router, we typically use route.ts/route.js files with route handlers
 * This function can be used in route handlers to protect them.
 */
export function adminMiddleware(handler) {
  return withAdminAuth(handler);
}

/**
 * Client-side helper to check if admin is authenticated
 * @returns {boolean}
 */
export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('admin_user') || document.cookie.includes('admin_token');
}

/**
 * Client-side helper to decode and get admin details
 * @returns {Object|null}
 */
export function decodeAdminToken() {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Failed to parse admin user from localStorage:', e);
  }
  return null;
}

export default {
  verifyAdminToken,
  withAdminAuth,
  adminMiddleware,
  isAdminAuthenticated,
  decodeAdminToken
};