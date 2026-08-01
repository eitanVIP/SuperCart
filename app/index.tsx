import {StyleSheet} from "react-native";
import {router} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {useEffect} from "react";
import * as Auth from "@/lib/auth";

export default function LandingPage() {
	useEffect(() => {
		const unsubscribe = Auth.onAuthStateChanged((user) => {
			if (user) {
				router.replace('/(app)');
			} else {
				router.replace('/(auth)');
			}
		});
		return unsubscribe;
	}, []);

	return (
		<SafeAreaView>
			{/*<Text>Hi</Text>*/}
			{/*<Link href="/(auth)">Log In</Link>*/}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({

});