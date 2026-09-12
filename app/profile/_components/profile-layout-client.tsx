"use client";

import { useState } from "react";
import MobileProfileSidebar from "@/app/profile/_components/mobile-profile-sidebar";
import ProfileHeader from "@/app/profile/_components/profile-header";
import ProfileSidebar from "@/app/profile/_components/profile-sidebar";

interface ProfileLayoutClientProps {
  children: React.ReactNode;
}

export default function ProfileLayoutClient({
  children,
}: ProfileLayoutClientProps) {
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
