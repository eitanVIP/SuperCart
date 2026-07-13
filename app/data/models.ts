import type { Family, Product, ProductValues, User } from "./types";

export function createProduct({
	familyId,
	user,
	...values
}: ProductValues & { familyId: string; user: User }): Product {
	return {
		id: `local-${Date.now()}`,
		familyId,
		name: values.name,
		description: values.description || "",
		imageUrl: values.imageUrl || null,
		addedByUserId: user.id,
		addedByName: user.name,
		isRecurring: values.isRecurring,
		isChecked: false,
		createdAt: new Date().toISOString(),
	};
}

export function createFamily(name: string): Family {
	return {
		id: `local-family-${Date.now()}`,
		name,
		code: String(Math.floor(100000 + Math.random() * 900000)),
		weekStartDay: "Sunday",
		shoppingDays: [],
		memberIds: [],
	};
}
