
import React from "react";
import { useSourceHistory } from "@/context/SourceHistoryContext";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Trash2, ExternalLink } from "lucide-react";

interface SourceHistorySidebarProps {
  onSelectURL: (url: string) => void;
  onSelectFile: (fileMeta: { name: string }) => void;
  open: boolean;
  onClose: () => void;
}

export const SourceHistorySidebar: React.FC<SourceHistorySidebarProps> = ({
  onSelectURL,
  onSelectFile,
  open,
  onClose,
}) => {
  const { sources, removeSource, clear } = useSourceHistory();

  return (
    <Drawer open={open} onOpenChange={open ? onClose : undefined}>
      <DrawerContent
        className="fixed left-0 top-0 h-full max-h-screen w-[320px] bg-white/90 shadow-xl border-r border-slate-100 z-50 flex flex-col"
        style={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <Sidebar className="relative w-full bg-transparent border-none h-full flex flex-col">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                Source History
                <button
                  className="ml-3 text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={clear}
                >
                  Clear All
                </button>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sources.length === 0 && (
                    <div className="px-4 py-6 text-slate-500 text-sm text-center">
                      No source history yet.<br />Extract from a file or URL and it will show here.
                    </div>
                  )}
                  {sources.map((src) => (
                    <SidebarMenuItem key={src.id}>
                      <SidebarMenuButton asChild>
                        <button
                          className="flex items-center w-full px-2 py-2 hover:bg-blue-50 rounded justify-between"
                          onClick={() => {
                            if (src.type === "PDF" && src.file) onSelectFile(src.file);
                            if (src.type === "Website" && src.url) onSelectURL(src.url);
                            onClose();
                          }}>
                          <span>
                            <span className="font-semibold text-slate-800">
                              {src.type === "PDF" ? "📄" : "🔗"} {src.label}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {src.type} • {new Date(src.created).toLocaleString()}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            {src.type === "Website" && src.url && (
                              <a href={src.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} className="text-blue-700" onClick={e => e.stopPropagation()}>
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button className="ml-2 text-red-400 hover:text-red-600" title="Remove" tabIndex={-1}
                              onClick={e => { e.stopPropagation(); removeSource(src.id); }}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </DrawerContent>
    </Drawer>
  );
};
