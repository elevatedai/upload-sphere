
export interface Asset {
  id: string;
  name: string;
  path: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  mimeType: string;
  hash?: string;
}

export interface AssetsResponse {
  success: boolean;
  total: number;
  limit: number;
  offset: number;
  assets: Asset[];
}

export interface AssetResponse {
  success: boolean;
  asset: Asset;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  asset: Asset;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
  };
}
