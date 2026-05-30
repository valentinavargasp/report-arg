"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Las páginas de /home/institucion/* heredan el layout de /home/layout.js
 * (sidebar + navbar + BottomNav). Este layout solo bloquea el acceso
 * a usuarios que no sean institución o admin.
 */
export default function InstitutionLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.replace("/login"); return; }
    const role = session.user?.role;
    if (role !== "institucion" && role !== "admin") {
      router.replace("/home");
    }
  }, [session, status, router]);

  if (status === "loading") return null;

  return <>{children}</>;
}
