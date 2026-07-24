import React, { useRef, useState } from "react";
import {ProductList} from "../components/ProductList";
import ListHeader from "../components/ListHeader";

export default function ChecklistScreen({products, openDetails, toggleProduct}) {
    return (
        <>
            <ListHeader
                eyebrow="AT THE STORE"
                title="ChecklistScreen"
                text={`${products.filter((item) => item.isChecked).length} of ${products.length} items collected.`}
            />
            <ProductList
                products={products}
                shopping
                onAdd={() => {}}
                onSelect={openDetails}
                onToggle={toggleProduct}
            />
        </>
    );
}
