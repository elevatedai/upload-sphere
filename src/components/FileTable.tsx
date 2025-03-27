
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Download, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Copy,
  FileDown, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Asset } from "@/lib/types";
import { getDownloadUrl } from "@/lib/api";

interface FileTableProps {
  assets: Asset[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  pagination: {
    limit: number;
    offset: number;
    totalPages: number;
    currentPage: number;
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
  };
}

export default function FileTable({ assets, isLoading, onDelete, pagination }: FileTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
  
  const handleDelete = () => {
    if (selectedAsset) {
      onDelete(selectedAsset.id);
      setDeleteDialogOpen(false);
      setSelectedAsset(null);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };
  
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return "🖼️";
    } else if (mimeType.startsWith("video/")) {
      return "🎬";
    } else if (mimeType.startsWith("audio/")) {
      return "🎵";
    } else if (mimeType.includes("pdf")) {
      return "📄";
    } else if (mimeType.includes("word") || mimeType.includes("document")) {
      return "📝";
    } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return "📊";
    } else if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
      return "📽️";
    } else if (mimeType.includes("zip") || mimeType.includes("compressed")) {
      return "🗜️";
    } else {
      return "📁";
    }
  };
  
  const renderPagination = () => {
    const { currentPage, totalPages, nextPage, prevPage, goToPage } = pagination;
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={prevPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show 5 pages at most, centered around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={i}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={nextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const canPreview = (mimeType: string) => {
    return mimeType.startsWith("image/") || 
           mimeType.startsWith("video/") || 
           mimeType.startsWith("audio/") ||
           mimeType === "application/pdf";
  };

  return (
    <div className="w-full overflow-hidden animate-fade-in">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileDown className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getFileTypeIcon(asset.mimeType)}</span>
                      <span className="truncate max-w-[220px]">{asset.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{asset.mimeType.split("/")[1]}</TableCell>
                  <TableCell>{formatBytes(asset.size)}</TableCell>
                  <TableCell>{formatDate(asset.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(getDownloadUrl(asset.id), "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {canPreview(asset.mimeType) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setPreviewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className={cn(
                              "transition-opacity",
                              assets.length > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => window.open(getDownloadUrl(asset.id), "_blank")}>
                            <Download className="h-4 w-4 mr-2" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          
                          {canPreview(asset.mimeType) && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAsset(asset);
                                setPreviewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              <span>Preview</span>
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => copyToClipboard(getDownloadUrl(asset.id))}>
                            <Copy className="h-4 w-4 mr-2" />
                            <span>Copy URL</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {renderPagination()}
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium">{selectedAsset?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedAsset?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4 bg-muted/30 rounded-lg min-h-[300px]">
            {selectedAsset && (
              <>
                {selectedAsset.mimeType.startsWith("image/") && (
                  <img 
                    src={getDownloadUrl(selectedAsset.id)} 
                    alt={selectedAsset.name} 
                    className="max-h-[400px] max-w-full object-contain rounded"
                  />
                )}
                
                {selectedAsset.mimeType.startsWith("video/") && (
                  <video 
                    src={getDownloadUrl(selectedAsset.id)} 
                    controls 
                    className="max-h-[400px] max-w-full rounded"
                  />
                )}
                
                {selectedAsset.mimeType.startsWith("audio/") && (
                  <audio 
                    src={getDownloadUrl(selectedAsset.id)} 
                    controls 
                    className="w-full"
                  />
                )}
                
                {selectedAsset.mimeType === "application/pdf" && (
                  <iframe 
                    src={`${getDownloadUrl(selectedAsset.id)}#view=FitH`} 
                    className="w-full h-[400px] rounded"
                  />
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => window.open(getDownloadUrl(selectedAsset?.id || ""), "_blank")}
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Download</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
