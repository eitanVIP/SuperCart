import React from "react";
import {Alert, Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import {useTheme} from "@/theme/ThemeContext";

const THEME_OPTIONS = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
];

export function SettingsScreen({ family, onManageFamily, onLogout }) {
	const { colors, mode, setMode } = useTheme();
	const styles = createStyles(colors);

	return (
		<ScrollView contentContainerStyle={staticStyles.content}>
			<Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
			<Text style={styles.title}>Settings</Text>
			<View style={styles.profile}>
				<View style={styles.initial}>
					<Text style={styles.initialText}>Y</Text>
				</View>
				<View>
					<Text style={styles.name}>You</Text>
					<Text style={styles.email}>you@example.com</Text>
				</View>
			</View>
			<Text style={styles.group}>PREFERENCES</Text>
			<Row
				label="Reset password"
				styles={styles}
				onPress={() =>
					Alert.alert(
						"Reset password",
						"Connect this action to Firebase Auth sendPasswordResetEmail.",
					)
				}
			/>
			<View style={styles.themeRow}>
				<Text style={styles.rowLabel}>Theme</Text>
				<View style={styles.themeOptions}>
					{THEME_OPTIONS.map((option) => (
						<Pressable
							key={option.value}
							onPress={() => setMode(option.value)}
							style={[
								styles.themeOption,
								mode === option.value && styles.themeOptionActive,
							]}
						>
							<Text
								style={[
									styles.themeOptionText,
									mode === option.value && styles.themeOptionTextActive,
								]}
							>
								{option.label}
							</Text>
						</Pressable>
					))}
				</View>
			</View>
			<Text style={styles.group}>FAMILY</Text>
			<Pressable onPress={onManageFamily} style={styles.familyCard}>
				<View style={styles.familyMark}>
					<Text style={styles.familyMarkText}>F</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.familyTitle}>Manage family</Text>
					<Text style={styles.familySub}>{family.name}</Text>
				</View>
				<Text style={styles.arrow}>›</Text>
			</Pressable>
			<Text style={styles.group}>SESSION</Text>
			<Pressable onPress={onLogout} style={staticStyles.logout}>
				<Text style={styles.logoutText}>Log out</Text>
			</Pressable>
		</ScrollView>
	);
}

function Row({ label, onPress = undefined, right = undefined, styles }) {
	return (
		<Pressable onPress={onPress} style={styles.row}>
			<Text style={styles.rowLabel}>{label}</Text>
			{right || <Text style={styles.arrow}>›</Text>}
		</Pressable>
	);
}

const staticStyles = StyleSheet.create({
	content: { padding: 22, paddingBottom: 105 },
	logout: { height: 53, alignItems: "center", justifyContent: "center" },
});

const createStyles = (colors) =>
	StyleSheet.create({
		eyebrow: {
			fontSize: 10,
			letterSpacing: 1.2,
			fontWeight: "800",
			color: colors.textMuted,
			marginTop: 8,
		},
		title: { fontSize: 29, fontWeight: "800", color: colors.text, marginTop: 7 },
		profile: {
			backgroundColor: colors.card,
			borderRadius: 17,
			borderWidth: 1,
			borderColor: colors.border,
			padding: 15,
			marginTop: 23,
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
		},
		initial: {
			height: 49,
			width: 49,
			borderRadius: 16,
			backgroundColor: colors.primary,
			alignItems: "center",
			justifyContent: "center",
		},
		initialText: { color: colors.onPrimary, fontSize: 20, fontWeight: "800" },
		name: { fontSize: 16, fontWeight: "800", color: colors.text },
		email: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
		group: {
			fontSize: 10,
			letterSpacing: 1.1,
			fontWeight: "800",
			color: colors.textMuted,
			marginTop: 28,
			marginBottom: 8,
		},
		row: {
			height: 57,
			borderBottomWidth: 1,
			borderColor: colors.divider,
			flexDirection: "row",
			alignItems: "center",
		},
		themeRow: {
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderColor: colors.divider,
			gap: 10,
		},
		themeOptions: {
			flexDirection: "row",
			gap: 8,
		},
		themeOption: {
			flex: 1,
			paddingVertical: 9,
			borderRadius: 10,
			borderWidth: 1,
			borderColor: colors.borderLight,
			alignItems: "center",
		},
		themeOptionActive: {
			backgroundColor: colors.primaryLight,
			borderColor: colors.primary,
		},
		themeOptionText: {
			fontSize: 13,
			fontWeight: "700",
			color: colors.textSecondary,
		},
		themeOptionTextActive: {
			color: colors.primaryDark,
		},
		rowLabel: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 },
		arrow: { fontSize: 26, color: colors.iconMuted },
		familyCard: {
			backgroundColor: colors.primaryLighter,
			padding: 15,
			borderRadius: 17,
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
		},
		familyMark: {
			width: 43,
			height: 43,
			borderRadius: 13,
			backgroundColor: colors.primaryLight,
			alignItems: "center",
			justifyContent: "center",
		},
		familyMarkText: { fontSize: 17, fontWeight: "900", color: colors.primary },
		familyTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
		familySub: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
		logoutText: { color: colors.danger, fontWeight: "800", fontSize: 15 },
	});