"use client";

import { useRouter } from "next/navigation";

export function MetricsPeriodSelect({ periods, current }: { periods: string[]; current: string }) {
  const router = useRouter();
  return (
    <select
      value={current}
      onChange={(e) => router.push(`/portal/metrics?period=${e.target.value}`)}
      className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
    >
      {periods.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}
