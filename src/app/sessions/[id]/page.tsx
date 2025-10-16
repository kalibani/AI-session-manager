"use client";

import { SessionDetail } from "@/components/SessionDetail";
import { use } from "react";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <SessionDetail sessionId={id} />;
}
