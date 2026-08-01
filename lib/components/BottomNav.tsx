import React from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {useTheme} from "@/theme/ThemeContext";

const tabs = [
	{ icon: "HOME", label: "Home" },
	{ icon: "LIST", label: "ChecklistScreen" },
	{ icon: "SET", label: "Settings" },
];
export function BottomNav({
							  index,
							  onChange,
						  }: {
	index: number;
	onChange: (index: number) => void;
}) {
	const { colors } = useTheme();
	const styles = createStyles(colors);

	return (
		<View style={styles.nav}>
			{tabs.map((tab, tabIndex) => (
				<Pressable key={tab.label} style={staticStyles.tab} onPress={() => onChange(tabIndex)}>
					<Text style={[styles.icon, index === tabIndex && styles.active]}>
						{tab.icon}
					</Text>
					<Text style={[styles.label, index === tabIndex && styles.active]}>
						{tab.label}
					</Text>
					{index === tabIndex && <View style={styles.dot} />}
				</Pressable>
			))}
		</View>
	);
}

const staticStyles = StyleSheet.create({
	tab: { flex: 1, alignItems: "center" },
});

const createStyles = (colors) =>
	StyleSheet.create({
		nav: {
			height: 70,
			backgroundColor: colors.card,
			borderTopWidth: 1,
			borderColor: colors.navBorder,
			flexDirection: "row",
			paddingTop: 8,
		},
		icon: { fontSize: 9, letterSpacing: 0.3, fontWeight: "900", color: colors.navInactive, height: 22 },
		label: { fontSize: 10, fontWeight: "700", color: colors.navInactive },
		active: { color: colors.navActive },
		dot: { height: 4, width: 4, borderRadius: 2, backgroundColor: colors.navActive, marginTop: 3 },
	});