import React from "react";
import {ProductList} from "../components/ProductList";
import ListHeader from "../components/ListHeader";
import {View} from "react-native";

export default function ChecklistScreen({products, openDetails, toggleProduct}) {
    return (
        <View style={{ flexDirection: "column", flex: 1 }}>
            <ListHeader
                title="Checklist"
                text={`${products.filter((item) => item.isChecked).length} of ${products.length} items collected.`}
            />
            <ProductList
                products={products}
                shopping
                onAdd={() => {}}
                onSelect={openDetails}
                onToggle={toggleProduct}
            />
        </View>
    );
}