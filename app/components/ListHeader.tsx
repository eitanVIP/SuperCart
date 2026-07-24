import {StyleSheet, View, Text} from "react-native";

export default function ListHeader({ eyebrow, title, text }) {
    return (
        <View style={styles.header}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 21 },
    eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: "#6F8176" },
    title: { fontSize: 28, fontWeight: "800", color: "#193126", marginTop: 6 },
    sub: { fontSize: 14, color: "#62766A", marginTop: 5 },
});
