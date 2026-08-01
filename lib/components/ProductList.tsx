import React, {useMemo, useState} from "react";
import {Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import * as Auth from "@/lib/auth";
import {useTheme} from "@/theme/ThemeContext";

const members = ["All", "You"];

export function ProductList({ products, shopping = false, onAdd, onSelect, onToggle }) {
	const { colors } = useTheme();
	const styles = createStyles(colors);

	const [member, setMember] = useState("All");
	const [recurringOnly, setRecurringOnly] = useState(false);

	const visible = useMemo(
		() =>
			products
				.filter(
					(item) =>
						(member === "All" || (member === "You" && item.addedByUserId == Auth.getCurrentUser().uid)) &&
						(!recurringOnly || item.isRecurring),
				)
				.sort((a, b) => Number(a.isRecurring) - Number(b.isRecurring)),
		[products, member, recurringOnly],
	);

	return (
		<View style={staticStyles.root}>
			<ScrollView
				horizontal
				style={staticStyles.filtersScroll}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={staticStyles.filters}
			>
				{members.map((item) => (
					<FilterButton
						key={item}
						label={item}
						active={member === item}
						onPress={() => setMember(item)}
						styles={styles}
					/>
				))}
				<FilterButton
					label="Recurring"
					active={recurringOnly}
					onPress={() => setRecurringOnly((value) => !value)}
					styles={styles}
				/>
			</ScrollView>
			<ScrollView style={staticStyles.listScroll} contentContainerStyle={staticStyles.list}>
				{visible.length === 0 ? (
					<EmptyState shopping={shopping} onAdd={onAdd} styles={styles} />
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
								styles={styles}
							/>
						</React.Fragment>
					))
				)}
			</ScrollView>
		</View>
	);
}
function FilterButton({ label, active, onPress, styles }) {
	return (
		<Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}>
			<Text numberOfLines={1} style={[styles.filterText, active && styles.filterTextActive]}>
				{label}
			</Text>
		</Pressable>
	);
}
function ProductRow({ item, shopping, onSelect, onToggle, styles }) {
	return (
		<Pressable
			onPress={onSelect}
			style={[styles.item, shopping && item.isChecked && staticStyles.checkedItem]}
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
			<View style={staticStyles.itemBody}>
				<View style={staticStyles.itemTitleRow}>
					<Text style={[styles.itemName, shopping && item.isChecked && staticStyles.strike]}>
						{item.name}
					</Text>
					{item.isRecurring && <Text style={styles.recurring}>RECURRING</Text>}
				</View>
				{Boolean(item.description) && (
					<Text style={[styles.description, shopping && item.isChecked && staticStyles.strike]}>
						{item.description}
					</Text>
				)}
				<Text style={styles.byline}>Added by {item.addedByName}</Text>
			</View>
			{!shopping && <Text style={styles.arrow}>›</Text>}
		</Pressable>
	);
}
function EmptyState({ shopping, onAdd, styles }) {
	return (
		<View style={staticStyles.empty}>
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

const staticStyles = StyleSheet.create({
	root: { flex: 1 },
	filtersScroll: { flexGrow: 0 },
	filters: { paddingHorizontal: 20, paddingVertical: 14, gap: 9 },
	list: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 110 },
	listScroll: { flex: 1 },
	checkedItem: { opacity: 0.52 },
	itemBody: { flex: 1 },
	itemTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
	strike: { textDecorationLine: "line-through" },
	empty: { paddingTop: 90, alignItems: "center", paddingHorizontal: 34 },
});

const createStyles = (colors) =>
	StyleSheet.create({
		filter: {
			height: 37,
			paddingHorizontal: 15,
			borderRadius: 20,
			borderWidth: 1,
			borderColor: colors.borderLight,
			backgroundColor: colors.surface,
			justifyContent: "center",
		},
		filterActive: { backgroundColor: colors.primaryLighter, borderColor: colors.border },
		filterText: { fontSize: 13, color: colors.textSecondary, fontWeight: "700" },
		filterTextActive: { color: colors.primaryDark },
		section: {
			fontSize: 10,
			letterSpacing: 1.2,
			fontWeight: "800",
			color: colors.textMuted,
			marginTop: 12,
			marginBottom: 9,
		},
		item: {
			minHeight: 80,
			backgroundColor: colors.card,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: 16,
			marginBottom: 10,
			padding: 12,
			flexDirection: "row",
			alignItems: "center",
		},
		checkbox: {
			width: 27,
			height: 27,
			borderRadius: 8,
			borderWidth: 2,
			borderColor: colors.checkboxBorder,
			alignItems: "center",
			justifyContent: "center",
			marginRight: 12,
		},
		checkboxActive: { backgroundColor: colors.checkboxFilled, borderColor: colors.checkboxFilled },
		check: { color: colors.onPrimary, fontWeight: "900", fontSize: 16 },
		itemName: { fontSize: 16, fontWeight: "800", color: colors.text },
		recurring: {
			fontSize: 8,
			letterSpacing: 0.6,
			fontWeight: "900",
			color: colors.primary,
			backgroundColor: colors.primaryLighter,
			paddingHorizontal: 6,
			paddingVertical: 3,
			borderRadius: 5,
		},
		description: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
		byline: { fontSize: 11, color: colors.textFaint, marginTop: 6 },
		arrow: { fontSize: 27, color: colors.iconMuted },
		emptyMark: {
			width: 62,
			height: 62,
			borderRadius: 18,
			backgroundColor: colors.primaryLighter,
			padding: 15,
			gap: 6,
			marginBottom: 17,
		},
		emptyLine: { height: 5, borderRadius: 3, backgroundColor: colors.primaryLight },
		emptyTitle: { fontSize: 19, fontWeight: "800", color: colors.text },
		emptyText: {
			fontSize: 14,
			color: colors.textMuted,
			lineHeight: 20,
			textAlign: "center",
			marginTop: 8,
		},
		emptyButton: {
			marginTop: 19,
			paddingHorizontal: 18,
			paddingVertical: 12,
			borderRadius: 12,
			backgroundColor: colors.primary,
		},
		emptyButtonText: { color: colors.onPrimary, fontWeight: "800" },
	});