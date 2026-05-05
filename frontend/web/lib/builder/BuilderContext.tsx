"use client";

import React, { createContext, useContext, useState } from "react";
import { MediaLibrary } from "./components/MediaLibrary";

interface BuilderContextType {
  storeId: string;
  openMediaLibrary: (onSelect: (url: string) => void) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ 
  children, 
  storeId 
}: { 
  children: React.ReactNode; 
  storeId: string;
}) {
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [onSelectCallback, setOnSelectCallback] = useState<(url: string) => void>(() => {});

  const openMediaLibrary = (callback: (url: string) => void) => {
    setOnSelectCallback(() => callback);
    setMediaLibraryOpen(true);
  };

  return (
    <BuilderContext.Provider value={{ storeId, openMediaLibrary }}>
      {children}
      {mediaLibraryOpen && (
        <MediaLibrary 
          storeId={storeId} 
          onSelect={(url) => {
            onSelectCallback(url);
            setMediaLibraryOpen(false);
          }} 
          onClose={() => setMediaLibraryOpen(false)} 
        />
      )}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder must be used within a BuilderProvider");
  }
  return context;
}
