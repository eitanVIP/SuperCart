import React, {useEffect, useState} from "react";
import {Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {BottomSheet, PrimaryButton, PromptModal, TagChip} from "./ui";
import {useTheme} from "@/theme/ThemeContext";
import {Product} from "@/lib/types";

function PhotoControl({ uri, onChange, styles }) {
    const [urlPromptVisible, setUrlPromptVisible] = useState(false);

    async function takePhoto() {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted)
            return Alert.alert(
                "Camera access required",
                "Allow camera access to take an item photo.",
            );
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.75,
        });
        if (!result.canceled) onChange(result.assets[0].uri);
    }

    async function choosePhoto() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.75,
        });
        if (!result.canceled) onChange(result.assets[0].uri);
    }

    return (
        <View style={staticStyles.photoRow}>
            {uri ? (
                <Image source={{ uri }} style={staticStyles.preview} />
            ) : (
                <View style={styles.previewBlank}>
                    <Text style={styles.previewLabel}>PHOTO</Text>
                </View>
            )}
            <View style={staticStyles.photoButtons}>
                <Pressable onPress={takePhoto} style={styles.photoButton}>
                    <Text style={styles.photoButtonText}>Take photo</Text>
                </Pressable>
                <Pressable onPress={choosePhoto} style={styles.photoButton}>
                    <Text style={styles.photoButtonText}>Choose photo</Text>
                </Pressable>
                <Pressable onPress={() => setUrlPromptVisible(true)} style={styles.photoButton}>
                    <Text style={styles.photoButtonText}>Use link</Text>
                </Pressable>
            </View>
            <PromptModal
                visible={urlPromptVisible}
                title="Image link"
                placeholder="https://example.com/image.jpg"
                confirmLabel="Use"
                validate={(text) => {
                    if (!text) return "Please enter a link.";
                    if (!/^https?:\/\/.+/i.test(text)) return "Please enter a valid image URL.";
                    return null;
                }}
                onCancel={() => setUrlPromptVisible(false)}
                onConfirm={(url) => {
                    onChange(url);
                    setUrlPromptVisible(false);
                }}
            />
        </View>
    );
}

function useProductForm(initial: Product = {name: "", description: "", tag: "", count: 1, isChecked: false, checkedAt: null, addedByName: "", addedByUserId: "", isRecurring: false, id: "", imageUrl: null}) {
    const [name, setName] = useState(initial.name ?? "");
    const [description, setDescription] = useState(initial.description ?? "");
    const [tag, setTag] = useState(initial.tag ?? "");
    const [count, setCount] = useState(initial.count ?? 1);
    const [isRecurring, setRecurring] = useState(initial.isRecurring ?? false);
    const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? null);

    function reset() {
        setName("");
        setDescription("");
        setTag("");
        setCount(1);
        setRecurring(false);
        setImageUrl(null);
    }

    function loadFrom(item) {
        setName(item.name);
        setDescription(item.description || "");
        setTag(item.tag || "");
        setCount(item.count || 1);
        setRecurring(item.isRecurring);
        setImageUrl(item.imageUrl || null);
    }

    return {
        name, setName,
        description, setDescription,
        tag, setTag,
        count, setCount,
        isRecurring, setRecurring,
        imageUrl, setImageUrl,
        reset,
        loadFrom,
    };
}

function ProductFormFields({ form, tags, colors, styles }) {
    return (
        <>
            <PhotoControl uri={form.imageUrl} onChange={form.setImageUrl} styles={styles} />
            <Text style={styles.label}>ITEM NAME</Text>
            <TextInput
                value={form.name}
                onChangeText={form.setName}
                placeholder="What do you need?"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
            />
            <Text style={styles.label}>
                DESCRIPTION <Text style={styles.optional}>OPTIONAL</Text>
            </Text>
            <TextInput
                value={form.description}
                onChangeText={form.setDescription}
                placeholder="Notes"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
            />
            {tags && (<>
                <Text style={styles.label}>TAG</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={staticStyles.tagRow}
                >
                    <TagChip
                        label="No tag"
                        active={form.tag === ""}
                        onPress={() => form.setTag("")}
                        colors={colors}
                    />
                    {tags.map((t) => (
                        <TagChip
                            key={t}
                            label={t}
                            active={form.tag === t}
                            onPress={() => form.setTag(t)}
                            colors={colors}
                        />
                    ))}
                </ScrollView>
            </>)}
            <Text style={styles.label}>COUNT</Text>
            <TextInput
                value={form.count.toString()}
                onChangeText={(text) => text === "" ? form.setCount(0) : form.setCount(Math.min(parseInt(text.replace(/[^0-9]/g, "")), 99))}
                placeholder="1"
                keyboardType="numeric"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
            />
            {/*<RecurringSwitch value={form.isRecurring} onChange={form.setRecurring} colors={colors} styles={styles} />*/}
        </>
    );
}

