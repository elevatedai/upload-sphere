
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FolderUp, Server, Key } from "lucide-react";
import { setApiKey, getApiKey } from "@/lib/api";

export default function Header() {
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKeyState] = useState(getApiKey() || "");
  
  const handleSaveApiKey = () => {
    setApiKey(apiKey);
    setApiKeyDialogOpen(false);
  };

  return (
    <header className="w-full h-16 flex items-center justify-between px-8 py-3 border-b animate-fade-in">
      <div className="flex items-center space-x-2">
        <FolderUp className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-medium">UploadSphere</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setApiKeyDialogOpen(true)}
        >
          <Key className="h-4 w-4" />
          <span>{getApiKey() ? "Change API Key" : "Set API Key"}</span>
        </Button>
        
        <Button variant="outline" size="sm">
          <Server className="h-4 w-4 mr-2" />
          <span>Health Check</span>
        </Button>
      </div>
      
      {/* API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>API Key</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Enter your API key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                className="w-full"
                placeholder="Enter API key"
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              The API key will be stored locally in your browser.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSaveApiKey}
              disabled={!apiKey}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
