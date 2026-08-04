export interface Family {
	id: string;
	name: string;
	weekStartDay: string;
	// shoppingDays: string[];
	allProducts: Product[];
	checklistProducts: Product[];
}

export interface Product {
	id: string;
	name: string;
	description: string;
	count: number;
	imageUrl: string | null;
	addedByUserId: string;
	addedByName: string;
	isRecurring: boolean;
	isChecked: boolean;
	checkedAt: number | null;
}

export interface ProductDatabase {
	name: string;
	description: string;
	count: number;
	imageUrl: string | null;
	addedByUserId: string;
	isRecurring: boolean;
	isChecked: boolean;
	checkedAt: number | null;
}

export interface Profile {
	name: string;
	photoUrl: string | null;
}

export type ProductValues = Pick<Product, "name" | "description" | "isRecurring" | "imageUrl">;
