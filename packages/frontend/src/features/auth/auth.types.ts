export interface LoginParams {
  username: string;
  password: string;
}

export interface StoreInfo {
  storeName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
}
