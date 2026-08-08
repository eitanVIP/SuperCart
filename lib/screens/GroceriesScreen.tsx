import React from "react";
import {ProductList, ProductListProps} from "../components/ProductList";
import ListHeader from "../components/ListHeader";
import {View} from "react-native";
import {Product} from "@/lib/types";

export default function GroceriesScreen({props, products, setSheet, toggleChecklist}: {props: ProductListProps, products: Product[], setSheet: (sheet: string) => void, toggleChecklist: any}) {
    return (
        <View style={{ flexDirection: "column", flex: 1 }}>
            <ListHeader
                title="List"
                text="Your family’s shared weekly list."
            />
            <ProductList
                props={props}
                products={products}
                isChecklist={false}
                onAdd={() => setSheet("add")}
                onToggle={() => {}}
                onToggleChecklist={toggleChecklist}
            />
        </View>
    );
}