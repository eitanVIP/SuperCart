import React from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {useTheme} from "@/theme/ThemeContext";
import {Ionicons} from "@expo/vector-icons";

const tabs = [
	{ icon: "home", label: "List" },
	{ icon: "checkmark-circle", label: "Checklist" },
	{ icon: "settings-sharp", label: "Settings" },
];

export function BottomNav({index, onChange,}: { index: number; onChange: (index: number) => void; }) {
	const { colors } = useTheme();
	const styles = createStyles(colors);

	return (
		<View style={styles.nav}>
			{tabs.map((tab, tabIndex) => (
				<Pressable key={tab.label} style={staticStyles.tab} onPress={() => onChange(tabIndex)}>
					<Ionicons name={tab.icon} size={index === tabIndex ? 22 : 18} color={colors.navInactive} style={index === tabIndex && styles.active} />
					<Text style={[styles.label, index === tabIndex && styles.activeLabel]}>
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
		label: { fontSize: 10, fontWeight: "700", color: colors.navInactive },
		active: { color: colors.navActive },
		activeLabel: { color: colors.navActive, fontSize: 11 },
		dot: { height: 4, width: 4, borderRadius: 2, backgroundColor: colors.navActive, marginTop: 3 },
	});