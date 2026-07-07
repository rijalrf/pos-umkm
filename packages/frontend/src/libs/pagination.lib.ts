import type { TablePaginationConfig } from 'antd';

export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_PAGINATION: TablePaginationConfig = {
  pageSize: DEFAULT_PAGE_SIZE,
};

export const createClientPagination = (pageSize: number): TablePaginationConfig => ({
  pageSize,
});

export interface ServerPaginationConfig {
  current?: number;
  pageSize?: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
}

export const createServerPagination = (config: ServerPaginationConfig): TablePaginationConfig => ({
  current: config.current ?? 1,
  pageSize: config.pageSize ?? DEFAULT_PAGE_SIZE,
  total: config.total,
  onChange: config.onChange,
  showSizeChanger: config.showSizeChanger ?? true,
  pageSizeOptions: config.pageSizeOptions ?? ['10', '25', '50'],
});
