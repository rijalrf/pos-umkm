export interface CategoryItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}
