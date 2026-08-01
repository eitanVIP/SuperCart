import React, {useRef, useState} from "react";
import {Animated, Dimensions, PanResponder, Pressable, StyleSheet, Text, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {LoadingIndicator, TopBar} from "@/lib/components/ui";
import {BottomNav} from "@/lib/components/BottomNav";
import {AddProductSheet, DetailsSheet, EditProductSheet} from "@/lib/components/ProductSheets";
import {FamilyManagementSheet} from "@/lib/components/FamilyManagementSheet";
import {SettingsScreen} from "@/lib/screens/SettingsScreen";
import {router} from "expo-router";
import GroceriesScreen from "@/lib/screens/GroceriesScreen";
import ChecklistScreen from "@/lib/screens/ChecklistScreen";
import * as Auth from "@/lib/auth";
import {getCurrentUser} from "@/lib/auth";
import {
    addProductToDatabase,
    deleteProductInDatabase,
    isUserInFamily,
    loadFamilyFromDatabase,
    updateProductInDatabase,
} from "@/lib/familyService";
import {log} from "@/lib/util";
import {useSnackbar} from "@/context/SnackbarContext";
import {Family, Product} from "@/lib/types";
import {useTheme} from "@/theme/ThemeContext";

const { width } = Dimensions.get("window");
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export default function MainApp() {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [page, setPage] = useState(0);
    const [sheet, setSheet] = useState(null);
    const [selected, setSelected] = useState(null);
    const [family, setFamily] = useState<Family>(null);

    const { showSnackbar } = useSnackbar();

    function signOut() {
        Auth.signOut();
        router.replace("/(auth)");
    }

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

    if (!getCurrentUser()) {
        router.replace("/(auth)");
        return (<></>);
    }

    if (!family) {
        isUserInFamily().then(result => {
            if (!result) {
                router.replace("/(auth)/family-gate");
                return;
            }

            loadFamilyFromDatabase().then(family => {
                setFamily(family);
            }).catch(err => {
                log("Main App", "failed to load family: " + err.message, showSnackbar);
                router.replace("/(auth)/family-gate");
            });
        }).catch(err => {
            log("Main App", "failed to check family: " + err.message, showSnackbar);
            router.replace("/(auth)/family-gate");
        });

        return (
            <LoadingIndicator />
        );
    }

    return (
        <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
            <StatusBar style="dark" />
            <TopBar
                title={"SuperCart"}
                action={page === 2 ? "Log out" : null}
                onAction={signOut}
            />

            <View style={staticStyles.pagerViewport} {...pan.panHandlers}>
                <Animated.View style={[staticStyles.pages, { transform: [{ translateX }] }]}>
                    <Page>
                        <GroceriesScreen
                            products={family.weekProducts}
                            setSheet={setSheet}
                            openDetails={openDetails}
                            toggleProduct={() => {}}
                        />
                    </Page>
                    <Page>
                        <ChecklistScreen
                            products={family.weekProducts}
                            openDetails={openDetails}
                            toggleProduct={() => {}}
                        />
                    </Page>
                    <Page>
                        <SettingsScreen
                            family={family}
                            onManageFamily={() => setSheet("family")}
                            onLogout={signOut}
                        />
                    </Page>
                </Animated.View>
            </View>

            {page < 1 && (
                <Pressable style={styles.fab} onPress={() => setSheet("add")}>
                    <Text style={styles.fabText}>+</Text>
                </Pressable>
            )}

            <BottomNav index={page} onChange={goTo} />

            <AddProductSheet
                visible={sheet === "add"}
                onCloseSheet={() => setSheet(null)}
                onAdd={(product: { name: string; description: string; imageUrl: string; isRecurring: boolean; }) => {
                    addProductToDatabase(family, product.name, product.description, product.imageUrl, product.isRecurring).then(newFamily => {
                        setFamily(newFamily);
                    }).catch(err => {
                        log("Main App", "failed to add product: " + err.message, showSnackbar);
                    });
                }}
            />
            <DetailsSheet
                item={selected}
                visible={sheet === "details"}
                onClose={() => setSheet(null)}
                onEdit={() => setSheet("edit")}
                onDelete={(product: Product) => {
                    deleteProductInDatabase(family, product.id, false).then(newFamily => {
                        setFamily(newFamily);
                    }).catch(err => {
                        log("Main App", "failed to delete product: " + err.message, showSnackbar);
                    });
                }}
                onDeleteUlt={(product: Product) => {
                    deleteProductInDatabase(family, product.id, true).then(newFamily => {
                        setFamily(newFamily);
                    }).catch(err => {
                        log("Main App", "failed to delete product: " + err.message, showSnackbar);
                    });
                }}
            />
            <EditProductSheet
                item={selected}
                visible={sheet === "edit"}
                onCloseSheet={() => setSheet(null)}
                onSave={(product: Product, newData: { name: string; description: string; imageUrl: string; isRecurring: boolean; }) => {
                    updateProductInDatabase(family, product, newData.name, newData.description, newData.imageUrl, newData.isRecurring).then(newFamily => {
                        setFamily(newFamily);
                    }).catch(err => {
                        log("Main App", "failed to edit product: " + err.message, showSnackbar);
                    });
                }}
            />
            <FamilyManagementSheet
                visible={sheet === "family"}
                family={family}
                onClose={() => setSheet(null)}
                onLeave={() => {
                    setSheet(null);
                    () => {}
                }}
            />
        </SafeAreaView>
    );
}
function Page({ children }) {
    return <View style={staticStyles.page}>{children}</View>;
}

const staticStyles = StyleSheet.create({
    pagerViewport: { flex: 1, overflow: "hidden" },
    pages: { flex: 1, flexDirection: "row", width: width * 3 },
    page: { width, flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 21 },
});

const createStyles = (colors) =>
    StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.background },
        eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: colors.textMuted },
        title: { fontSize: 28, fontWeight: "800", color: colors.text, marginTop: 6 },
        sub: { fontSize: 14, color: colors.textSecondary, marginTop: 5 },
        fab: {
            position: "absolute",
            bottom: 88,
            right: 21,
            width: 57,
            height: 57,
            borderRadius: 19,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: colors.shadow,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 6,
        },
        fabText: { color: colors.onPrimary, fontSize: 31, fontWeight: "300", lineHeight: 34 },
    });