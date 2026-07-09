// Shared GROQ projections reused across product route handlers and server components.
export const PRODUCT_PROJECTION = `{
  ...,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt,
  "collectionId": *[_type == "collection" && _id == ^.collectionId][0]{ _id, name, slug }
}`;
