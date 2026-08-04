import React from "react";
import {ProductList} from "../components/ProductList";
import ListHeader from "../components/ListHeader";
import {View} from "react-native";

export default function ChecklistScreen({products, checklistProducts, refreshing, onRefresh, tags, onCreateTag, onDeleteTag, openDetails, toggleProduct}) {
    return (
        <View style={{ flexDirection: "column", flex: 1 }}>
            <ListHeader
                title="Checklist"
                text={`${products.filter((item) => item.isChecked).length} of ${products.length} items collected.`}
            />
            <ProductList
                products={products}
                checklistProducts={checklistProducts}
                refreshing={refreshing}
                onRefresh={onRefresh}
                tags={tags}
                onCreateTag={onCreateTag}
                onDeleteTag={onDeleteTag}
                isChecklist={true}
                onAdd={() => {}}
                onSelect={openDetails}
                onToggle={toggleProduct}
                onToggleChecklist={() => {}}
            />
        </View>
    );
}