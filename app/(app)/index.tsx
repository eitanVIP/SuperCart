import React, {useCallback, useRef, useState} from "react";
import {Alert, Animated, Dimensions, PanResponder, Pressable, StyleSheet, Text, View,} from "react-native";
import {LoadingIndicator, TopBar} from "@/lib/components/ui";
import {BottomNav} from "@/lib/components/BottomNav";
import {AddProductSheet, DetailsSheet, EditProductSheet} from "@/lib/components/ProductSheets";
import {SettingsScreen} from "@/lib/screens/SettingsScreen";
import {router} from "expo-router";
import GroceriesScreen from "@/lib/screens/GroceriesScreen";
import ChecklistScreen from "@/lib/screens/ChecklistScreen";
import * as Auth from "@/lib/auth";
import {getCurrentUser, readProfile, updateProfile} from "@/lib/auth";
import {
    addProductToDatabase,
    deleteProductInDatabase,
    isUserInFamily,
    leaveFamilyInDatabase,
    loadFamilyFromDatabase,
    toggleProductInDatabase,
    updateFamilyInDatabase,
    updateProductInDatabase,
} from "@/lib/familyService";
import {log} from "@/lib/util";
import {useSnackbar} from "@/context/SnackbarContext";
import {Family, Product, Profile} from "@/lib/types";
import {useTheme} from "@/theme/ThemeContext";

