/*
 * Data boundary for Firebase.
 * Replace each method body with Firestore calls (for example, addDoc / onSnapshot)
 * without changing screens or components. No sample products are returned here.
 */
const localProducts = new Map();

export const superCartService = {
  async getProducts(familyId) {
    return localProducts.get(familyId) || [];
  },
  async addProduct(product) {
    const products = localProducts.get(product.familyId) || [];
    localProducts.set(product.familyId, [product, ...products]);
    return product;
  },
  async updateProduct(familyId, productId, changes) {
    const products = localProducts.get(familyId) || [];
    const updated = products.map((product) => product.id === productId ? { ...product, ...changes } : product);
    localProducts.set(familyId, updated);
    return updated.find((product) => product.id === productId);
  },
  async deleteProduct(familyId, productId) {
    localProducts.set(familyId, (localProducts.get(familyId) || []).filter((product) => product.id !== productId));
  },
};