export function AddProductSheet({ visible, onCloseSheet, onAdd, allProducts, checklistProducts, onAddFromHistory, tags }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [fromHistory, setFromHistory] = useState(false);
    const form = useProductForm();

    const historyProducts = allProducts.filter((item: Product) => !checklistProducts.some((w: Product) => w.id === item.id));

    function onClose() {
        form.reset();
        setFromHistory(false);
        onCloseSheet();
    }

    function add() {
        if (!form.name) {
            Alert.alert("Item name required", "Please input a name.");
            return;
        }

        onAdd(form.name, form.description, form.count, form.imageUrl, form.isRecurring, form.tag);
        onClose();
    }

    function addFromHistory(product: Product) {
        onAddFromHistory(product);
        onClose();
    }

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            {!fromHistory && (<>
                <Text style={styles.title}>Add an item</Text>
                <Text style={styles.sub}>It will be shared with your family.</Text>
                <ProductFormFields form={form} tags={tags} colors={colors} styles={styles} />
                <PrimaryButton label="Add to list" onPress={add} />
            </>)}

            {fromHistory && (<>
                {historyProducts.length === 0 && (<>
                    <Text style={styles.title}>No history items</Text>
                </>)}
                {historyProducts.map((item: Product) => (
                    <Pressable
                        key={item.id}
                        onPress={() => addFromHistory(item)}
                        style={styles.item}
                    >
                        <View style={staticStyles.itemBody}>
                            <View style={staticStyles.itemTitleRow}>
                                <Text style={styles.itemName}>
                                    {item.name}
                                </Text>
                            </View>
                            <Text style={styles.description}>
                                {item.description === "" ? "No description" : item.description}
                            </Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </Pressable>
                ))}
            </>)}
        </BottomSheet>
    );
}

export function EditProductSheet({ item, visible, onCloseSheet, onSave, tags }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const form = useProductForm();

    useEffect(() => {
        if (visible && item) {
            form.loadFrom(item);
        }
    }, [visible, item]);

    if (!item) return null;

    function onClose() {
        form.reset();
        onCloseSheet();
    }

    function save() {
        if (!form.name) {
            Alert.alert("Item name required", "Please input a name.");
            return;
        }

        onSave(item, form.name, form.description, form.count, form.imageUrl, form.isRecurring, form.tag);
        onClose();
    }

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <Text style={styles.title}>Edit item</Text>
            <ProductFormFields form={form} tags={tags} colors={colors} styles={styles} />
            <PrimaryButton label="Save changes" onPress={save} />
        </BottomSheet>
    );
}

function RecurringSwitch({ value, onChange, colors, styles }) {
    return (
        <View style={staticStyles.switchRow}>
            <View>
                <Text style={styles.switchTitle}>Recurring item</Text>
                <Text style={styles.switchSub}>Keep this item each week</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                thumbColor={value ? colors.primary : colors.primaryLight}
            />
        </View>
    );
}

export function DetailsSheet({ item, visible, onClose, onEdit, onDelete, onDeleteUlt }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    if (!item) return null;

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={staticStyles.detailImage} />}
            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.title}>{"×" + item.count}</Text>
            </View>
            {item.description ? (
                <Text style={styles.detailText}>{item.description}</Text>
            ) : (
                <Text style={styles.detailMuted}>No description added.</Text>
            )}
            <View style={styles.metadata}>
                <Text style={styles.metadataLabel}>ADDED BY</Text>
                <Text style={styles.metadataValue}>{item.addedByName}</Text>
            </View>
            <View style={staticStyles.actions}>
                <Pressable style={styles.button} onPress={onEdit}>
                    <Text style={styles.buttonText}>Edit item</Text>
                </Pressable>
                <Pressable
                    style={styles.remove}
                    onPress={() => {
                        // Alert.alert("Delete item?", `Remove ${item.name} from this week's list or remove forever?`, [
                        //     {
                        //         text: "Cancel",
                        //         style: "cancel"
                        //     },
                        //     {
                        //         text: "Delete ultimately",
                        //         style: "destructive",
                        //         onPress: () => {
                        //             onDeleteUlt(item);
                        //             onClose();
                        //         },
                        //     },
                        //     {
                        //         text: "Delete from this week",
                        //         style: "destructive",
                        //         onPress: () => {
                        //             onDelete(item);
                        //             onClose();
                        //         },
                        //     },
                        // ]);
                        Alert.alert("Delete item?", `Remove ${item.name} from the list forever?`, [
                            {
                                text: "Cancel",
                                style: "cancel"
                            },
                            {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => {
                                    onDeleteUlt(item);
                                    onClose();
                                },
                            }
                        ]);
                    }}
                >
                    <Text style={styles.removeText}>Delete</Text>
                </Pressable>
            </View>
        </BottomSheet>
    );
}

