"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstitucionHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home/institucion/comunicados");
  }, [router]);

  return null;
}
