import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { stringifySetCookie } from 'cookie';
import client from './sanityClient';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// Sign a session JWT for a customer document.
export function signCustomerToken(customer) {
  return jwt.sign(
    {
      id: customer._id,
      email: customer.email,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Build the Set-Cookie header value for a fresh session.
export function sessionCookie(token) {
  return stringifySetCookie({
    name: 'customer_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

// Build the Set-Cookie header value that clears the session.
export function clearSessionCookie() {
  return stringifySetCookie({
    name: 'customer_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
}

// Customer-facing auth helpers. Mirrors lib/adminAuth.js but targets the
// `customer` Sanity document (the same doc /api/orders upserts on checkout),
// so a shopper's order history and login credentials live on one record.

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

export function isLocked(customer) {
  return !!(customer.lockUntil && new Date(customer.lockUntil).getTime() > Date.now());
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(candidatePassword, passwordHash) {
  return bcrypt.compare(candidatePassword, passwordHash);
}

// Full customer record including the password hash. Only use server-side.
export async function findCustomerByEmail(email) {
  if (!email) return null;
  return client.fetch(
    `*[_type == "customer" && email == $email][0]{
      ...,
      "createdAt": _createdAt,
      "updatedAt": _updatedAt
    }`,
    { email: email.toLowerCase() }
  );
}

// Persist a login attempt result (lock/unlock, reset counters, stamp lastLogin).
export async function recordLoginAttempt(customer, success) {
  const patch = success
    ? { loginAttempts: 0, lockUntil: null, lastLogin: new Date().toISOString() }
    : (() => {
        const loginAttempts = (customer.loginAttempts || 0) + 1;
        const attemptPatch = { loginAttempts };
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          attemptPatch.lockUntil = new Date(Date.now() + LOCK_TIME_MS).toISOString();
        }
        return attemptPatch;
      })();

  await client.patch(customer._id).set(patch).commit();
}

// Verify email + password. Returns the customer on success, throws on
// bad/locked credentials, returns null if no account (or no password set).
export async function findByCredentials(email, password) {
  const customer = await findCustomerByEmail(email);
  if (!customer || !customer.password) return null;

  if (isLocked(customer)) {
    throw new Error('Account is temporarily locked. Please try again later.');
  }

  const isValidPassword = await comparePassword(password, customer.password);
  if (!isValidPassword) {
    await recordLoginAttempt(customer, false);
    throw new Error('Invalid credentials.');
  }

  await recordLoginAttempt(customer, true);
  return customer;
}

// Shape a customer doc for client consumption — never leak the password hash.
export function sanitizeCustomer(customer) {
  if (!customer) return null;
  const { password, loginAttempts, lockUntil, ...safe } = customer;
  return {
    id: customer._id,
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
    email: customer.email,
    phone: customer.phone || '',
    ordersCount: customer.ordersCount || 0,
    totalSpent: customer.totalSpent || 0,
    createdAt: customer.createdAt || customer._createdAt,
  };
}
