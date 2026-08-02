import {router} from "expo-router";
import {useEffect} from "react";
import * as Auth from "@/lib/auth";
import {LoadingIndicator} from "@/lib/components/ui";

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

	return <LoadingIndicator />;
}