export interface TableItem {
  id: string;
  code: string;
  number: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface TablePayload {
  number: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface TableQuery {
  status?: string;
  search?: string;
}
