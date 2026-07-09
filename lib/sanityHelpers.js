// Aliases Sanity's built-in _createdAt/_updatedAt onto createdAt/updatedAt so
// mutation responses match the shape GROQ projections and the old Mongoose
// documents both use.
export function withTimestamps(doc) {
  if (!doc) return doc;
  return { ...doc, createdAt: doc._createdAt, updatedAt: doc._updatedAt };
}
