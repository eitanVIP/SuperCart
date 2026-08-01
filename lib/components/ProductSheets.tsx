import React, {useEffect, useState} from "react";
import {Alert, Image, Pressable, StyleSheet, Switch, Text, TextInput, useWindowDimensions, View} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {BottomSheet as ExpoBottomSheet, RNHostView} from '@expo/ui';
import {PrimaryButton} from "./ui";
import {useTheme} from "@/theme/ThemeContext";

function PhotoControl({ uri, onChange, styles }) {
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
            </View>
        </View>
    );
}

export function BottomSheet({ children, visible, onClose }) {
    const { width } = useWindowDimensions();

    return (
        <ExpoBottomSheet isPresented={visible} onDismiss={onClose} snapPoints={["0%"]}>
            <RNHostView matchContents>
                <View style={[staticStyles.sheet, {width}]}>
                    {children}
                </View>
            </RNHostView>
        </ExpoBottomSheet>
    );
}

export function AddProductSheet({ visible, onCloseSheet, onAdd }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isRecurring, setRecurring] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    function onClose() {
        setImageUrl(null);
        setRecurring(false);
        setName("");
        setDescription("");
        onCloseSheet();
    }

    function add() {
        if (!name) {
            Alert.alert("Item name required", "Please input a name.");
            return
        }

        onAdd({ name: name, description: description, imageUrl: imageUrl, isRecurring: isRecurring });

        onClose();
    }

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <Text style={styles.title}>Add an item</Text>
            <Text style={styles.sub}>It will be shared with your family.</Text>
            <PhotoControl uri={imageUrl} onChange={setImageUrl} styles={styles} />
            <Text style={styles.label}>ITEM NAME</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="What do you need?"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
            />
            <Text style={styles.label}>
                DESCRIPTION <Text style={styles.optional}>OPTIONAL</Text>
            </Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Quantity, type, or notes"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
            />
            <RecurringSwitch value={isRecurring} onChange={setRecurring} colors={colors} styles={styles} />
            <PrimaryButton label="Add to list" onPress={add} />
        </BottomSheet>
    );
}

export function EditProductSheet({ item, visible, onCloseSheet, onSave }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isRecurring, setRecurring] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (visible && item) {
            setName(item.name);
            setDescription(item.description || "");
            setRecurring(item.isRecurring);
            setImageUrl(item.imageUrl || null);
        }
    }, [visible, item]);

    if (!item) return null;

    function onClose() {
        setImageUrl(null);
        setRecurring(false);
        setName("");
        setDescription("");
        onCloseSheet();
    }

    async function save() {
        if (!name) {
            Alert.alert("Item name required", "Please input a name.");
            return;
        }

        await onSave(item, {
            name: name,
            description: description,
            imageUrl,
            isRecurring,
        });

        onClose();
    }

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <Text style={styles.title}>Edit item</Text>
            <PhotoControl uri={imageUrl} onChange={setImageUrl} styles={styles} />
            <Text style={styles.label}>ITEM NAME</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Item name"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
            />
            <Text style={styles.label}>
                DESCRIPTION <Text style={styles.optional}>OPTIONAL</Text>
            </Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Quantity, type, or notes"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
            />
            <RecurringSwitch value={isRecurring} onChange={setRecurring} colors={colors} styles={styles} />
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
                thumbColor={value ? colors.primary : colors.surface}
            />
        </View>
    );
}

export function DetailsSheet({ item, visible, onClose, onEdit, onDelete }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    if (!item) return null;

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={staticStyles.detailImage} />}
            <Text style={styles.title}>{item.name}</Text>
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
                <Pressable style={styles.edit} onPress={onEdit}>
                    <Text style={styles.editText}>Edit item</Text>
                </Pressable>
                <Pressable
                    style={styles.remove}
                    onPress={() =>
                        Alert.alert("Delete item?", `Remove ${item.name} from the family list?`, [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => {
                                    onDelete(item.id);
                                    onClose();
                                },
                            },
                        ])
                    }
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
    preview: { height: 67, width: 67, borderRadius: 12 },
    photoButtons: { flex: 1, gap: 7 },
    switchRow: {
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    detailImage: { aspectRatio: 1, width: "80%", alignSelf: "center", borderRadius: 16, marginBottom: 17 },
    actions: { flexDirection: "row", gap: 10, marginTop: 24 },
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
            borderColor: colors.borderLight,
            borderRadius: 12,
            paddingHorizontal: 13,
            fontSize: 15,
            color: colors.text,
        },
        previewBlank: {
            height: 67,
            width: 67,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.borderLight,
            alignItems: "center",
            justifyContent: "center",
        },
        previewLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 1, color: colors.iconMuted },
        photoButton: {
            height: 30,
            borderRadius: 9,
            borderWidth: 1,
            borderColor: colors.border,
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
            borderColor: colors.border,
        },
        metadataLabel: { fontSize: 10, letterSpacing: 1, fontWeight: "800", color: colors.textMuted },
        metadataValue: { fontSize: 15, fontWeight: "800", color: colors.text, marginTop: 4 },
        edit: {
            flex: 1,
            height: 50,
            borderRadius: 13,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        editText: { fontWeight: "800", color: colors.onPrimary },
        remove: {
            height: 50,
            paddingHorizontal: 20,
            borderRadius: 13,
            borderWidth: 1,
            borderColor: colors.dangerLight,
            alignItems: "center",
            justifyContent: "center",
        },
        removeText: { fontWeight: "800", color: colors.danger },
    });