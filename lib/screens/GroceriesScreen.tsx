import React from "react";
import {ProductList} from "../components/ProductList";
import ListHeader from "../components/ListHeader";
import {View} from "react-native";

export default function GroceriesScreen({products, setSheet, openDetails}) {
    return (
        <View style={{ flexDirection: "column", flex: 1 }}>
            <ListHeader
                title="List"
                text="Your family’s shared weekly list."
            />
            <ProductList
                products={products}
                onAdd={() => setSheet("add")}
                onSelect={openDetails}
                onToggle={() => {}}
            />
        </View>
    );
}