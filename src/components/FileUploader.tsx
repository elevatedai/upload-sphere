
import React from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileUploader() {
  const {
    dragActive,
    uploadQueue,
    inputRef,
    handleDrag,
    handleDrop,
    handleChange,
    openFileDialog,
  } = useFileUpload();

  return (
    <div className="w-full space-y-4">
      {/* Drop area */}
      <div
        className={cn(
          "file-drop-area",
          dragActive && "active"
        )}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-base font-medium">Drag and drop files here</p>
            <p className="text-sm text-muted-foreground">
              or <span className="text-primary font-medium">click to browse</span>
            </p>
          </div>
        </div>
      </div>

      {/* Upload queue */}
      {uploadQueue.length > 0 && (
        <Card className="overflow-hidden animate-scale-in">
          <div className="p-4 font-medium">Uploads</div>
          <Separator />
          <div className="p-2 max-h-60 overflow-y-auto">
            {uploadQueue.map((item, index) => (
              <div 
                key={`${item.file.name}-${index}`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded">
                  <File className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <div className="flex items-center">
                      {item.status === "success" && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {item.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      {(item.status === "pending" || item.status === "uploading") && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(item.progress)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {item.status === "error" && (
                    <p className="text-xs text-destructive mt-1">{item.error}</p>
                  )}
                  
                  <Progress 
                    value={item.progress} 
                    className={cn(
                      "h-1 mt-2",
                      item.status === "error" ? "bg-destructive" : 
                      item.status === "success" ? "bg-green-500" : ""
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
