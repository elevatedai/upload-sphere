
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FolderUp, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
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
          size="icon" 
          onClick={toggleTheme}
          className="w-9 h-9 p-0"
        >
          {mounted && (theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          ))}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