const staticStyles = StyleSheet.create({
    sheet: {
        backgroundColor: "transparent",
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 34,
        gap: 8
    },
    photoRow: { flexDirection: "row", gap: 11, marginTop: 17, alignItems: "center" },
    preview: { height: 100, aspectRatio: 1, borderRadius: 12 },
    photoButtons: { flex: 1, gap: 7 },
    switchRow: {
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    detailImage: { aspectRatio: 1, width: "80%", alignSelf: "center", borderRadius: 16, marginBottom: 17 },
    actions: { flexDirection: "row", gap: 10, marginTop: 24 },
    itemBody: { flex: 1 },
    checkedItem: { opacity: 0.52 },
    strike: { textDecorationLine: "line-through" },
    itemTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    urlRow: { flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" },
    tagRow: { gap: 9, paddingBottom: 4 },
    dropdownRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dropdownWrap: {
        position: "relative",
        zIndex: 10,
    },
    dropdownFloating: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        marginTop: 4,
    },
});

const createStyles = (colors) =>
    StyleSheet.create({
        title: { fontSize: 24, fontWeight: "800", color: colors.text },
        sub: { fontSize: 14, color: colors.textMuted, marginTop: 5 },
        label: {
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 1,
            color: colors.textMuted,
            marginTop: 16,
            marginBottom: 7,
        },
        optional: { fontWeight: "500", color: colors.textFaint },
        input: {
            height: 50,
            borderWidth: 1,
            borderColor: colors.borderOnSheet,
            borderRadius: 12,
            paddingHorizontal: 13,
            fontSize: 15,
            color: colors.text,
        },
        previewBlank: {
            height: 100,
            aspectRatio: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.borderOnSheet,
            alignItems: "center",
            justifyContent: "center",
        },
        previewLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 1, color: colors.iconMuted },
        photoButton: {
            height: 30,
            borderRadius: 9,
            borderWidth: 1,
            borderColor: colors.borderOnSheet,
            justifyContent: "center",
            paddingHorizontal: 11,
        },
        photoButtonText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
        switchTitle: { fontSize: 15, fontWeight: "800", color: colors.text },
        switchSub: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
        detailText: { fontSize: 15, color: colors.textSecondary, marginTop: 9 },
        detailMuted: { fontSize: 15, color: colors.textFaint, marginTop: 9 },
        metadata: {
            marginTop: 23,
            padding: 15,
            borderRadius: 13,
            borderWidth: 1,
            borderColor: colors.borderOnSheet,
        },
        metadataLabel: { fontSize: 10, letterSpacing: 1, fontWeight: "800", color: colors.textMuted },
        metadataValue: { fontSize: 15, fontWeight: "800", color: colors.text, marginTop: 4 },
        button: {
            flex: 1,
            height: 50,
            borderRadius: 13,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        buttonText: { fontWeight: "800", color: colors.text },
        remove: {
            height: 50,
            paddingHorizontal: 20,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: colors.danger,
            backgroundColor: colors.dangerLight,
            alignItems: "center",
            justifyContent: "center",
        },
        removeText: { fontWeight: "800", color: colors.danger },
        item: {
            minHeight: 80,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            marginBottom: 10,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
        },
        itemName: { fontSize: 16, fontWeight: "800", color: colors.text },
        description: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
        arrow: { fontSize: 27, color: colors.iconMuted },
        byline: { fontSize: 11, color: colors.textFaint, marginTop: 6 },
        urlInput: {
            flex: 1,
            height: 42,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderLight,
            paddingHorizontal: 12,
            color: colors.text,
            fontSize: 14,
        },
        dropdownValue: { fontSize: 15, color: colors.text },
        placeholder: { fontSize: 15, color: colors.placeholder },
        dropdownChevron: { fontSize: 11, color: colors.iconMuted },
        dropdownOption: {
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
        },
        dropdownOptionText: { fontSize: 14, color: colors.text },
        dropdownOptionTextActive: { color: colors.primary, fontWeight: "700" },
        dropdownMenu: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            backgroundColor: colors.card,
            overflow: "hidden",
        },
    });