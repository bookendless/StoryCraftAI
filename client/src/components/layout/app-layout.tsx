import { useState } from "react";
import Sidebar from "./sidebar";
import type { Project } from "@shared/schema";

interface AppLayoutProps {
  project: Project;
  children: React.ReactNode;
}

export default function AppLayout({ project, children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-100">
      <Sidebar 
        project={project} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
