import React, {useMemo, useState} from "react";
import {Alert, Keyboard, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from "react-native";
import {useTheme} from "@/theme/ThemeContext";
import {PromptModal, TagsBar} from "@/lib/components/ui";
import {Product} from "@/lib/types";

export interface ProductListProps {
    checklistProducts: Product[];
    refreshing: boolean;
    onRefresh: () => void;
    tags: string[];
    onCreateTag: (tag: string) => void;
    onDeleteTag: (tag: string) => void;
    onRenameTag: (tag: string, newName: string) => void;
    onSelect: (product: Product) => void;
    searchQuery: string;
}

export function ProductList({props, products, isChecklist, onAdd, onToggle, onToggleChecklist}: {props: ProductListProps, products: Product[], isChecklist: boolean, onAdd: any, onToggle: any, onToggleChecklist: any}) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [selectedTags, setSelectedTags] = useState([]); // empty = "All"
    const [tagCreateModalVisible, setTagCreateModalVisible] = useState(false);
    const [tagRenameModalVisible, setTagRenameModalVisible] = useState(false);
    const [selectedRenameTag, setSelectedRenameTag] = useState("");

    function toggleTag(tagId) {
        setSelectedTags((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
        );
    }

    const visible = useMemo(
        () =>
            products.filter(
                (item) =>
                    (selectedTags.length === 0 || selectedTags.includes(item.tag || "")) && (props.searchQuery == null || props.searchQuery.length === 0 || item.name.includes(props.searchQuery)),
            ),
        [products, selectedTags, props.searchQuery],
    );

    const sections = useMemo(() => {
        const groups = new Map();

        for (const item of visible) {
            let key = item.tag || "";
            if (key !== "" && !props.tags.includes(key)) {
                key = ""; // orphaned tag — treat as untagged until next reload
            }
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(item);
        }

        const order = ["", ...props.tags];
        const keys = [...groups.keys()].sort((a, b) => order.indexOf(a) - order.indexOf(b));

        return keys.map((key) => ({
            key,
            title: key === "" ? "UNTAGGED" : key.toUpperCase(),
            data: groups.get(key),
        }));
    }, [visible, props.tags]);

    function isProductInChecklist(item) {
        return props.checklistProducts.some((w) => w.id === item.id);
    }

    function handleCreateTag(name) {
        setTagCreateModalVisible(false);
        props.onCreateTag(name);
    }

    function handleRenameTag(name) {
        setTagRenameModalVisible(false);
        props.onRenameTag(selectedRenameTag, name);
    }

    function handleLongPressTag(tag) {
        Alert.alert(
            "Tag options",
            `Remove "${tag}"? Items with this tag will become untagged. Or rename "${tag}"? Items with this tag will be updated`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Rename",
                    style: "default",
                    onPress: () => {
                        setSelectedTags((prev) => prev.filter((t) => t !== tag));
                        setSelectedRenameTag(tag);
                        setTagRenameModalVisible(true);
                    },
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        setSelectedTags((prev) => prev.filter((t) => t !== tag));
                        props.onDeleteTag(tag);
                    },
                },
            ],
        );
    }

    return (
        <View style={staticStyles.root}>
            <TagsBar
                tags={props.tags}
                selectedTags={selectedTags}
                onToggleTag={toggleTag}
                onSelectAllNone={() => setSelectedTags([])}
                isAllTag={true}
                onAddPress={() => setTagCreateModalVisible(true)}
                onLongPressTag={handleLongPressTag}
                styles={styles}
            />
            <PromptModal
                visible={tagCreateModalVisible}
                title="New Tag"
                placeholder="Tag name"
                confirmLabel="Create"
                cancelLabel="Cancel"
                validate={(value) => (value.trim().length > 0 ? null : "Tag name required")}
                onCancel={() => setTagCreateModalVisible(false)}
                onConfirm={handleCreateTag}
            />
            <PromptModal
                visible={tagRenameModalVisible}
                title="Rename Tag"
                placeholder="Tag name"
                initialValue={selectedRenameTag}
                confirmLabel="Rename"
                cancelLabel="Cancel"
                validate={(value) => (value.trim().length > 0 ? null : "Tag name required")}
                onCancel={() => setTagRenameModalVisible(false)}
                onConfirm={handleRenameTag}
            />
            <ScrollView
                style={staticStyles.listScroll}
                contentContainerStyle={staticStyles.list}
                refreshControl={
                    <RefreshControl refreshing={props.refreshing} onRefresh={props.onRefresh} />
                }
                onScrollBeginDrag={Keyboard.dismiss}
            >
                {visible.length === 0 ? (
                    <EmptyState shopping={isChecklist} onAdd={onAdd} styles={styles} />
                ) : (
                    sections.map((section) => (
                        <React.Fragment key={section.key}>
                            <Text style={styles.section}>{section.title}</Text>
                            {section.data.map((item) => (
                                <ProductRow
                                    key={item.id}
                                    item={item}
                                    isInChecklist={isProductInChecklist(item)}
                                    shopping={isChecklist}
                                    onSelect={() => props.onSelect(item)}
                                    onToggle={() => onToggle(item)}
                                    onToggleChecklist={() => onToggleChecklist(item)}
                                    styles={styles}
                                />
                            ))}
                        </React.Fragment>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

function ProductRow({ item, isInChecklist, shopping, onSelect, onToggle, onToggleChecklist, styles }) {
    return (
        <Pressable
            onPress={onSelect}
            style={[styles.item, shopping && item.isChecked && staticStyles.checkedItem]}
        >
            {shopping && (
                <Pressable
                    onPress={onToggle}
                    hitSlop={10}
                    style={[styles.checkbox, item.isChecked && styles.checkboxActive]}
                >
                    {item.isChecked && <Text style={styles.check}>✓</Text>}
                </Pressable>
            )}
            <View style={staticStyles.itemBody}>
                <View style={staticStyles.nameGroup}>
                    <Text
                        style={[styles.itemName, shopping && item.isChecked && staticStyles.strike]}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    {item.isRecurring && <Text style={styles.recurring}>RECURRING</Text>}
                </View>
                <Text style={[styles.description, shopping && item.isChecked && staticStyles.strike]}>
                    {item.description === "" ? "No description" : item.description}
                </Text>
                <Text style={styles.byline}>Added by {item.addedByName}</Text>
            </View>

            {!shopping && (
                <View style={staticStyles.rightBottomRow}>
                    <Pressable
                        onPress={onToggleChecklist}
                        hitSlop={10}
                        style={[styles.checklistToggle, isInChecklist && styles.checklistToggleActive]}
                    >
                        <View style={[styles.checklistToggleKnob, isInChecklist && styles.checklistToggleKnobActive]} />
                    </Pressable>
                    <Text style={styles.arrow}>›</Text>
                </View>
            )}

            <Text style={styles.countStyle}>×{item.count}</Text>
        </Pressable>
    );
}

function EmptyState({ shopping, onAdd, styles }) {
    return (
        <View style={staticStyles.empty}>
            <View style={styles.emptyMark}>
                <View style={styles.emptyLine} />
                <View style={styles.emptyLine} />
                <View style={styles.emptyLine} />
            </View>
            <Text style={styles.emptyTitle}>
                {shopping ? "Your checklist is clear" : "Your list is empty"}
            </Text>
            <Text style={styles.emptyText}>
                {shopping
                    ? "Items your family adds will appear here."
                    : "Add the first item your family needs this week."}
            </Text>
            {!shopping && (
                <Pressable onPress={onAdd} style={styles.emptyButton}>
                    <Text style={styles.emptyButtonText}>Add first item</Text>
                </Pressable>
            )}
        </View>
    );
}

const staticStyles = StyleSheet.create({
    root: { flex: 1 },
    list: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 110 },
    listScroll: { flex: 1 },
    checkedItem: { opacity: 0.52 },
    nameGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    strike: { textDecorationLine: "line-through" },
    empty: { paddingTop: 90, alignItems: "center", paddingHorizontal: 34 },
    rightColumn: {
        width: 90,
        alignItems: "flex-end",
        justifyContent: "space-between",
        alignSelf: "stretch",
    },
    itemBody: { flex: 1, marginRight: 8 },
    rightBottomRow: {
        flexDirection: "row",
        alignItems: "center",
    },
});

const createStyles = (colors) =>
    StyleSheet.create({
        filter: {
            height: 37,
            paddingHorizontal: 15,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.borderLight,
            backgroundColor: colors.surface,
            justifyContent: "center",
        },
        filterActive: { backgroundColor: colors.primaryLighter, borderColor: colors.border },
        filterText: { fontSize: 13, color: colors.textSecondary, fontWeight: "700" },
        filterTextActive: { color: colors.primaryDark },
        section: {
            fontSize: 10,
            letterSpacing: 1.2,
            fontWeight: "800",
            color: colors.textMuted,
            marginTop: 12,
            marginBottom: 9,
        },
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
            position: "relative",
        },
        checkbox: {
            width: 27,
            height: 27,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: colors.checkboxBorder,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
        },
        checkboxActive: { backgroundColor: colors.checkboxFilled, borderColor: colors.checkboxFilled },
        check: { color: colors.onPrimary, fontWeight: "900", fontSize: 16 },
        itemName: { fontSize: 16, fontWeight: "800", color: colors.text },
        recurring: {
            fontSize: 8,
            letterSpacing: 0.6,
            fontWeight: "900",
            color: colors.primary,
            backgroundColor: colors.primaryLighter,
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 5,
        },
        description: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
        byline: { fontSize: 11, color: colors.textFaint, marginTop: 6 },
        arrow: { fontSize: 27, color: colors.iconMuted },
        emptyMark: {
            width: 62,
            height: 62,
            borderRadius: 18,
            backgroundColor: colors.primaryLighter,
            padding: 15,
            gap: 6,
            marginBottom: 17,
        },
        emptyLine: { height: 5, borderRadius: 3, backgroundColor: colors.primaryLight },
        emptyTitle: { fontSize: 19, fontWeight: "800", color: colors.text },
        emptyText: {
            fontSize: 14,
            color: colors.textMuted,
            lineHeight: 20,
            textAlign: "center",
            marginTop: 8,
        },
        emptyButton: {
            marginTop: 19,
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: colors.primary,
        },
        emptyButtonText: { color: colors.onPrimary, fontWeight: "800" },
        checklistToggle: {
            width: 44,
            height: 26,
            borderRadius: 13,
            backgroundColor: colors.borderLight,
            padding: 3,
            justifyContent: "center",
            marginRight: 12,
        },
        checklistToggleActive: {
            backgroundColor: colors.primary,
        },
        checklistToggleKnob: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.card,
            alignSelf: "flex-start",
        },
        checklistToggleKnobActive: {
            alignSelf: "flex-end",
        },
        countStyle: {
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 13,
            fontWeight: "700",
            color: colors.textMuted,
        },
    });