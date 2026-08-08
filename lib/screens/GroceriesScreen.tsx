import React from "react";
import {ProductList, ProductListProps} from "../components/ProductList";
import ListHeader from "../components/ListHeader";
import {View} from "react-native";

export default function GroceriesScreen({props, setSheet, toggleChecklist}: {props: ProductListProps, setSheet: (sheet: string) => void, toggleChecklist: any}) {
    return (
        <View style={{ flexDirection: "column", flex: 1 }}>
            <ListHeader
                title="List"
                text="Your family’s shared weekly list."
            />
            <ProductList
                props={props}
                isChecklist={false}
                onAdd={() => setSheet("add")}
                onToggle={() => {}}
                onToggleChecklist={toggleChecklist}
            />
        </View>
    );
}