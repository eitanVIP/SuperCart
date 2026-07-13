export interface User {
	id: string;
	name: string;
	email: string;
}

export interface Family {
	id: string;
	name: string;
	code: string;
	weekStartDay: string;
	shoppingDays: string[];
	memberIds: string[];
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
	createdAt: string;
}

export type ProductValues = Pick<Product, "name" | "description" | "isRecurring" | "imageUrl">;
