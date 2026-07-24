import React, { useRef, useState } from "react";
import {ProductList} from "../components/ProductList";
import ListHeader from "../components/ListHeader";

export default function GroceriesScreen({products, setSheet, openDetails, toggleProduct}) {
    return (
        <>
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
        </>
    );
}
