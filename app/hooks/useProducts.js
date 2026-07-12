import { useCallback, useEffect, useState } from 'react';
import { superCartService } from '../data/superCartService';
import { createProduct } from '../data/models';

export function useProducts(familyId, user) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setProducts(await superCartService.getProducts(familyId));
    setLoading(false);
  }, [familyId]);

  useEffect(() => { reload(); }, [reload]);

  const addProduct = async (values) => {
    const product = await superCartService.addProduct(createProduct({ ...values, familyId, user }));
    setProducts((items) => [product, ...items]);
  };
  const toggleProduct = async (product) => {
    const updated = await superCartService.updateProduct(familyId, product.id, { isChecked: !product.isChecked });
    setProducts((items) => items.map((item) => item.id === product.id ? updated : item));
  };
  const deleteProduct = async (productId) => {
    await superCartService.deleteProduct(familyId, productId);
    setProducts((items) => items.filter((item) => item.id !== productId));
  };
  const editProduct = async (productId, changes) => {
    const updated = await superCartService.updateProduct(familyId, productId, changes);
    setProducts((items) => items.map((item) => item.id === productId ? updated : item));
  };

  return { products, loading, addProduct, toggleProduct, deleteProduct, editProduct, reload };
}
