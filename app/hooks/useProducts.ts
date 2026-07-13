import { useCallback, useEffect, useState } from "react";
import { createProduct } from "../data/models";
import { superCartService } from "../data/superCartService";
import type { Product, ProductValues, User } from "../data/types";

export function useProducts(familyId: string, user: User) {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const reload = useCallback(async () => {
		setLoading(true);
		setProducts(await superCartService.getProducts(familyId));
		setLoading(false);
	}, [familyId]);
	useEffect(() => {
		void reload();
	}, [reload]);
	const addProduct = async (values: ProductValues) => {
		const product = await superCartService.addProduct(
			createProduct({ ...values, familyId, user }),
		);
		setProducts((items) => [product, ...items]);
	};
	const toggleProduct = async (product: Product) => {
		const updated = await superCartService.updateProduct(familyId, product.id, {
			isChecked: !product.isChecked,
		});
		if (updated)
			setProducts((items) => items.map((item) => (item.id === product.id ? updated : item)));
	};
	const deleteProduct = async (productId: string) => {
		await superCartService.deleteProduct(familyId, productId);
		setProducts((items) => items.filter((item) => item.id !== productId));
	};
	const editProduct = async (productId: string, changes: Partial<Product>) => {
		const updated = await superCartService.updateProduct(familyId, productId, changes);
		if (updated)
			setProducts((items) => items.map((item) => (item.id === productId ? updated : item)));
	};
	return { products, loading, addProduct, toggleProduct, deleteProduct, editProduct, reload };
}
