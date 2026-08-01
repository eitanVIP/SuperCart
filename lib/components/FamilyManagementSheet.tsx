import React, {useEffect, useRef} from "react";
import {Alert, Animated, Modal, PanResponder, Pressable, StyleSheet, Text, View,} from "react-native";
import {useTheme} from "@/theme/ThemeContext";

export function FamilyManagementSheet({ visible, family, onClose, onLeave }) {
	const { colors } = useTheme();
	const styles = createStyles(colors);

	const offset = useRef(new Animated.Value(0)).current;
	useEffect(() => {
		if (visible) offset.setValue(0);
	}, [visible, offset]);
	const pan = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, g) =>
				Math.abs(g.dy) > 5 && Math.abs(g.dy) > Math.abs(g.dx),
			onPanResponderMove: (_, g) => offset.setValue(Math.max(0, g.dy)),
			onPanResponderRelease: (_, g) =>
				g.dy > 105 || g.vy > 1
					? Animated.timing(offset, {
						toValue: 600,
						duration: 170,
						useNativeDriver: true,
					}).start(onClose)
					: Animated.spring(offset, {
						toValue: 0,
						useNativeDriver: true,
						damping: 21,
						stiffness: 260,
					}).start(),
		}),
	).current;
	if (!family) return null;
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose} />
			<Animated.View style={[styles.sheet, { transform: [{ translateY: offset }] }]}>
				<View {...pan.panHandlers} style={staticStyles.dragArea}>
					<View style={styles.handle} />
				</View>
				<Text style={styles.title}>Manage family</Text>
				<Text style={styles.sub}>Your shared shopping space.</Text>
				<View style={styles.card}>
					<Text style={styles.familyName}>{family.name}</Text>
					<Text style={styles.label}>FAMILY CODE</Text>
					<Pressable
						onPress={() => Alert.alert("Family code", family.code)}
						style={styles.codeRow}
					>
						<Text style={styles.code}>{family.code}</Text>
						<Text style={styles.copy}>View</Text>
					</Pressable>
				</View>
				<Text style={styles.label}>SCHEDULE</Text>
				<Row label="Week starts on" value={family.weekStartDay || "Sunday"} colors={colors} styles={styles} />
				<Row
					label="Shopping days"
					value={(family.shoppingDays || []).join(", ") || "Not set"}
					colors={colors}
					styles={styles}
				/>
				<Pressable
					onPress={() =>
						Alert.alert("Leave family?", "You will return to family selection.", [
							{ text: "Cancel", style: "cancel" },
							{ text: "Leave family", style: "destructive", onPress: onLeave },
						])
					}
					style={styles.leave}
				>
					<Text style={styles.leaveText}>Leave current family</Text>
				</Pressable>
			</Animated.View>
		</Modal>
	);
}
function Row({ label, value, colors, styles }) {
	return (
		<View style={styles.row}>
			<Text style={styles.rowLabel}>{label}</Text>
			<Text style={styles.rowValue}>{value}</Text>
		</View>
	);
}

const staticStyles = StyleSheet.create({
	dragArea: { height: 34, justifyContent: "center", alignItems: "center" },
});

const createStyles = (colors) =>
	StyleSheet.create({
		backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
		sheet: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			backgroundColor: colors.surface,
			borderTopLeftRadius: 26,
			borderTopRightRadius: 26,
			paddingHorizontal: 22,
			paddingBottom: 34,
		},
		handle: { height: 5, width: 40, borderRadius: 3, backgroundColor: colors.borderLight },
		title: { fontSize: 24, fontWeight: "800", color: colors.text },
		sub: { fontSize: 14, color: colors.textMuted, marginTop: 5 },
		card: {
			backgroundColor: colors.card,
			borderWidth: 1,
			borderColor: colors.border,
			padding: 16,
			borderRadius: 16,
			marginTop: 21,
		},
		familyName: { fontSize: 17, fontWeight: "800", color: colors.text },
		label: {
			fontSize: 10,
			letterSpacing: 1,
			fontWeight: "800",
			color: colors.textMuted,
			marginTop: 17,
			marginBottom: 7,
		},
		codeRow: {
			height: 47,
			borderRadius: 11,
			backgroundColor: colors.surfaceAlt,
			paddingHorizontal: 13,
			alignItems: "center",
			flexDirection: "row",
		},
		code: { fontSize: 19, letterSpacing: 3, fontWeight: "800", color: colors.primaryDark, flex: 1 },
		copy: { fontWeight: "800", fontSize: 13, color: colors.primary },
		row: {
			height: 46,
			flexDirection: "row",
			alignItems: "center",
			borderBottomWidth: 1,
			borderColor: colors.divider,
		},
		rowLabel: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1 },
		rowValue: { fontSize: 14, color: colors.primary, fontWeight: "700" },
		leave: {
			height: 51,
			borderRadius: 13,
			borderWidth: 1,
			borderColor: colors.dangerLight,
			alignItems: "center",
			justifyContent: "center",
			marginTop: 25,
		},
		leaveText: { color: colors.danger, fontWeight: "800" },
	});