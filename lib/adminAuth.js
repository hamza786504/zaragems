import bcrypt from 'bcryptjs';
import client from './sanityClient';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

export function isLocked(admin) {
  return !!(admin.lockUntil && new Date(admin.lockUntil).getTime() > Date.now());
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(candidatePassword, passwordHash) {
  return bcrypt.compare(candidatePassword, passwordHash);
}

// Persist a login attempt result (lock/unlock, reset counters, stamp lastLogin)
export async function recordLoginAttempt(admin, success) {
  const patch = success
    ? { loginAttempts: 0, lockUntil: null, lastLogin: new Date().toISOString() }
    : (() => {
        const loginAttempts = (admin.loginAttempts || 0) + 1;
        const attemptPatch = { loginAttempts };
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          attemptPatch.lockUntil = new Date(Date.now() + LOCK_TIME_MS).toISOString();
        }
        return attemptPatch;
      })();

  await client.patch(admin._id).set(patch).commit();
}

export async function findAdminByEmailOrUsername(emailOrUsername) {
  return client.fetch(
    `*[_type == "admin" && (email == $val || username == $val)][0]{
      ...,
      "createdAt": _createdAt,
      "updatedAt": _updatedAt
    }`,
    { val: emailOrUsername }
  );
}

// Mirrors the old Mongoose Admin.findByCredentials static method
export async function findByCredentials(emailOrUsername, password) {
  const admin = await findAdminByEmailOrUsername(emailOrUsername);
  if (!admin) return null;

  if (isLocked(admin)) {
    throw new Error('Account is temporarily locked. Please try again later.');
  }

  const isValidPassword = await comparePassword(password, admin.password);
  if (!isValidPassword) {
    await recordLoginAttempt(admin, false);
    throw new Error('Invalid credentials.');
  }

  await recordLoginAttempt(admin, true);
  return admin;
}
