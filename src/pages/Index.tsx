
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import FileTable from "@/components/FileTable";
import FileUploader from "@/components/FileUploader";
import SearchBar from "@/components/SearchBar";
import { useAssets } from "@/hooks/useAssets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Index = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("files");
  const { 
    assets, 
    isLoading, 
    search, 
    setSearch, 
    pagination, 
    deleteAsset,
  } = useAssets(25);
  
  // Auto-open the upload dialog when clicked on the upload tab
  useEffect(() => {
    if (activeTab === "upload") {
      setUploadDialogOpen(true);
    }
  }, [activeTab]);
  
  // Return to files tab when upload dialog is closed
  useEffect(() => {
    if (!uploadDialogOpen && activeTab === "upload") {
      setActiveTab("files");
    }
  }, [uploadDialogOpen, activeTab]);

  // Map our pagination object to match what FileTable expects
  const tablePagination = {
    limit: pagination.itemsPerPage,
    offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
    totalPages: pagination.totalPages,
    currentPage: pagination.currentPage,
    nextPage: pagination.onNextPage,
    prevPage: pagination.onPrevPage,
    goToPage: pagination.onPageChange
  };

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col gap-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold">Assets</h1>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <SearchBar 
                value={search} 
                onChange={setSearch}
                className="w-full sm:w-[280px]"
              />
              
              <Button 
                onClick={() => setUploadDialogOpen(true)}
                className="min-w-[100px]"
              >
                Upload
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="files" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="mt-6">
              <FileTable 
                assets={assets} 
                isLoading={isLoading} 
                onDelete={deleteAsset} 
                pagination={tablePagination}
              />
            </TabsContent>
            
            <TabsContent value="upload">
              {/* Placeholder content - the actual uploader is in a dialog */}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="py-6">
              <FileUploader />
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      <footer className="w-full py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          UploadSphere Asset Management © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

export default Index;
