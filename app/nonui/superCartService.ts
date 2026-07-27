import type { Product } from "./types";

const localProducts = new Map<string, Product[]>();

export const superCartService = {
	async getProducts(familyId: string): Promise<Product[]> {
		return localProducts.get(familyId) || [];
	},
	async addProduct(product: Product): Promise<Product> {
		const products = localProducts.get(product.familyId) || [];
		localProducts.set(product.familyId, [product, ...products]);
		return product;
	},
	async updateProduct(
		familyId: string,
		productId: string,
		changes: Partial<Product>,
	): Promise<Product | undefined> {
		const products = localProducts.get(familyId) || [];
		const updated = products.map((product) =>
			product.id === productId ? { ...product, ...changes } : product,
		);
		localProducts.set(familyId, updated);
		return updated.find((product) => product.id === productId);
	},
	async deleteProduct(familyId: string, productId: string): Promise<void> {
		localProducts.set(
			familyId,
			(localProducts.get(familyId) || []).filter((product) => product.id !== productId),
		);
	},
};
