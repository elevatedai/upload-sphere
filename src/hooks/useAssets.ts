
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchAssets, 
  fetchAsset, 
  deleteAsset as deleteAssetApi,
  getApiKey
} from "../lib/api";
import { useState } from "react";

export function useAssets(limit: number = 50, initialOffset: number = 0) {
  const [offset, setOffset] = useState(initialOffset);
  const [search, setSearch] = useState("");
  const hasApiKey = !!getApiKey();

  // Query for fetching assets with pagination
  const { 
    data,
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["assets", limit, offset, search],
    queryFn: () => fetchAssets(limit, offset, search),
    enabled: hasApiKey,
    staleTime: 1000 * 60, // 1 minute
  });

  // Delete asset mutation
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (assetId: string) => deleteAssetApi(assetId),
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete asset: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  // Pagination handlers
  const totalPages = Math.ceil((data?.total || 0) / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setOffset(offset + limit);
    }
  };
  
  const prevPage = () => {
    if (offset >= limit) {
      setOffset(offset - limit);
    }
  };
  
  const goToPage = (page: number) => {
    const newOffset = (page - 1) * limit;
    setOffset(newOffset);
  };

  return {
    assets: data?.assets || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    hasApiKey,
    search,
    setSearch,
    pagination: {
      limit,
      offset,
      totalPages,
      currentPage,
      nextPage,
      prevPage,
      goToPage,
    },
    deleteAsset: (id: string) => deleteMutation.mutate(id),
    isDeletingAsset: deleteMutation.isPending,
  };
}

export function useAsset(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["asset", id],
    queryFn: () => fetchAsset(id),
    enabled: !!id && !!getApiKey(),
  });

  return {
    asset: data?.asset,
    isLoading,
    error,
  };
}
