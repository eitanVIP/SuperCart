import React from "react";
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View} from "react-native";

export function PrimaryButton({
	label,
	onPress,
	disabled = false,
}: {
	label: string;
	onPress: () => void;
	disabled?: boolean;
}) {
	return (
		<Pressable
			disabled={disabled}
			onPress={onPress}
			style={[styles.primary, disabled && styles.disabled]}
		>
			<Text style={styles.primaryText}>{label}</Text>
		</Pressable>
	);
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
	return (
		<View>
			<Text style={styles.inputLabel}>{label}</Text>
			<TextInput style={styles.input} placeholderTextColor="#88958D" {...props} />
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
	return (
		<View style={styles.topBar}>
			<View style={styles.brand}>
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
	return (
		<View style={{
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		}}>
			<ActivityIndicator size={50} color="#177A50" />
		</View>
	);
}

const styles = StyleSheet.create({
	primary: {
		height: 52,
		backgroundColor: "#177A50",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 14,
		marginTop: 20,
	},
	disabled: { opacity: 0.45 },
	primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
	inputLabel: {
		fontSize: 10,
		color: "#65746B",
		fontWeight: "800",
		letterSpacing: 1,
		marginTop: 15,
		marginBottom: 7,
	},
	input: {
		height: 52,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#DCE7E0",
		borderRadius: 13,
		paddingHorizontal: 14,
		fontSize: 15,
		color: "#193126",
	},
	topBar: {
		height: 62,
		paddingHorizontal: 20,
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderColor: "#E4ECE7",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	brand: { flexDirection: "row", alignItems: "center", gap: 9 },
	brandMark: {
		height: 32,
		width: 32,
		borderRadius: 10,
		backgroundColor: "#177A50",
		justifyContent: "center",
		alignItems: "center",
	},
	brandLetter: { color: "#FFF", fontWeight: "900", fontSize: 17 },
	brandText: { color: "#173426", fontWeight: "800", fontSize: 17 },
	topAction: { color: "#177A50", fontWeight: "800", fontSize: 14 },
});
