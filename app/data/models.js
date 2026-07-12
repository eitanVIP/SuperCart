/**
 * Firebase-ready document shapes. Keep these names aligned with Firestore fields.
 * Product: { id, familyId, name, description, imageUrl, addedByUserId,
 *            addedByName, isRecurring, isChecked, createdAt }
 * Family:  { id, name, code, weekStartDay, shoppingDays, memberIds }
 */
export const createProduct = ({ familyId, name, description, isRecurring, imageUrl, user }) => ({
  id: `local-${Date.now()}`,
  familyId,
  name,
  description: description || '',
  imageUrl: imageUrl || null,
  addedByUserId: user.id,
  addedByName: user.name,
  isRecurring,
  isChecked: false,
  createdAt: new Date().toISOString(),
});

export const createFamily = (name) => ({
  id: `local-family-${Date.now()}`,
  name,
  code: String(Math.floor(100000 + Math.random() * 900000)),
  weekStartDay: 'Sunday',
  shoppingDays: [],
  memberIds: [],
});
