
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFile } from "../lib/api";

interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function useFileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onSuccess: (_, file) => {
      setUploadQueue(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, status: "success", progress: 100 } 
            : item
        )
      );
      
      // Remove from queue after delay
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.file !== file));
      }, 2000);
      
      toast.success(`${file.name} uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error, file) => {
      setUploadQueue(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, status: "error", error: error instanceof Error ? error.message : "Upload failed" } 
            : item
        )
      );
      
      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  // Handle file selection
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const filesArray = Array.from(files);
    
    // Add files to queue
    setUploadQueue(prev => [
      ...prev,
      ...filesArray.map(file => ({
        file,
        progress: 0,
        status: "pending" as const,
      })),
    ]);
    
    // Upload each file
    filesArray.forEach(file => {
      setUploadQueue(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, status: "uploading" } 
            : item
        )
      );
      
      // Simulate progress (in a real app, this would come from actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadQueue(prev => {
          const newQueue = prev.map(item => {
            if (item.file === file && item.status === "uploading" && item.progress < 90) {
              return { ...item, progress: item.progress + 10 };
            }
            return item;
          });
          
          return newQueue;
        });
      }, 300);
      
      // Start upload
      uploadMutation.mutate(file);
      
      // Clear interval after upload completes or fails
      setTimeout(() => clearInterval(progressInterval), 3000);
    });
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Open file dialog
  const openFileDialog = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return {
    dragActive,
    uploadQueue,
    inputRef,
    handleDrag,
    handleDrop,
    handleChange,
    openFileDialog,
    isUploading: uploadMutation.isPending,
  };
}
