import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Field, PrimaryButton } from "../components/ui";

export function AuthScreen({ onAuthenticated }) {
	const [mode, setMode] = useState("login");
	const signup = mode === "signup";
	return (
		<SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
			<StatusBar style="dark" />
			<View style={styles.hero}>
				<View style={styles.logo}>
					<Text style={styles.logoText}>S</Text>
				</View>
				<Text style={styles.title}>SuperCart</Text>
				<Text style={styles.subtitle}>Shopping, made simple for your family.</Text>
			</View>
			<View style={styles.card}>
				<View style={styles.switcher}>
					<Text
						onPress={() => setMode("login")}
						style={[styles.switchText, !signup && styles.active]}
					>
						Log in
					</Text>
					<Text
						onPress={() => setMode("signup")}
						style={[styles.switchText, signup && styles.active]}
					>
						Sign up
					</Text>
				</View>
				{signup && <Field label="YOUR NAME" placeholder="Your name" />}
				<Field
					label="EMAIL ADDRESS"
					placeholder="you@example.com"
					keyboardType="email-address"
				/>
				<Field label="PASSWORD" placeholder="Password" secureTextEntry />
				<PrimaryButton
					label={signup ? "Create account" : "Log in"}
					onPress={() =>
						onAuthenticated({ id: "local-user", name: "You", email: "you@example.com" })
					}
				/>
			</View>
		</SafeAreaView>
	);
}
const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: "#EAF5EF" },
	hero: { alignItems: "center", paddingTop: 68, flex: 0.42 },
	logo: {
		height: 58,
		width: 58,
		borderRadius: 19,
		backgroundColor: "#177A50",
		alignItems: "center",
		justifyContent: "center",
	},
	logoText: { fontSize: 30, fontWeight: "900", color: "#FFF" },
	title: { fontSize: 29, fontWeight: "800", color: "#173426", marginTop: 13 },
	subtitle: { fontSize: 15, color: "#537061", marginTop: 6 },
	card: {
		flex: 0.58,
		backgroundColor: "#F8FCF9",
		borderTopLeftRadius: 31,
		borderTopRightRadius: 31,
		padding: 24,
	},
	switcher: {
		height: 48,
		backgroundColor: "#EAF1ED",
		borderRadius: 13,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
	},
	switchText: { color: "#6C7B72", fontWeight: "800", paddingHorizontal: 26, paddingVertical: 11 },
	active: { backgroundColor: "#FFF", color: "#177A50", borderRadius: 10, overflow: "hidden" },
});
