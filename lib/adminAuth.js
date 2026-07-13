import bcrypt from 'bcryptjs';
import client from './sanityClient';

// Admin accounts never get locked out - disable locking mechanism
export function isLocked(admin) {
  return false;
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(candidatePassword, passwordHash) {
  return bcrypt.compare(candidatePassword, passwordHash);
}

// For admin accounts, we never track failed attempts or lock the account
export async function recordLoginAttempt(admin, success) {
  const patch = success
    ? { loginAttempts: 0, lockUntil: null, lastLogin: new Date().toISOString() }
    : { loginAttempts: 0, lockUntil: null };

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
// For admin accounts, we don't track failed attempts or lock the account
export async function findByCredentials(emailOrUsername, password) {
  const admin = await findAdminByEmailOrUsername(emailOrUsername);
  if (!admin) return null;

  const isValidPassword = await comparePassword(password, admin.password);
  if (!isValidPassword) {
    // Don't track failed attempts for admins
    await recordLoginAttempt(admin, false);
    throw new Error('Invalid credentials.');
  }

  await recordLoginAttempt(admin, true);
  return admin;
}