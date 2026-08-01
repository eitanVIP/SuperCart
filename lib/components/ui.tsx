import React from "react";
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View} from "react-native";
import {useTheme} from "@/theme/ThemeContext";

export function PrimaryButton({
								  label,
								  onPress,
								  disabled = false,
							  }: {
	label: string;
	onPress: () => void;
	disabled?: boolean;
}) {
	const { colors } = useTheme();
	const styles = createStyles(colors);

	return (
		<Pressable
			disabled={disabled}
			onPress={onPress}
			style={[styles.primary, disabled && staticStyles.disabled]}
		>
			<Text style={styles.primaryText}>{label}</Text>
		</Pressable>
	);
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
	const { colors } = useTheme();
	const styles = createStyles(colors);

	return (
		<View>
			<Text style={styles.inputLabel}>{label}</Text>
			<TextInput style={styles.input} placeholderTextColor={colors.placeholder} {...props} />
		</View>
	);
}

export function TopBar({
						   title,
						   action,
						   onAction,
					   }: {
	title: string;
	action?: string | null;
	onAction?: () => void;
}) {
	const { colors } = useTheme();
	const styles = createStyles(colors);

	return (
		<View style={styles.topBar}>
			<View style={staticStyles.brand}>
				<View style={styles.brandMark}>
					<Text style={styles.brandLetter}>S</Text>
				</View>
				<Text style={styles.brandText}>{title}</Text>
			</View>
			{action && (
				<Pressable onPress={onAction} hitSlop={10}>
					<Text style={styles.topAction}>{action}</Text>
				</Pressable>
			)}
		</View>
	);
}

export function LoadingIndicator() {
	const { colors } = useTheme();

	return (
		<View style={staticStyles.loadingContainer}>
			<ActivityIndicator size={50} color={colors.primary} />
		</View>
	);
}

const staticStyles = StyleSheet.create({
	disabled: { opacity: 0.45 },
	brand: { flexDirection: "row", alignItems: "center", gap: 9 },
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

const createStyles = (colors) =>
	StyleSheet.create({
		primary: {
			height: 52,
			backgroundColor: colors.primary,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 14,
			marginTop: 20,
		},
		primaryText: { color: colors.onPrimary, fontSize: 16, fontWeight: "800" },
		inputLabel: {
			fontSize: 10,
			color: colors.textMuted,
			fontWeight: "800",
			letterSpacing: 1,
			marginTop: 15,
			marginBottom: 7,
		},
		input: {
			height: 52,
			backgroundColor: colors.surface,
			borderWidth: 1,
			borderColor: colors.borderLight,
			borderRadius: 13,
			paddingHorizontal: 14,
			fontSize: 15,
			color: colors.text,
		},
		topBar: {
			height: 62,
			paddingHorizontal: 20,
			backgroundColor: colors.card,
			borderBottomWidth: 1,
			borderColor: colors.border,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		brandMark: {
			height: 32,
			width: 32,
			borderRadius: 10,
			backgroundColor: colors.primary,
			justifyContent: "center",
			alignItems: "center",
		},
		brandLetter: { color: colors.onPrimary, fontWeight: "900", fontSize: 17 },
		brandText: { color: colors.text, fontWeight: "800", fontSize: 17 },
		topAction: { color: colors.primary, fontWeight: "800", fontSize: 14 },
	});