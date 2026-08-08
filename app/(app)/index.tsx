import React, {useCallback, useRef, useState} from "react";
import {Alert, Dimensions, Pressable, StyleSheet, Text, View,} from "react-native";
import {LoadingIndicator, SearchBar, TopBar} from "@/lib/components/ui";
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
    createTagInDatabase,
    deleteProductInDatabase,
    deleteTagInDatabase,
    isUserInFamily,
    leaveFamilyInDatabase,
    loadFamilyFromDatabase,
    renameTagInDatabase,
    setProductToChecklistInDatabase,
    toggleProductInDatabase,
    updateFamilyInDatabase,
    updateProductInDatabase,
} from "@/lib/familyService";
import {log} from "@/lib/util";
import {useSnackbar} from "@/context/SnackbarContext";
import {Family, Product, Profile} from "@/lib/types";
import {useTheme} from "@/theme/ThemeContext";
import PagerView from "react-native-pager-view";
import {ProductListProps} from "@/lib/components/ProductList";

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
    const [searchQuery, setSearchQuery] = useState("");

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

    const pagerRef = useRef<PagerView>(null);

    const goTo = (nextPage: number) => {
        const safePage = clamp(nextPage, 0, 2);
        setPage(safePage);
        pagerRef.current?.setPage(safePage);
    };

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

    const pageProps: ProductListProps = {
        products: family.allProducts,
        checklistProducts: family.checklistProducts,
        refreshing: refreshing,
        onRefresh: onRefresh,
        tags: family.tags,
        onCreateTag: (tag: string) => {
            createTagInDatabase(family, tag).then(newFamily => {
                setFamily(newFamily);
                log("Main App", "successfully created tag", showSnackbar);
            }).catch(err => {
                log("Main App", "failed to create tag: " + err.message, showSnackbar);
            });
        },
        onDeleteTag: (tag: string) => {
            deleteTagInDatabase(family, tag).then(newFamily => {
                setFamily(newFamily);
                log("Main App", "successfully deleted tag", showSnackbar);
            }).catch(err => {
                log("Main App", "failed to delete tag: " + err.message, showSnackbar);
            });
        },
        onRenameTag: (tag: string, newName: string) => {
            renameTagInDatabase(family, tag, newName).then(newFamily => {
                setFamily(newFamily);
                log("Main App", "successfully renamed tag", showSnackbar);
            }).catch(err => {
                log("Main App", "failed to rename tag: " + err.message, showSnackbar);
            });
        },
        onSelect: openDetails,
        searchQuery: searchQuery,
    };

    return (
        <>
            <TopBar title={"SuperCart"}>
                {page < 2 &&
                    <SearchBar value={searchQuery} onChangeText={setSearchQuery} colors={colors} placeholder="Search products..." />
                }
            </TopBar>

            <PagerView
                ref={pagerRef}
                style={staticStyles.pagerViewport}
                initialPage={0}
                offscreenPageLimit={2} // Keeps pages pre-rendered in memory so swipes don't lag
                onPageSelected={(e) => {
                    setPage(e.nativeEvent.position);
                }}
            >
                <Page active={page === 0}>
                    <GroceriesScreen
                        props={pageProps}
                        setSheet={setSheet}
                        toggleChecklist={(product: Product) => {
                            function isProductInChecklist(item: Product): boolean {
                                return family.checklistProducts.some((w: Product) => w.id === item.id);
                            }

                            const originalFamily = family;

                            if (!isProductInChecklist(product)) {
                                setFamily({
                                    ...family,
                                    checklistProducts: [...family.checklistProducts, product],
                                });
                            } else {
                                const updatedProduct: Product = {
                                    ...product,
                                    isChecked: false,
                                    checkedAt: null,
                                };

                                setFamily({
                                    ...family,
                                    allProducts: family.allProducts.map(p => p.id === product.id ? updatedProduct : p),
                                    checklistProducts: family.checklistProducts.filter(p => p.id !== product.id),
                                });
                            }

                            setProductToChecklistInDatabase(family, product, !isProductInChecklist(product)).catch(err => {
                                setFamily(originalFamily);
                                log("Main App", "failed to toggle product: " + err.message, showSnackbar);
                            });
                        }}
                    />
                </Page>
                <Page active={page === 1}>
                    <ChecklistScreen
                        props={pageProps}
                        toggleProduct={(product: Product) => {
                            const checkedAt: number | null = !product.isChecked ? Date.now() : null;
                            const updatedProduct: Product = {
                                ...product,
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
                                log("Main App", "failed to toggle product: " + err.message, showSnackbar);
                            });
                        }}
                    />
                </Page>
                <Page active={page === 2}>
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
            </PagerView>

            {page < 1 && (
                <Pressable style={styles.fab} onPress={() => setSheet("add")}>
                    <Text style={styles.fabText}>+</Text>
                </Pressable>
            )}

            <BottomNav index={page} onChange={goTo} />

            <AddProductSheet
                visible={sheet === "add"}
                onCloseSheet={() => setSheet(null)}
                onAdd={(name: string, description: string, count: number, imageUrl: string, isRecurring: boolean, tag: string) => {
                    addProductToDatabase(family, name, description, count, imageUrl, isRecurring, tag).then(newFamily => {
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
                tags={family.tags}
                onCreateTag={(tag: string) => {
                    createTagInDatabase(family, tag).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully created tag", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to create tag: " + err.message, showSnackbar);
                    });
                }}
                onDeleteTag={(tag: string) => {
                    deleteTagInDatabase(family, tag).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully deleted tag", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to delete tag: " + err.message, showSnackbar);
                    });
                }}
                onRenameTag={(tag: string, newName: string) => {
                    renameTagInDatabase(family, tag, newName).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully renamed tag", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to rename tag: " + err.message, showSnackbar);
                    });
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
                onSave={(product: Product, name: string, description: string, count: number, imageUrl: string, isRecurring: boolean, tag: string) => {
                    updateProductInDatabase(family, product, name, description, count, imageUrl, isRecurring, tag).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully updated product", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to edit product: " + err.message, showSnackbar);
                    });
                }}
                tags={family.tags}
                onCreateTag={(tag: string) => {
                    createTagInDatabase(family, tag).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully created tag", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to create tag: " + err.message, showSnackbar);
                    });
                }}
                onDeleteTag={(tag: string) => {
                    deleteTagInDatabase(family, tag).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully deleted tag", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to delete tag: " + err.message, showSnackbar);
                    });
                }}
                onRenameTag={(tag: string, newName: string) => {
                    renameTagInDatabase(family, tag, newName).then(newFamily => {
                        setFamily(newFamily);
                        log("Main App", "successfully renamed tag", showSnackbar);
                    }).catch(err => {
                        log("Main App", "failed to rename tag: " + err.message, showSnackbar);
                    });
                }}
            />
        </>
    );
}

function Page({ children, active }: { children: React.ReactNode; active: boolean }) {
    return (
        <View
            style={staticStyles.page}
            pointerEvents={active ? "auto" : "none"}
        >
            {children}
        </View>
    );
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
        fabText: { color: colors.textOnPrimary, fontSize: 31, fontWeight: "300", lineHeight: 34 },
    });