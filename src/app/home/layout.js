"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import HomeSidebar     from "@/components/home/HomeSidebar";
import HomeNavbar      from "@/components/home/HomeNavbar";
import TrendingSidebar from "@/components/home/TrendingSidebar";
import BottomNav       from "@/components/home/BottomNav";

export default function HomeLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const role = session?.user?.role ?? "ciudadano";

  return (
    <div className="home-layout">
      <HomeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />
      <div className="home-main">
        <HomeNavbar onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </div>
      <TrendingSidebar />
      <BottomNav role={role} />
    </div>
  );
}
