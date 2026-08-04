import React, {useState} from "react";
import {Alert, Image, Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import {useTheme} from "@/theme/ThemeContext";
import {Family, Profile} from "@/lib/types";
import {FamilySheet, ProfileSheet} from "@/lib/components/SettingsSheets";

const THEME_OPTIONS = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
];

export function SettingsScreen({ family, profile, onSaveFamily, onLeaveFamily, onSaveProfile, onLogout }: { family: Family; profile: Profile; onSaveFamily: (name: string, weekStartDay: string) => void, onLeaveFamily: () => void, onSaveProfile: (profile: Profile, password: string) => void, onLogout: () => void}) {
	const [sheet, setSheet] = useState(null);

	const { colors, mode, setMode } = useTheme();
	const styles = createStyles(colors);

	return (
		<>
			<ScrollView contentContainerStyle={staticStyles.content}>
				<Text style={styles.title}>Settings</Text>

				<Text style={styles.group}>PROFILE</Text>
				<SettingButton styles={styles} onPress={() => setSheet("profile")} initial={profile.name.at(0)} image={profile.photoUrl} text={profile.name} desc={"Edit profile"} />

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
				<SettingButton styles={styles} onPress={() => setSheet("family")} initial={family.name.at(family.name.lastIndexOf(" ") + 1) ?? family.name.at(0)} text={family.name} desc={"Manage family"} />

				<Text style={styles.group}>SESSION</Text>
				<Pressable onPress={onLogout} style={styles.logout}>
					<Text style={styles.logoutText}>Log out</Text>
				</Pressable>
			</ScrollView>

			<ProfileSheet
				visible={sheet === "profile"}
				profile={profile}
				onCloseSheet={() => setSheet(null)}
				onSave={onSaveProfile}
			/>

			<FamilySheet
				visible={sheet === "family"}
				family={family}
				onCloseSheet={() => setSheet(null)}
				onSave={onSaveFamily}
				onLeave={onLeaveFamily}
			/>
		</>
	);
}

function SettingButton({styles, onPress, initial, image=null, text, desc}) {
	return (
		<Pressable onPress={onPress} style={styles.card}>
			<View style={styles.initial}>
				{image === null || image === "" ? (
					<Text style={styles.initialText}>{initial}</Text>
				) : (
					<Image source={{ uri: image }} style={staticStyles.avatarImage} />
				)}
			</View>
			<View style={{ flex: 1 }}>
				<Text style={styles.cardText}>{text}</Text>
				<Text style={styles.cardDesc}>{desc}</Text>
			</View>
			<Text style={styles.arrow}>›</Text>
		</Pressable>
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
	avatarImage: { width: "100%", height: "100%", borderRadius: 15 },
});

const createStyles = (colors) =>
	StyleSheet.create({
		logout: {
			height: 53,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 17,
			borderWidth: 1,
			borderColor: colors.danger,
			backgroundColor: colors.dangerLight,
		},
		eyebrow: {
			fontSize: 10,
			letterSpacing: 1.2,
			fontWeight: "800",
			color: colors.textMuted,
			marginTop: 8,
		},
		title: { fontSize: 29, fontWeight: "800", color: colors.text, marginTop: 7 },
		card: {
			backgroundColor: colors.card,
			borderRadius: 17,
			borderWidth: 1,
			borderColor: colors.border,
			padding: 15,
			// marginTop: 23,
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
		initialText: { color: colors.textOnPrimary, fontSize: 20, fontWeight: "800" },
		cardText: { fontSize: 16, fontWeight: "800", color: colors.text },
		cardDesc: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
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
			// borderBottomWidth: 1,
			// borderColor: colors.divider,
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
		logoutText: { color: colors.danger, fontWeight: "800", fontSize: 15 },
	});