const { width } = Dimensions.get("window");
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export default function MainAppPage() {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [page, setPage] = useState(0);
    const [sheet, setSheet] = useState(null);
    const [selected, setSelected] = useState(null);
    const [family, setFamily] = useState<Family>(null);
    const [profile, setProfile] = useState<Profile>(null);

    const { showSnackbar } = useSnackbar();

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const newFamily = await loadFamilyFromDatabase();
            setFamily(newFamily);
        } catch (err) {
            log("Main App", "failed to refresh: " + err.message, showSnackbar);
        } finally {
            setRefreshing(false);
        }
    }, []);

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
                router.replace("/(auth)/family-gate-page");
                return;
            }

            loadFamilyFromDatabase().then(family => {
                setFamily(family);
            }).catch(err => {
                log("Main App", "failed to load family: " + err.message, showSnackbar);
                router.replace("/(auth)/family-gate-page");
            });
        }).catch(err => {
            log("Main App", "failed to check family: " + err.message, showSnackbar);
            router.replace("/(auth)/family-gate-page");
        });

        return (
            <LoadingIndicator />
        );
    }

    if (!profile) {
        readProfile().then((profile: Profile) => {
            setProfile(profile);
        }).catch((err) => {
            log("Main App", "failed to load profile: " + err.message, showSnackbar);
        });

        return (
            <LoadingIndicator />
        );
    }

    return (
        <>
            <TopBar
                title={"SuperCart"}
                onAction={signOut}
            />

            <View style={staticStyles.pagerViewport} {...pan.panHandlers}>
                <Animated.View style={[staticStyles.pages, { transform: [{ translateX }] }]}>
                    <Page>
                        <GroceriesScreen
                            products={family.allProducts}
                            checklistProducts={family.checklistProducts}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            setSheet={setSheet}
                            openDetails={openDetails}
                            toggleChecklist={() => {}}
                        />
                    </Page>
                    <Page>
                        <ChecklistScreen
                            products={family.checklistProducts}
                            checklistProducts={family.checklistProducts}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            openDetails={openDetails}
                            toggleProduct={(product: Product) => {
                                const checkedAt: number | null = !product.isChecked ? Date.now() : null;
                                const updatedProduct: Product = {
                                    id: product.id,
                                    name: product.name,
                                    description: product.description,
                                    count: product.count,
                                    imageUrl: product.imageUrl,
                                    addedByUserId: product.addedByUserId,
                                    addedByName: product.addedByName,
                                    isRecurring: product.isRecurring,
                                    isChecked: !product.isChecked,
                                    checkedAt: checkedAt,
                                };
                                const originalFamily = family;

                                setFamily({
                                    ...family,
                                    allProducts: family.allProducts.map(p =>
                                        p.id === updatedProduct.id ? updatedProduct : p
                                    ),
                                    checklistProducts: family.checklistProducts.map(p =>
                                        p.id === updatedProduct.id ? updatedProduct : p
                                    ),
                                });

                                toggleProductInDatabase(family, product).catch(err => {
                                    setFamily(originalFamily);
                                    log("Main App", "Failed to toggle product: " + err.message, showSnackbar);
                                });
                            }}
                        />
                    </Page>
                    <Page>
                        <SettingsScreen
                            family={family}
                            onLogout={signOut}
                            onSaveFamily={(name: string, weekStartDay: string) => {
                                updateFamilyInDatabase(family, name, weekStartDay).then(newFamily => {
                                    setFamily(newFamily);
                                    log("Settings", "successfully updated family", showSnackbar);
                                }).catch(err => {
                                    log("Settings", "failed to update family: " + err.message, showSnackbar);
                                });
                            }}
                            onLeaveFamily={() => {
                                leaveFamilyInDatabase().then(() => {
                                    setFamily(null);
                                    router.replace("/(auth)/family-gate-page");
                                }).catch(err => {
                                    log("Settings", "failed to leave family: " + err.message, showSnackbar);
                                });
                            }}
                            profile={profile}
                            onSaveProfile={(profile: Profile, password: string) => {
                                Auth.verifyPassword(password).then(result => {
                                    if (!result) {
                                        Alert.alert("Wrong password", "Enter the correct current password");
                                        return;
                                    }

                                    updateProfile(profile.name, profile.photoUrl).then(() => {
                                        setProfile({name: profile.name, photoUrl: profile.photoUrl});
                                        log("Settings", "successfully updated profile", showSnackbar);
                                    }).catch(err => {
                                        log("Settings", "failed to update profile: " + err.message, showSnackbar);
                                    });
                                }).catch((err) => {
                                    log("Settings", "failed to verify password: " + err.message, showSnackbar);
                                });
                            }}
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
                onAdd={(name: string, description: string, count: number, imageUrl: string, isRecurring: boolean) => {
                    addProductToDatabase(family, name, description, count, imageUrl, isRecurring).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully added new product", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to add product: " + err.message, showSnackbar);
                    });
                }}
                allProducts={family.allProducts}
                checklistProducts={family.checklistProducts}
                onAddFromHistory={(product: Product) => {
                    // addProductToThisWeekInDatabase(family, product).then(newFamily => {
                    //     setFamily(newFamily);
                    //     log("Main App", "successfully added product", showSnackbar);
                    // }).catch(err => {
                    //     log("Main App", "failed to add product from history: " + err.message, showSnackbar);
                    // });
                }}
            />
            <DetailsSheet
                item={selected}
                visible={sheet === "details"}
                onClose={() => setSheet(null)}
                onEdit={() => setSheet("edit")}
                onDelete={(product: Product) => {
                    deleteProductInDatabase(family, product, false).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully deleted product", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to delete product: " + err.message, showSnackbar);
                    });
                }}
                onDeleteUlt={(product: Product) => {
                    deleteProductInDatabase(family, product, true).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully deleted product forever", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to delete product: " + err.message, showSnackbar);
                    });
                }}
            />
            <EditProductSheet
                item={selected}
                visible={sheet === "edit"}
                onCloseSheet={() => setSheet(null)}
                onSave={(product: Product, name: string, description: string, count: number, imageUrl: string, isRecurring: boolean) => {
                    updateProductInDatabase(family, product, name, description, count, imageUrl, isRecurring).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully updated product", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to edit product: " + err.message, showSnackbar);
                    });
                }}
            />
        </>
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
        fabText: { color: colors.text, fontSize: 31, fontWeight: "300", lineHeight: 34 },
    });