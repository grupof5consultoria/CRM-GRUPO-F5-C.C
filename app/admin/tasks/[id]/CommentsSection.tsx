"use client";

import { useActionState } from "react";
import { addCommentAction } from "../actions";
import { Button } from "@/components/ui/Button";

interface Comment { id: string; content: string; authorId: string; createdAt: Date; }
const initialState = { error: undefined as string | undefined };

export function CommentsSection({ comments, taskId }: { comments: Comment[]; taskId: string }) {
  const [state, formAction, isPending] = useActionState(addCommentAction, initialState);

  return (
    <div className="space-y-4">
      {comments.length === 0 && <p className="text-sm text-gray-400">Nenhum comentário ainda.</p>}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-800 whitespace-pre-line">{c.content}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString("pt-BR")}</p>
          </div>
        ))}
      </div>

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="taskId" value={taskId} />
        <textarea name="content" rows={2} placeholder="Adicionar comentário..." required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        <Button type="submit" size="sm" loading={isPending}>Comentar</Button>
      </form>
    </div>
  );
}
