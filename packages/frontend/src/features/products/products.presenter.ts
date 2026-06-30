import { useState, useEffect } from 'react';
import { ProductsService, ProductsQuery } from './products.service';
import { CategoriesService } from '../categories/categories.service';
import { message } from 'antd';

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: string;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  stockAlertThreshold: number;
  category: {
    id: string;
    name: string;
  };
}

export const useProductsPresenter = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<ProductsQuery>({
    page: 1,
    limit: 10,
    search: '',
    categoryId: undefined,
  });

  const fetchCategories = async () => {
    try {
      const response = await CategoriesService.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories for selector', error);
    }
  };

  const fetchProducts = async (currentQuery = query) => {
    setLoading(true);
    try {
      const response = await ProductsService.getAll(currentQuery);
      if (response.success) {
        setProducts(response.data.products);
        setTotal(response.data.pagination.total);
      } else {
        message.error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      message.error('Error fetching products list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.limit, query.categoryId]);

  const handleSearch = (searchVal: string) => {
    const newQuery = { ...query, search: searchVal, page: 1 };
    setQuery(newQuery);
    fetchProducts(newQuery);
  };

  const handleCategoryFilter = (catId?: string) => {
    setQuery({ ...query, categoryId: catId, page: 1 });
  };

  const handlePageChange = (page: number, limit: number) => {
    setQuery({ ...query, page, limit });
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await ProductsService.delete(id);
      if (response.success) {
        message.success('Product deleted successfully');
        fetchProducts();
      } else {
        message.error(response.message || 'Failed to delete product');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error deleting product');
    }
  };

  return {
    products,
    categories,
    loading,
    total,
    query,
    setQuery,
    fetchProducts,
    handleSearch,
    handleCategoryFilter,
    handlePageChange,
    deleteProduct,
  };
};
