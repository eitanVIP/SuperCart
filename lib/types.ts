export interface Family {
	id: string;
	name: string;
	weekStartDay: string;
	shoppingDays: string[];
	allProducts: Product[];
	weekProducts: Product[];
}

export interface Product {
	id: string;
	familyId: string;
	name: string;
	description: string;
	imageUrl: string | null;
	addedByUserId: string;
	addedByName: string;
	isRecurring: boolean;
	isChecked: boolean;
}

export type ProductValues = Pick<Product, "name" | "description" | "isRecurring" | "imageUrl">;
