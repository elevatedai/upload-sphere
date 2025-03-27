
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import FileTable from "@/components/FileTable";
import FileUploader from "@/components/FileUploader";
import SearchBar from "@/components/SearchBar";
import { useAssets } from "@/hooks/useAssets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Key } from "lucide-react";
import { getApiKey } from "@/lib/api";

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
    hasApiKey
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

  // Handle API key button click
  const handleApiKeyButtonClick = () => {
    const keyButton = document.querySelector('[data-key-button="true"]');
    if (keyButton instanceof HTMLElement) {
      keyButton.click();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {!hasApiKey ? (
          <div className="flex flex-col items-center justify-center h-[80vh] animate-fade-in">
            <div className="bg-muted/50 p-12 rounded-xl shadow-sm border flex flex-col items-center max-w-md">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Key className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-medium mb-2">API Key Required</h2>
              <p className="text-center text-muted-foreground mb-6">
                You need to set your API key to use the UploadSphere application.
              </p>
              <Button onClick={handleApiKeyButtonClick}>
                Set API Key
              </Button>
            </div>
          </div>
        ) : (
          <>
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
                    pagination={pagination}
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
          </>
        )}
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
