
import { Asset, AssetsResponse, AssetResponse, UploadResponse, ErrorResponse } from "./types";

const API_URL = "/api";

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error((data as ErrorResponse).error?.message || "An error occurred");
  }
  
  return data as T;
}

// Configure headers for API requests
function getHeaders(isUpload: boolean = false): HeadersInit {
  const headers: HeadersInit = {};
  
  const apiKey = getApiKey();
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  
  if (!isUpload) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
}

// Fetch assets with pagination and search
export async function fetchAssets(
  limit: number = 100,
  offset: number = 0,
  search?: string
): Promise<AssetsResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (search) {
    params.append("search", search);
  }
  
  const response = await fetch(`${API_URL}/assets?${params.toString()}`, {
    headers: getHeaders(),
  });
  
  return handleResponse<AssetsResponse>(response);
}

// Fetch a single asset by ID
export async function fetchAsset(id: string): Promise<AssetResponse> {
  const response = await fetch(`${API_URL}/assets/${id}`, {
    headers: getHeaders(),
  });
  
  return handleResponse<AssetResponse>(response);
}

// Upload a file
export async function uploadFile(file: File): Promise<UploadResponse> {
  const response = await fetch(`${API_URL}/upload/${encodeURIComponent(file.name)}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: file,
  });
  
  return handleResponse<UploadResponse>(response);
}

// Delete an asset
export async function deleteAsset(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/assets/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  
  return handleResponse<{ success: boolean }>(response);
}

// Get download URL for an asset
export function getDownloadUrl(id: string): string {
  return `${API_URL}/download/${id}`;
}

// Set the API key
export function setApiKey(key: string): void {
  localStorage.setItem("assetApiKey", key);
  window.location.reload();
}

// Get the API key from localStorage
export function getApiKey(): string {
  return localStorage.getItem("assetApiKey") || "";
}
