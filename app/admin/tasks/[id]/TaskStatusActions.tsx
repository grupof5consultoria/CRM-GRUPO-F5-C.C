"use client";

import { useState } from "react";
import { updateTaskStatusAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { TaskStatus } from "@prisma/client";
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS } from "@/utils/status-labels";
import { Badge } from "@/components/ui/Badge";

const PIPELINE: TaskStatus[] = ["pending", "in_progress", "waiting_client", "done", "cancelled"];

export function TaskStatusActions({ taskId, currentStatus }: { taskId: string; currentStatus: TaskStatus }) {
  const [loading, setLoading] = useState(false);

  async function handleChange(status: TaskStatus) {
    setLoading(true);
    await updateTaskStatusAction(taskId, status);
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      {PIPELINE.map((status) => (
        <button key={status} onClick={() => handleChange(status)} disabled={loading || status === currentStatus}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${status === currentStatus ? "bg-blue-50 border border-blue-200 cursor-default" : "hover:bg-gray-50 border border-transparent"}`}>
          <Badge variant={TASK_STATUS_VARIANTS[status]}>{TASK_STATUS_LABELS[status]}</Badge>
          {status === currentStatus && <span className="ml-2 text-xs text-blue-600">atual</span>}
        </button>
      ))}
    </div>
  );
}
