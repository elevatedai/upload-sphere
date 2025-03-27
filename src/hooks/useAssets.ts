import { useState, useEffect, useCallback } from "react";
import { fetchAssets, deleteAsset as deleteAssetApi, getApiKey } from "@/lib/api";
import { Asset } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "./useDebounce";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageChange: (page: number) => void;
}

export function useAssets(itemsPerPage: number = 10) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const debouncedSearch = useDebounce(search, 500);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await fetchAssets(itemsPerPage, offset, debouncedSearch);
      
      setAssets(response.assets);
      setTotalItems(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch assets");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch assets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const deleteAsset = async (id: string) => {
    try {
      await deleteAssetApi(id);
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
      toast({
        title: "Asset deleted",
        description: "The asset has been successfully deleted.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete asset",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const pagination: Pagination = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    onNextPage: () => {
      if (currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1);
      }
    },
    onPrevPage: () => {
      if (currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    },
    onPageChange: (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
  };

  return {
    assets,
    isLoading,
    error,
    search,
    setSearch,
    pagination,
    deleteAsset,
    refreshAssets: fetchData,
  };
}
