import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TopBar } from "../components/ui";
import { BottomNav } from "../components/BottomNav";
import { ProductList } from "../components/ProductList";
import { AddProductSheet, DetailsSheet, EditProductSheet } from "../components/ProductSheets";
import { FamilyManagementSheet } from "../components/FamilyManagementSheet";
import { SettingsScreen } from "../screens/SettingsScreen";
import { useProducts } from "../hooks/useProducts";
import ListHeader from "../components/ListHeader";
import {Slot} from "expo-router";
import GroceriesScreen from "../screens/GroceriesScreen";
import ChecklistScreen from "../screens/ChecklistScreen";

const { width } = Dimensions.get("window");
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export function MainAppLayout({ session, family, onLogout, onLeaveFamily }) {
    const [page, setPage] = useState(0);
    const [sheet, setSheet] = useState(null);
    const [selected, setSelected] = useState(null);
    const { products, addProduct, toggleProduct, deleteProduct, editProduct } = useProducts(
        family.id,
        session,
    );

    const translateX = useRef(new Animated.Value(0)).current;
    const pageRef = useRef(0);
    const goTo = (nextPage) => {
        const safePage = clamp(nextPage, 0, 2);
        pageRef.current = safePage;
        setPage(safePage);
        Animated.spring(translateX, {
            toValue: -safePage * width,
            useNativeDriver: true,
            damping: 22,
            stiffness: 230,
            mass: 0.7,
        }).start();
    };

    const pan = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) =>
                Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
            onPanResponderMove: (_, gesture) =>
                translateX.setValue(clamp(-pageRef.current * width + gesture.dx, -2 * width, 0)),
            onPanResponderRelease: (_, gesture) => {
                const change =
                    gesture.dx < -width * 0.18 || gesture.vx < -0.45
                        ? 1
                        : gesture.dx > width * 0.18 || gesture.vx > 0.45
                            ? -1
                            : 0;
                goTo(pageRef.current + change);
            },
            onPanResponderTerminate: () => goTo(pageRef.current),
        }),
    ).current;

    const openDetails = (item) => {
        setSelected(item);
        setSheet("details");
    };

    return (
        <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
            <StatusBar style="dark" />
            <TopBar
                title={page === 0 ? "SuperCart" : page === 1 ? "Shopping mode" : "SuperCart"}
                action={page === 2 ? "Log out" : null}
                onAction={onLogout}
            />

            <View style={styles.pagerViewport} {...pan.panHandlers}>
                <Animated.View style={[styles.pages, { transform: [{ translateX }] }]}>
                    <GroceriesScreen
                        products={products}
                        setSheet={setSheet}
                        openDetails={openDetails}
                        toggleProduct={toggleProduct}
                    />
                    <ChecklistScreen
                        products={products}
                        openDetails={openDetails}
                        toggleProduct={toggleProduct}
                    />
                    <SettingsScreen
                        family={family}
                        onManageFamily={() => setSheet("family")}
                        onLogout={onLogout}
                    />
                </Animated.View>
            </View>

            {page < 2 && (
                <Pressable style={styles.fab} onPress={() => setSheet("add")}>
                    <Text style={styles.fabText}>+</Text>
                </Pressable>
            )}

            <BottomNav index={page} onChange={goTo} />

            <AddProductSheet
                visible={sheet === "add"}
                onClose={() => setSheet(null)}
                onAdd={addProduct}
            />
            <DetailsSheet
                item={selected}
                visible={sheet === "details"}
                onClose={() => setSheet(null)}
                onEdit={() => setSheet("edit")}
                onDelete={deleteProduct}
            />
            <EditProductSheet
                item={selected}
                visible={sheet === "edit"}
                onClose={() => setSheet(null)}
                onSave={editProduct}
            />
            <FamilyManagementSheet
                visible={sheet === "family"}
                family={family}
                onClose={() => setSheet(null)}
                onLeave={() => {
                    setSheet(null);
                    onLeaveFamily();
                }}
            />
        </SafeAreaView>
    );
}
function Page({ children }) {
    return <View style={styles.page}>{children}</View>;
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F6FAF7" },
    pagerViewport: { flex: 1, overflow: "hidden" },
    pages: { flex: 1, flexDirection: "row", width: width * 3 },
    page: { width, flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 21 },
    eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: "#6F8176" },
    title: { fontSize: 28, fontWeight: "800", color: "#193126", marginTop: 6 },
    sub: { fontSize: 14, color: "#62766A", marginTop: 5 },
    fab: {
        position: "absolute",
        bottom: 88,
        right: 21,
        width: 57,
        height: 57,
        borderRadius: 19,
        backgroundColor: "#177A50",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#0B3E26",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    fabText: { color: "#FFF", fontSize: 31, fontWeight: "300", lineHeight: 34 },
});
