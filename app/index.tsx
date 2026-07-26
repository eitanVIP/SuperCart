import {StyleSheet, Text} from "react-native";
import {Link, Slot} from "expo-router";

export default function LandingPage() {
	return (
		<>
			<Text>Hi</Text>
			<Link href="/(auth)">Log In</Link>
		</>
	);
}

const styles = StyleSheet.create({

});