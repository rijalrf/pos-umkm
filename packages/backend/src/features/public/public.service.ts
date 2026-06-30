import { ProductsRepository } from '../products/products.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { GetProductsQuery } from '../products/products.schema';

export class PublicService {
  private productsRepository = new ProductsRepository();
  private categoriesRepository = new CategoriesRepository();

  async getProducts(query: GetProductsQuery) {
    return this.productsRepository.findAndCount(query);
  }

  async getProductById(id: string) {
    return this.productsRepository.findById(id);
  }

  async getCategories() {
    return this.categoriesRepository.findAll();
  }
}
