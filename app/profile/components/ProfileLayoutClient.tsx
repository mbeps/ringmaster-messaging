"use client";

import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileSidebar from "./ProfileSidebar";
import MobileProfileSidebar from "./MobileProfileSidebar";

interface ProfileLayoutClientProps {
  children: React.ReactNode;
}

export default function ProfileLayoutClient({ children }: ProfileLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-full bg-gray-50">
      <ProfileHeader onMenuClick={() => setSidebarOpen(true)} />
      <MobileProfileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex h-[calc(100%-64px)]">
        <ProfileSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
