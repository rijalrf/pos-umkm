import { prisma } from '../../config/database.config';
import { Table } from '@prisma/client';
import { CreateTableInput, UpdateTableInput } from './tables.schema';
import { TableQuery } from './tables.types';

export class TablesRepository {
  async findAll(query?: TableQuery): Promise<Table[]> {
    const whereClause: any = {};

    if (query?.status) {
      whereClause.status = query.status;
    }

    if (query?.search) {
      whereClause.number = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    return prisma.table.findMany({
      where: whereClause,
      orderBy: { code: 'asc' },
    });
  }

  async findById(id: string): Promise<Table | null> {
    return prisma.table.findUnique({
      where: { id },
    });
  }

  async findByNumber(number: string): Promise<Table | null> {
    return prisma.table.findUnique({
      where: { number },
    });
  }

  /** Mencari kode berikutnya yang tersedia dalam format 3 digit zero-padded (001, 002, ...) */
  async getNextCode(): Promise<string> {
    const tables = await prisma.table.findMany({
      select: { code: true },
    });

    if (tables.length === 0) return '001';

    const maxNum = tables.reduce((max, t) => {
      const n = parseInt(t.code, 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);

    return String(maxNum + 1).padStart(3, '0');
  }

  async create(data: CreateTableInput & { code: string }): Promise<Table> {
    return prisma.table.create({
      data: {
        code: data.code,
        number: data.number,
        status: data.status ?? 'ACTIVE',
      },
    });
  }

  async update(id: string, data: UpdateTableInput): Promise<Table> {
    return prisma.table.update({
      where: { id },
      data: {
        number: data.number,
        status: data.status,
      },
    });
  }

  async delete(id: string): Promise<Table> {
    return prisma.table.delete({
      where: { id },
    });
  }
}
