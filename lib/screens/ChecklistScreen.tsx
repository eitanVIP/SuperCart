import React from "react";
import {ProductList, ProductListProps} from "../components/ProductList";
import ListHeader from "../components/ListHeader";
import {View} from "react-native";
import {Product} from "@/lib/types";

export default function ChecklistScreen({props, products, toggleProduct}: {props: ProductListProps, products: Product[], toggleProduct: any}) {
    return (
        <View style={{ flexDirection: "column", flex: 1 }}>
            <ListHeader
                title="Checklist"
                text={`${products.filter((item) => item.isChecked).length} of ${products.length} items collected.`}
            />
            <ProductList
                props={props}
                products={products}
                isChecklist={true}
                onAdd={() => {}}
                onToggle={toggleProduct}
                onToggleChecklist={() => {}}
            />
        </View>
    );
}