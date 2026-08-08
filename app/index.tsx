import {router} from "expo-router";
import {useEffect, useState} from "react";
import {Text, View} from "react-native";
import * as Auth from "@/lib/auth";
import {LoadingIndicator} from "@/lib/components/ui";
import {checkVersion} from "@/lib/familyService";

export default function LandingPage() {
	const [isWrongVersion, setIsWrongVersion] = useState(false);
	const [updatedIsWrongVersion, setUpdatedIsWrongVersion] = useState(false);

	useEffect(() => {
		if (updatedIsWrongVersion)
			return;

		checkVersion().then((result: boolean) => {
			setIsWrongVersion(result);
			setIsWrongVersion(true);
			if (!result) {
				return;
			}

			const unsubscribe = Auth.onAuthStateChanged((user) => {
				if (user) {
					router.replace('/(app)');
				} else {
					router.replace('/(auth)');
				}
			});
			return unsubscribe;
		});

	}, []);

	return (
		isWrongVersion
			? <View style={{flex: 1, justifyContent:"center"}}>
				<Text style={{textAlign: "center", color: "#FF0000", fontSize: 40}}>Wrong version</Text>
				<Text style={{textAlign: "center", color: "#FF0000", fontSize: 20}}>Please update app</Text>
				<View style={{height: 200}} />
			</View>
			: <LoadingIndicator />
	);
}