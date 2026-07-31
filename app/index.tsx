import {StyleSheet, Text} from "react-native";
import {Link, router} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {useEffect} from "react";
import * as Auth from "@/lib/auth";

export default function LandingPage() {
	useEffect(() => {
		if (Auth.getCurrentUser()) {
			router.push('/(app)');
		}
	}, []);
	if (Auth.getCurrentUser())
		return null;

	return (
		<SafeAreaView>
			<Text>Hi</Text>
			<Link href="/(auth)">Log In</Link>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({

});