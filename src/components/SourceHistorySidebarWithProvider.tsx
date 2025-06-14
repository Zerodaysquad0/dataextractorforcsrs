
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SourceHistorySidebar } from "./SourceHistorySidebar";

interface SourceHistorySidebarWithProviderProps {
  open: boolean;
  onClose: () => void;
  onSelectURL: (url: string) => void;
  onSelectFile: (fileMeta: { name: string }) => void;
}

/**
 * Provides the required SidebarProvider wrapper for SourceHistorySidebar usage.
 */
export const SourceHistorySidebarWithProvider: React.FC<SourceHistorySidebarWithProviderProps> = (props) => (
  <SidebarProvider>
    <SourceHistorySidebar {...props} />
  </SidebarProvider>
);

