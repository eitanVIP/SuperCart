import React, { useRef, useState } from "react";
import {ProductList} from "../components/ProductList";
import ListHeader from "../components/ListHeader";
import { View } from "react-native";

export default function GroceriesScreen({products, setSheet, openDetails, toggleProduct}) {
    return (
        <View style={{ flexDirection: "column" }}>
            <ListHeader
                eyebrow="FAMILY LIST"
                title="Groceries"
                text="Your family’s shared weekly list."
            />
            <ProductList
                products={products}
                onAdd={() => setSheet("add")}
                onSelect={openDetails}
                onToggle={toggleProduct}
            />
        </View>
    );
}
