"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MindNode {
  id: string;
  text: string;
  children: MindNode[];
  note?: string;
}

interface Connection { id: string; from: string; to: string; }

interface StoredRoot extends MindNode {
  _connections?: Connection[];
  _positions?: Record<string, { x: number; y: number }>;
  _sizes?: Record<string, { w: number; h: number }>;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = [
  "#7c3aed","#2563eb","#059669","#d97706",
  "#db2777","#0891b2","#dc2626","#65a30d",
];

// ─── Auto-layout ──────────────────────────────────────────────────────────────

const H_GAP = 130;
const V_GAP = 22;

function defSize(text: string, lvl: number) {
  const w = Math.min(240, Math.max(lvl === 0 ? 180 : 100, text.length * 8.2 + 40));
  return { w, h: lvl === 0 ? 52 : 38 };
}

interface LN {
  id: string; text: string;
  x: number; y: number; w: number; h: number;
  lvl: number; color: string; dir: 1 | -1; pid: string | null;
  note?: string;
}

function stH(n: MindNode, lvl: number): number {
  if (!n.children.length) return defSize(n.text, lvl).h + V_GAP;
  return n.children.reduce((s, c) => s + stH(c, lvl + 1), 0);
}

function place(n: MindNode, ax: number, topY: number, dir: 1 | -1, lvl: number, color: string, pid: string | null, out: LN[]) {
  const { w, h } = defSize(n.text, lvl);
  const sh = stH(n, lvl);
  out.push({ id: n.id, text: n.text, x: dir === 1 ? ax : ax - w, y: topY + (sh - h) / 2, w, h, lvl, color, dir, pid, note: n.note });
  if (!n.children.length) return;
  const nx = dir === 1 ? ax + w + H_GAP : ax - w - H_GAP;
  let cy = topY;
  for (const c of n.children) { place(c, nx, cy, dir, lvl + 1, color, n.id, out); cy += stH(c, lvl + 1); }
}

function computeLayout(root: MindNode): LN[] {
  const out: LN[] = [];
  const { w: rw, h: rh } = defSize(root.text, 0);
  out.push({ id: root.id, text: root.text, x: -rw / 2, y: -rh / 2, w: rw, h: rh, lvl: 0, color: "#7c3aed", dir: 1, pid: null, note: root.note });
  if (!root.children.length) return out;
  const right = root.children.filter((_, i) => i % 2 === 0);
  const left  = root.children.filter((_, i) => i % 2 !== 0);
  let ry = -right.reduce((s, c) => s + stH(c, 1), 0) / 2;
  right.forEach((c, i) => { const sh = stH(c, 1); place(c, rw / 2 + H_GAP, ry, 1, 1, PALETTE[i % PALETTE.length], root.id, out); ry += sh; });
  let ly = -left.reduce((s, c) => s + stH(c, 1), 0) / 2;
  left.forEach((c, i) => { const sh = stH(c, 1); place(c, -rw / 2 - H_GAP, ly, -1, 1, PALETTE[(i + 4) % PALETTE.length], root.id, out); ly += sh; });
  return out;
}

// ─── Tree ops ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

function setText(n: MindNode, id: string, t: string): MindNode {
  if (n.id === id) return { ...n, text: t };
  return { ...n, children: n.children.map(c => setText(c, id, t)) };
}
function setNote(n: MindNode, id: string, note: string): MindNode {
  if (n.id === id) return { ...n, note: note || undefined };
  return { ...n, children: n.children.map(c => setNote(c, id, note)) };
}
function addChild(n: MindNode, pid: string): MindNode {
  if (n.id === pid) return { ...n, children: [...n.children, { id: uid(), text: "Novo tópico", children: [] }] };
  return { ...n, children: n.children.map(c => addChild(c, pid)) };
}
function addChildById(n: MindNode, pid: string, newId: string): MindNode {
  if (n.id === pid) return { ...n, children: [...n.children, { id: newId, text: "Novo tópico", children: [] }] };
  return { ...n, children: n.children.map(c => addChildById(c, pid, newId)) };
}
function addSibling(root: MindNode, id: string, where: "before" | "after"): { tree: MindNode; newId: string } {
  const newId = uid();
  function go(n: MindNode): MindNode {
    const idx = n.children.findIndex(c => c.id === id);
    if (idx !== -1) {
      const sibling = { id: newId, text: "Novo tópico", children: [] };
      const ch = [...n.children];
      ch.splice(where === "before" ? idx : idx + 1, 0, sibling);
      return { ...n, children: ch };
    }
    return { ...n, children: n.children.map(go) };
  }
  return { tree: go(root), newId };
}
function removeNode(n: MindNode, id: string): MindNode {
  return { ...n, children: n.children.filter(c => c.id !== id).map(c => removeNode(c, id)) };
}
function findNode(n: MindNode, id: string): MindNode | null {
  if (n.id === id) return n;
  for (const c of n.children) { const f = findNode(c, id); if (f) return f; }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  initialNodes: MindNode;
  clientName: string;
  month: string;
  onSave: (nodes: MindNode) => Promise<void>;
  onClose: () => void;
}

export function MindMapEditor({ initialNodes, clientName, month, onSave, onClose }: Props) {
  const stored = initialNodes as StoredRoot;

  const [tree, setTree] = useState<MindNode>(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _connections, _positions, _sizes, ...treeOnly } = stored;
    return treeOnly as MindNode;
  });
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    () => stored._positions ?? {}
  );
  const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>(
    () => stored._sizes ?? {}
  );
  const [connections, setConnections] = useState<Connection[]>(
    () => stored._connections ?? []
  );

  const [sel, setSel]           = useState<string | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [editTxt, setEditTxt]   = useState("");
  const [noteNode, setNoteNode] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Drawing a new manual connection (follows mouse)
  const [drawingConn, setDrawingConn] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const [panX, setPanX]   = useState(0);
  const [panY, setPanY]   = useState(0);
  const [zoom, setZoom]   = useState(1);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const noteRef  = useRef<HTMLTextAreaElement>(null);

  // Drag refs (avoid stale closure issues with useCallback)
  const panDragging = useRef(false);
  const panLast     = useRef({ x: 0, y: 0 });
  const nodeDrag    = useRef<{ id: string; ox: number; oy: number; sx: number; sy: number } | null>(null);
  const resizeDrag  = useRef<{ id: string; origW: number; origH: number; sx: number; sy: number } | null>(null);
  const connDragRef = useRef<{ fromId: string; x1: number; y1: number } | null>(null);
  const hasDragged  = useRef(false);

  // Live state ref for stable callbacks
  const stateRef = useRef({ panX: 0, panY: 0, zoom: 1, nodes: [] as LN[] });

  // Layout: compute positions, then apply manual overrides
  const baseNodes = useMemo(() => computeLayout(tree), [tree]);
  const nodes: LN[] = useMemo(() => baseNodes.map(n => ({
    ...n,
    x: positions[n.id]?.x ?? n.x,
    y: positions[n.id]?.y ?? n.y,
    w: sizes[n.id]?.w ?? n.w,
    h: sizes[n.id]?.h ?? n.h,
  })), [baseNodes, positions, sizes]);
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  // Keep stateRef in sync (runs every render, before event handlers fire)
  stateRef.current = { panX, panY, zoom, nodes };

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setPanX(el.clientWidth / 2);
    setPanY(el.clientHeight / 2);
  }, []);

  useEffect(() => { if (editId) inputRef.current?.focus(); }, [editId]);
  useEffect(() => { if (noteNode) noteRef.current?.focus(); }, [noteNode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (noteNode || editId) return;
      if (!sel) return;
      if (e.key === "Tab") {
        e.preventDefault();
        const nt = addChild(tree, sel); setTree(nt); setDirty(true);
        const orig = findNode(nt, sel);
        if (orig?.children.length) {
          const last = orig.children[orig.children.length - 1];
          setSel(last.id); setEditId(last.id); setEditTxt(last.text);
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && sel !== tree.id) {
        e.preventDefault();
        setTree(prev => removeNode(prev, sel));
        setConnections(prev => prev.filter(c => c.from !== sel && c.to !== sel));
        setPositions(prev => { const n = { ...prev }; delete n[sel]; return n; });
        setSizes(prev => { const n = { ...prev }; delete n[sel]; return n; });
        setSel(null); setDirty(true);
      }
      if (e.key === "F2" || e.key === "Enter") {
        const nd = findNode(tree, sel);
        if (nd) { setEditId(sel); setEditTxt(nd.text); }
      }
      if (e.key === "Escape") setSel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, editId, tree, noteNode]);

  // ── Mouse handlers ────────────────────────────────────────────────────────────

  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".mind-node")) return;
    panDragging.current = true;
    panLast.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Node body drag (move node)
  const onNodeMouseDown = useCallback((e: React.MouseEvent, id: string, nx: number, ny: number) => {
    if ((e.target as HTMLElement).closest(".mm-port,.mm-resize,button")) return;
    e.stopPropagation();
    hasDragged.current = false;
    nodeDrag.current = { id, ox: nx, oy: ny, sx: e.clientX, sy: e.clientY };
  }, []);

  // Start drawing a connection (drag from port dot)
  const startConnDrag = useCallback((fromId: string, x1: number, y1: number, e: React.MouseEvent) => {
    e.stopPropagation();
    hasDragged.current = false;
    connDragRef.current = { fromId, x1, y1 };
    setDrawingConn({ x1, y1, x2: x1, y2: y1 });
  }, []);

  // Start resizing
  const startResizeDrag = useCallback((id: string, origW: number, origH: number, e: React.MouseEvent) => {
    e.stopPropagation();
    hasDragged.current = false;
    resizeDrag.current = { id, origW, origH, sx: e.clientX, sy: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const { panX: px, panY: py, zoom: z } = stateRef.current;

    if (panDragging.current) {
      const dx = e.clientX - panLast.current.x;
      const dy = e.clientY - panLast.current.y;
      panLast.current = { x: e.clientX, y: e.clientY };
      setPanX(p => p + dx);
      setPanY(p => p + dy);
    }
    if (nodeDrag.current) {
      const { id, ox, oy, sx, sy } = nodeDrag.current;
      const dx = (e.clientX - sx) / z;
      const dy = (e.clientY - sy) / z;
      if (Math.abs(e.clientX - sx) > 3 || Math.abs(e.clientY - sy) > 3) hasDragged.current = true;
      setPositions(prev => ({ ...prev, [id]: { x: ox + dx, y: oy + dy } }));
    }
    if (resizeDrag.current) {
      const { id, origW, origH, sx, sy } = resizeDrag.current;
      const dw = (e.clientX - sx) / z;
      const dh = (e.clientY - sy) / z;
      hasDragged.current = true;
      setSizes(prev => ({ ...prev, [id]: { w: Math.max(80, origW + dw), h: Math.max(28, origH + dh) } }));
    }
    if (connDragRef.current) {
      hasDragged.current = true;
      const wx = (e.clientX - px) / z;
      const wy = (e.clientY - py) / z;
      setDrawingConn(prev => prev ? { ...prev, x2: wx, y2: wy } : null);
    }
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    const { panX: px, panY: py, zoom: z, nodes: ns } = stateRef.current;

    // Finish drawing connection
    if (connDragRef.current) {
      if (hasDragged.current) {
        const wx = (e.clientX - px) / z;
        const wy = (e.clientY - py) / z;
        const fromId = connDragRef.current.fromId;
        // Use 16px padding so releasing over a port dot or sibling button still registers
        const HIT = 16;
        const target = ns.find(n =>
          n.id !== fromId &&
          wx >= n.x - HIT && wx <= n.x + n.w + HIT &&
          wy >= n.y - HIT && wy <= n.y + n.h + HIT
        );

        if (target) {
          // Connect to existing node
          setConnections(prev => {
            const exists = prev.some(c =>
              (c.from === fromId && c.to === target.id) ||
              (c.from === target.id && c.to === fromId)
            );
            return exists ? prev : [...prev, { id: uid(), from: fromId, to: target.id }];
          });
          setDirty(true);
        } else if (!target) {
          // Drop on empty space → create new child node at drop position
          const newId = uid();
          setTree(prev => addChildById(prev, fromId, newId));
          setPositions(prev => ({ ...prev, [newId]: { x: wx - 60, y: wy - 19 } }));
          setSel(newId);
          setEditId(newId);
          setEditTxt("Novo tópico");
          setDirty(true);
        }
      }
      connDragRef.current = null;
      setDrawingConn(null);
    }

    if ((nodeDrag.current || resizeDrag.current) && hasDragged.current) setDirty(true);
    nodeDrag.current   = null;
    resizeDrag.current = null;
    panDragging.current = false;
    hasDragged.current  = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(z => Math.min(3, Math.max(0.2, z - e.deltaY * 0.001)));
    }
  }, []);

  // ── Commit helpers ────────────────────────────────────────────────────────────

  const commitEdit = () => {
    if (editId && editTxt.trim()) {
      setTree(prev => setText(prev, editId, editTxt.trim()));
      setDirty(true);
    }
    setEditId(null);
  };

  const commitNote = () => {
    if (noteNode !== null) {
      setTree(prev => setNote(prev, noteNode, noteDraft));
      setDirty(true);
    }
    setNoteNode(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload: StoredRoot = {
      ...tree,
      ...(connections.length > 0 ? { _connections: connections } : {}),
      ...(Object.keys(positions).length > 0 ? { _positions: positions } : {}),
      ...(Object.keys(sizes).length > 0 ? { _sizes: sizes } : {}),
    };
    await onSave(payload as MindNode);
    setSaving(false);
    setDirty(false);
  };

  const resetView = () => {
    const el = wrapRef.current;
    if (!el) return;
    setPanX(el.clientWidth / 2);
    setPanY(el.clientHeight / 2);
    setZoom(1);
  };

  const fmtMonth = (m: string) => {
    const [y, mo] = m.split("-");
    return new Date(+y, +mo - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0d0d]">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#222] bg-[#111] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#222] text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-200">{clientName}</p>
            <p className="text-xs text-gray-500 capitalize">{fmtMonth(month)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0 bg-[#1a1a1a] border border-[#262626] rounded-xl overflow-hidden">
            <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="px-3 py-1.5 text-gray-400 hover:bg-[#262626] hover:text-gray-200 transition-colors text-sm">−</button>
            <span className="px-2 text-xs text-gray-500 min-w-[46px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="px-3 py-1.5 text-gray-400 hover:bg-[#262626] hover:text-gray-200 transition-colors text-sm">+</button>
          </div>
          <button onClick={resetView} title="Centralizar" className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#262626] text-gray-500 hover:text-gray-300 hover:border-[#333] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
          </button>
          {dirty ? (
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-xl font-semibold transition-colors">
              {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              Salvar
            </button>
          ) : (
            <span className="text-xs text-gray-600 px-2">Salvo</span>
          )}
        </div>
      </div>

      {/* ── Canvas ── */}
      <div
        ref={wrapRef}
        className={`flex-1 overflow-hidden relative select-none ${drawingConn ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
        style={{ background: "radial-gradient(circle at 50% 50%, #141414 0%, #0d0d0d 100%)" }}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onClick={e => {
          if (!(e.target as HTMLElement).closest(".mind-node")) {
            setSel(null);
            if (editId) commitEdit();
          }
        }}
      >
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="mm-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#2a2a2a"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mm-dots)"/>
        </svg>

        {/* ── Transform layer ── */}
        <div
          className="absolute"
          style={{ left: 0, top: 0, transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: "0 0" }}
        >
          {/* SVG: tree parent→child bezier curves only (world-space coords) */}
          <svg className="absolute pointer-events-none" style={{ overflow: "visible", left: 0, top: 0, width: 0, height: 0 }}>
            {nodes.filter(n => n.pid !== null).map(n => {
              const p = nodeMap.get(n.pid!);
              if (!p) return null;
              const sx = p.dir === 1 ? p.x + p.w : p.x;
              const sy = p.y + p.h / 2;
              const tx = n.dir === 1 ? n.x : n.x + n.w;
              const ty = n.y + n.h / 2;
              const cx = (sx + tx) / 2;
              return (
                <path key={n.id + "-c"}
                  d={`M${sx},${sy} C${cx},${sy} ${cx},${ty} ${tx},${ty}`}
                  fill="none" stroke={n.color}
                  strokeWidth={p.lvl === 0 ? 2.5 : 2}
                  strokeOpacity={0.75} strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* ── Nodes ── */}
          {nodes.map(n => {
            const isRoot  = n.lvl === 0;
            const isSel   = sel === n.id;
            const isEdit  = editId === n.id;
            const hex     = n.color;
            const hasNote = !!n.note;

            return (
              <div
                key={n.id}
                className="mind-node absolute group"
                style={{ left: n.x, top: n.y, width: n.w, height: n.h, zIndex: isSel ? 10 : 1 }}
                onMouseDown={e => onNodeMouseDown(e, n.id, n.x, n.y)}
                onClick={e => {
                  e.stopPropagation();
                  if (hasDragged.current) return;
                  if (editId && editId !== n.id) commitEdit();
                  setSel(n.id);
                }}
                onDoubleClick={e => {
                  e.stopPropagation();
                  if (hasDragged.current) return;
                  setSel(n.id); setEditId(n.id); setEditTxt(n.text);
                }}
              >
                {/* ── Main box ── */}
                <div
                  className="w-full h-full rounded-2xl flex items-center justify-center px-3 transition-all duration-100 relative"
                  style={{
                    background: isRoot ? hex : `${hex}22`,
                    border: `2px solid ${isSel ? "#fff" : hex}`,
                    boxShadow: isSel
                      ? `0 0 0 3px ${hex}55, 0 4px 20px ${hex}33`
                      : isRoot ? `0 4px 16px ${hex}44` : `0 2px 8px ${hex}22`,
                    cursor: isEdit ? "text" : "grab",
                  }}
                >
                  {isEdit ? (
                    <input
                      ref={inputRef}
                      value={editTxt}
                      onChange={e => setEditTxt(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={e => {
                        if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
                        if (e.key === "Escape") { e.preventDefault(); setEditId(null); }
                        e.stopPropagation();
                      }}
                      onClick={e => e.stopPropagation()}
                      className="w-full bg-transparent text-center outline-none text-sm font-semibold"
                      style={{ color: isRoot ? "#fff" : hex, caretColor: "white" }}
                    />
                  ) : (
                    <span
                      className="text-sm font-semibold text-center leading-tight"
                      style={{ color: isRoot ? "#fff" : hex, maxWidth: "100%", wordBreak: "break-word" }}
                    >
                      {n.text}
                    </span>
                  )}
                </div>

                {/* ── Note indicator dot ── */}
                {hasNote && !isEdit && (
                  <div
                    className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center shadow pointer-events-none"
                    title={n.note}
                  >
                    <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                    </svg>
                  </div>
                )}

                {/* ── Connection ports (left / right edges) ── */}
                {!isEdit && (
                  <>
                    {/* RIGHT port */}
                    <div
                      className={`mm-port absolute w-4 h-4 rounded-full border-2 border-[#0d0d0d] cursor-crosshair z-20 transition-transform hover:scale-125 ${isSel ? "flex" : "hidden group-hover:flex"} items-center justify-center`}
                      style={{ right: -8, top: "50%", transform: "translateY(-50%)", background: hex }}
                      onMouseDown={e => startConnDrag(n.id, n.x + n.w, n.y + n.h / 2, e)}
                      title="Arraste para conectar"
                    />
                    {/* LEFT port */}
                    <div
                      className={`mm-port absolute w-4 h-4 rounded-full border-2 border-[#0d0d0d] cursor-crosshair z-20 transition-transform hover:scale-125 ${isSel ? "flex" : "hidden group-hover:flex"} items-center justify-center`}
                      style={{ left: -8, top: "50%", transform: "translateY(-50%)", background: hex }}
                      onMouseDown={e => startConnDrag(n.id, n.x, n.y + n.h / 2, e)}
                      title="Arraste para conectar"
                    />
                  </>
                )}

                {/* ── Resize handle (bottom-right corner) ── */}
                {!isEdit && (
                  <div
                    className={`mm-resize absolute w-5 h-5 z-20 cursor-se-resize ${isSel ? "flex" : "hidden group-hover:flex"} items-end justify-end`}
                    style={{ right: -6, bottom: -6 }}
                    onMouseDown={e => startResizeDrag(n.id, n.w, n.h, e)}
                    title="Redimensionar"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none">
                      <rect x="1" y="1" width="12" height="12" rx="3" fill="#222" stroke="#555" strokeWidth="1"/>
                      <path d="M5 9l4-4M7 9l2-2" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}

                {/* ── Add sibling ABOVE (top-center) ── */}
                {n.lvl > 0 && !isEdit && (
                  <div
                    className={`absolute w-5 h-5 rounded-full bg-[#222] border border-[#555] cursor-pointer z-20 ${isSel ? "flex" : "hidden group-hover:flex"} items-center justify-center hover:bg-[#333] hover:border-violet-500 transition-colors`}
                    style={{ left: "50%", top: -10, transform: "translateX(-50%)" }}
                    onClick={e => {
                      e.stopPropagation();
                      const { tree: nt, newId } = addSibling(tree, n.id, "before");
                      setTree(nt); setDirty(true);
                      setSel(newId); setEditId(newId); setEditTxt("Novo tópico");
                    }}
                    title="Adicionar nó acima"
                  >
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7"/>
                    </svg>
                  </div>
                )}

                {/* ── Add sibling BELOW (bottom-center) ── */}
                {n.lvl > 0 && !isEdit && (
                  <div
                    className={`absolute w-5 h-5 rounded-full bg-[#222] border border-[#555] cursor-pointer z-20 ${isSel ? "flex" : "hidden group-hover:flex"} items-center justify-center hover:bg-[#333] hover:border-violet-500 transition-colors`}
                    style={{ left: "50%", bottom: -10, transform: "translateX(-50%)" }}
                    onClick={e => {
                      e.stopPropagation();
                      const { tree: nt, newId } = addSibling(tree, n.id, "after");
                      setTree(nt); setDirty(true);
                      setSel(newId); setEditId(newId); setEditTxt("Novo tópico");
                    }}
                    title="Adicionar nó abaixo"
                  >
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                )}

                {/* ── Action buttons (add child / comment / delete) ── */}
                {!isEdit && (
                  <div className={`absolute left-0 items-center gap-1 ${isSel ? "flex" : "hidden group-hover:flex"}`} style={{ top: -30 }}>
                    {/* Add child */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const nt = addChild(tree, n.id); setTree(nt); setDirty(true);
                        const orig = findNode(nt, n.id);
                        if (orig?.children.length) {
                          const last = orig.children[orig.children.length - 1];
                          setSel(last.id); setEditId(last.id); setEditTxt(last.text);
                        }
                      }}
                      title="Adicionar filho (Tab)"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform"
                      style={{ background: hex }}
                    >+</button>
                    {/* Comment */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setNoteNode(n.id);
                        setNoteDraft(findNode(tree, n.id)?.note ?? "");
                      }}
                      title="Comentário"
                      className={`w-5 h-5 rounded-full flex items-center justify-center shadow transition-colors ${hasNote ? "bg-yellow-500" : "bg-yellow-500/60 hover:bg-yellow-500"}`}
                    >
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                      </svg>
                    </button>
                    {/* Delete */}
                    {n.lvl > 0 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setTree(prev => removeNode(prev, n.id));
                          setConnections(prev => prev.filter(c => c.from !== n.id && c.to !== n.id));
                          setPositions(prev => { const np = { ...prev }; delete np[n.id]; return np; });
                          setSizes(prev => { const np = { ...prev }; delete np[n.id]; return np; });
                          setSel(null); setDirty(true);
                        }}
                        title="Remover (Del)"
                        className="w-5 h-5 rounded-full bg-[#333] hover:bg-red-600 flex items-center justify-center text-gray-400 hover:text-white text-xs font-bold shadow transition-colors"
                      >×</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Screen-space SVG: manual connections + drag preview ── */}
        {/* Lives OUTSIDE the transform layer so it always has full canvas dimensions */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none", zIndex: 4 }}>
          {/* Persistent manual connections */}
          {connections.map(conn => {
            const a = nodeMap.get(conn.from);
            const b = nodeMap.get(conn.to);
            if (!a || !b) return null;

            // Pick the closest ports (left/right edge, vertical center)
            const useARightPort = (a.x + a.w / 2) <= (b.x + b.w / 2);
            const portAx = useARightPort ? a.x + a.w : a.x;
            const portAy = a.y + a.h / 2;
            const portBx = useARightPort ? b.x : b.x + b.w;
            const portBy = b.y + b.h / 2;

            // World → screen
            const sx = panX + portAx * zoom;
            const sy = panY + portAy * zoom;
            const tx = panX + portBx * zoom;
            const ty = panY + portBy * zoom;

            // Smooth cubic bezier — tension proportional to distance, never over-arched
            const hdist = Math.abs(tx - sx);
            const vdist = Math.abs(ty - sy);
            const tension = Math.max(30, (hdist * 0.45 + vdist * 0.1));
            const sign = tx >= sx ? 1 : -1;
            const cx1 = sx + sign * tension;
            const cx2 = tx - sign * tension;
            const d = `M${sx},${sy} C${cx1},${sy} ${cx2},${ty} ${tx},${ty}`;

            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2;

            return (
              <g key={conn.id}>
                <path d={d} fill="none" stroke="#f59e0b" strokeWidth={2.5}
                  strokeDasharray="10 5" strokeLinecap="round"
                />
                {/* Delete button at midpoint */}
                <circle cx={mx} cy={my} r={10} fill="#1c1c1c" stroke="#f59e0b" strokeWidth={1.5}
                  style={{ pointerEvents: "auto", cursor: "pointer" }}
                  onClick={() => { setConnections(prev => prev.filter(c => c.id !== conn.id)); setDirty(true); }}
                />
                <text x={mx} y={my + 4} textAnchor="middle" fill="#f59e0b" fontSize="13" fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >×</text>
              </g>
            );
          })}

          {/* Live drag preview */}
          {drawingConn && (() => {
            const sx = panX + drawingConn.x1 * zoom;
            const sy = panY + drawingConn.y1 * zoom;
            const tx = panX + drawingConn.x2 * zoom;
            const ty = panY + drawingConn.y2 * zoom;
            const hdist = Math.abs(tx - sx);
            const vdist = Math.abs(ty - sy);
            const tension = Math.max(30, hdist * 0.45 + vdist * 0.1);
            const sign = tx >= sx ? 1 : -1;
            return (
              <path
                d={`M${sx},${sy} C${sx + sign * tension},${sy} ${tx - sign * tension},${ty} ${tx},${ty}`}
                fill="none" stroke="#f59e0b" strokeWidth={2.5}
                strokeDasharray="6 3" strokeLinecap="round"
              />
            );
          })()}
        </svg>

        {/* ── Note popover (screen-space, above canvas) ── */}
        {noteNode && (() => {
          const n = nodeMap.get(noteNode);
          if (!n) return null;
          const sx = panX + n.x * zoom + (n.w * zoom) / 2;
          const sy = panY + (n.y + n.h) * zoom + 12;
          const maxY = (wrapRef.current?.clientHeight ?? 600) - 210;
          return (
            <div
              className="absolute z-30 bg-[#1a1a1a] border border-yellow-500/40 rounded-2xl p-4 shadow-2xl w-72"
              style={{ left: Math.max(8, Math.min(sx - 144, (wrapRef.current?.clientWidth ?? 800) - 296)), top: Math.min(sy, maxY) }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs text-yellow-400 font-semibold mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/></svg>
                Comentário — {findNode(tree, noteNode)?.text}
              </p>
              <textarea
                ref={noteRef}
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                rows={4}
                placeholder="Digite sua anotação..."
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-gray-200 outline-none resize-none focus:border-yellow-500/60 transition-colors placeholder-gray-600"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setNoteNode(null)} className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-[#262626] transition-colors">Cancelar</button>
                <button onClick={commitNote} className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-3 py-1.5 rounded-lg transition-colors">Salvar</button>
              </div>
            </div>
          );
        })()}

        {/* ── Help bar ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#111]/85 backdrop-blur border border-[#222] rounded-2xl px-4 py-2 pointer-events-none whitespace-nowrap">
          <span className="text-[11px] text-gray-600">Arraste nó = mover</span>
          <span className="text-[11px] text-gray-500">·</span>
          <span className="text-[11px] text-gray-600">Arraste fundo = navegar</span>
          <span className="text-[11px] text-gray-500">·</span>
          <span className="text-[11px] text-gray-600">Ctrl+Scroll = zoom</span>
          <span className="text-[11px] text-gray-500">·</span>
          <span className="text-[11px] text-gray-600">2× clique = editar</span>
          <span className="text-[11px] text-gray-500">·</span>
          <span className="text-[11px] text-amber-600/80">○ porta = conectar</span>
          <span className="text-[11px] text-gray-500">·</span>
          <span className="text-[11px] text-gray-600">⤡ canto = redimensionar</span>
        </div>
      </div>
    </div>
  );
}
