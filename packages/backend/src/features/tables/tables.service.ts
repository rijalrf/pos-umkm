import { TablesRepository } from './tables.repository';
import { CreateTableInput, UpdateTableInput } from './tables.schema';
import { Table } from '@prisma/client';
import { TableQuery } from './tables.types';
import { NotFoundError, ConflictError } from '../../shared/utils/errors.util';

export class TablesService {
  private repository = new TablesRepository();

  async getAllTables(query?: TableQuery): Promise<Table[]> {
    return this.repository.findAll(query);
  }

  async getTableById(id: string): Promise<Table> {
    const table = await this.repository.findById(id);
    if (!table) {
      throw new NotFoundError('Meja tidak ditemukan');
    }
    return table;
  }

  async createTable(data: CreateTableInput): Promise<Table> {
    const existing = await this.repository.findByNumber(data.number);
    if (existing) {
      throw new ConflictError('Nomor meja sudah digunakan');
    }
    const code = await this.repository.getNextCode();
    return this.repository.create({ ...data, code });
  }

  async updateTable(id: string, data: UpdateTableInput): Promise<Table> {
    await this.getTableById(id); // Throws NotFoundError if not found

    if (data.number) {
      const existing = await this.repository.findByNumber(data.number);
      if (existing && existing.id !== id) {
        throw new ConflictError('Nomor meja sudah digunakan');
      }
    }

    return this.repository.update(id, data);
  }

  async deleteTable(id: string): Promise<Table> {
    await this.getTableById(id); // Throws NotFoundError if not found
    return this.repository.delete(id);
  }
}
