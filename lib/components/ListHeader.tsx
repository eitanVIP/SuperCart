import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "@/theme/ThemeContext";

export default function ListHeader({ title, text }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={staticStyles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{text}</Text>
        </View>
    );
}

const staticStyles = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 21 },
});

const createStyles = (colors) =>
    StyleSheet.create({
        eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: colors.textMuted },
        title: { fontSize: 28, fontWeight: "800", color: colors.text, marginTop: 6 },
        sub: { fontSize: 14, color: colors.textSecondary, marginTop: 5 },
    });