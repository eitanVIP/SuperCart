import React from "react";
import {ProductList} from "../components/ProductList";
import ListHeader from "../components/ListHeader";
import {View} from "react-native";

export default function GroceriesScreen({products, checklistProducts, refreshing, onRefresh, tags, onCreateTag, onDeleteTag, setSheet, openDetails, toggleChecklist}) {
    return (
        <View style={{ flexDirection: "column", flex: 1 }}>
            <ListHeader
                title="List"
                text="Your family’s shared weekly list."
            />
            <ProductList
                products={products}
                checklistProducts={checklistProducts}
                refreshing={refreshing}
                onRefresh={onRefresh}
                tags={tags}
                onCreateTag={onCreateTag}
                onDeleteTag={onDeleteTag}
                isChecklist={false}
                onAdd={() => setSheet("add")}
                onSelect={openDetails}
                onToggle={() => {}}
                onToggleChecklist={toggleChecklist}
            />
        </View>
    );
}