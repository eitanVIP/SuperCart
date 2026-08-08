import React from "react";
import {ProductList, ProductListProps} from "../components/ProductList";
import ListHeader from "../components/ListHeader";
import {View} from "react-native";

export default function ChecklistScreen({props, toggleProduct}: {props: ProductListProps, toggleProduct: any}) {
    return (
        <View style={{ flexDirection: "column", flex: 1 }}>
            <ListHeader
                title="Checklist"
                text={`${props.products.filter((item) => item.isChecked).length} of ${props.products.length} items collected.`}
            />
            <ProductList
                props={props}
                isChecklist={true}
                onAdd={() => {}}
                onToggle={toggleProduct}
                onToggleChecklist={() => {}}
            />
        </View>
    );
}