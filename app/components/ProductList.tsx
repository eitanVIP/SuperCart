import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const members = ["All", "You"];

export function ProductList({ products, shopping = false, onAdd, onSelect, onToggle }) {
	const [member, setMember] = useState("All");
	const [recurringOnly, setRecurringOnly] = useState(false);
	const visible = useMemo(
		() =>
			products
				.filter(
					(item) =>
						(member === "All" || item.addedByName === member) &&
						(!recurringOnly || item.isRecurring),
				)
				.sort((a, b) => Number(b.isRecurring) - Number(a.isRecurring)),
		[products, member, recurringOnly],
	);
	return (
		<View style={styles.root}>
			{!shopping && (
				<>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.filters}
					>
						{members.map((item) => (
							<FilterButton
								key={item}
								label={item}
								active={member === item}
								onPress={() => setMember(item)}
							/>
						))}
						<FilterButton
							label="Recurring"
							active={recurringOnly}
							onPress={() => setRecurringOnly((value) => !value)}
						/>
					</ScrollView>
				</>
			)}
			<ScrollView contentContainerStyle={styles.list}>
				{visible.length === 0 ? (
					<EmptyState shopping={shopping} onAdd={onAdd} />
				) : (
					visible.map((item, index) => (
						<React.Fragment key={item.id}>
							{(index === 0 ||
								visible[index - 1].isRecurring !== item.isRecurring) && (
								<Text style={styles.section}>
									{item.isRecurring ? "RECURRING ITEMS" : "THIS WEEK"}
								</Text>
							)}
							<ProductRow
								item={item}
								shopping={shopping}
								onSelect={() => onSelect(item)}
								onToggle={() => onToggle(item)}
							/>
						</React.Fragment>
					))
				)}
			</ScrollView>
		</View>
	);
}
function FilterButton({ label, active, onPress }) {
	return (
		<Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}>
			<Text numberOfLines={1} style={[styles.filterText, active && styles.filterTextActive]}>
				{label}
			</Text>
		</Pressable>
	);
}
function ProductRow({ item, shopping, onSelect, onToggle }) {
	return (
		<Pressable
			onPress={onSelect}
			style={[styles.item, shopping && item.isChecked && styles.checkedItem]}
		>
			{shopping && (
				<Pressable
					onPress={onToggle}
					hitSlop={10}
					style={[styles.checkbox, item.isChecked && styles.checkboxActive]}
				>
					{item.isChecked && <Text style={styles.check}>✓</Text>}
				</Pressable>
			)}
			<View style={styles.itemBody}>
				<View style={styles.itemTitleRow}>
					<Text style={[styles.itemName, shopping && item.isChecked && styles.strike]}>
						{item.name}
					</Text>
					{item.isRecurring && <Text style={styles.recurring}>RECURRING</Text>}
				</View>
				{Boolean(item.description) && (
					<Text style={[styles.description, shopping && item.isChecked && styles.strike]}>
						{item.description}
					</Text>
				)}
				<Text style={styles.byline}>Added by {item.addedByName}</Text>
			</View>
			{!shopping && <Text style={styles.arrow}>›</Text>}
		</Pressable>
	);
}
function EmptyState({ shopping, onAdd }) {
	return (
		<View style={styles.empty}>
			<View style={styles.emptyMark}>
				<View style={styles.emptyLine} />
				<View style={styles.emptyLine} />
				<View style={styles.emptyLine} />
			</View>
			<Text style={styles.emptyTitle}>
				{shopping ? "Your checklist is clear" : "Your list is empty"}
			</Text>
			<Text style={styles.emptyText}>
				{shopping
					? "Items your family adds will appear here."
					: "Add the first item your family needs this week."}
			</Text>
			{!shopping && (
				<Pressable onPress={onAdd} style={styles.emptyButton}>
					<Text style={styles.emptyButtonText}>Add first item</Text>
				</Pressable>
			)}
		</View>
	);
}
const styles = StyleSheet.create({
	root: { flex: 1 },
	filters: { paddingHorizontal: 20, paddingVertical: 14, gap: 9 },
	filter: {
		height: 37,
		paddingHorizontal: 15,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#D8E6DD",
		backgroundColor: "#FFF",
		justifyContent: "center",
	},
	filterActive: { backgroundColor: "#DCF2E5", borderColor: "#93CDAA" },
	filterText: { fontSize: 13, color: "#587062", fontWeight: "700" },
	filterTextActive: { color: "#166A45" },
	list: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 110 },
	section: {
		fontSize: 10,
		letterSpacing: 1.2,
		fontWeight: "800",
		color: "#7A8D82",
		marginTop: 12,
		marginBottom: 9,
	},
	item: {
		minHeight: 80,
		backgroundColor: "#FFF",
		borderWidth: 1,
		borderColor: "#E2ECE6",
		borderRadius: 16,
		marginBottom: 10,
		padding: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	checkedItem: { opacity: 0.52 },
	checkbox: {
		width: 27,
		height: 27,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: "#B7C9BE",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	checkboxActive: { backgroundColor: "#177A50", borderColor: "#177A50" },
	check: { color: "#FFF", fontWeight: "900", fontSize: 16 },
	itemBody: { flex: 1 },
	itemTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
	itemName: { fontSize: 16, fontWeight: "800", color: "#1B3326" },
	recurring: {
		fontSize: 8,
		letterSpacing: 0.6,
		fontWeight: "900",
		color: "#177A50",
		backgroundColor: "#E6F5EC",
		paddingHorizontal: 6,
		paddingVertical: 3,
		borderRadius: 5,
	},
	description: { fontSize: 12, color: "#718178", marginTop: 3 },
	byline: { fontSize: 11, color: "#819087", marginTop: 6 },
	strike: { textDecorationLine: "line-through" },
	arrow: { fontSize: 27, color: "#91A097" },
	empty: { paddingTop: 90, alignItems: "center", paddingHorizontal: 34 },
	emptyMark: {
		width: 62,
		height: 62,
		borderRadius: 18,
		backgroundColor: "#E4F3EA",
		padding: 15,
		gap: 6,
		marginBottom: 17,
	},
	emptyLine: { height: 5, borderRadius: 3, backgroundColor: "#6FB48B" },
	emptyTitle: { fontSize: 19, fontWeight: "800", color: "#1B3326" },
	emptyText: {
		fontSize: 14,
		color: "#718178",
		lineHeight: 20,
		textAlign: "center",
		marginTop: 8,
	},
	emptyButton: {
		marginTop: 19,
		paddingHorizontal: 18,
		paddingVertical: 12,
		borderRadius: 12,
		backgroundColor: "#177A50",
	},
	emptyButtonText: { color: "#FFF", fontWeight: "800" },
});
