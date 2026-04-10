"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MindNode {
  id: string;
  text: string;
  children: MindNode[];
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = [
  "#7c3aed","#2563eb","#059669","#d97706",
  "#db2777","#0891b2","#dc2626","#65a30d",
];

// ─── Layout ───────────────────────────────────────────────────────────────────

const H_GAP = 130;
const V_GAP = 22;

function nodeSize(text: string, lvl: number) {
  const w = Math.min(240, Math.max(lvl === 0 ? 180 : 100, text.length * 8.2 + 40));
  return { w, h: lvl === 0 ? 52 : 38 };
}

interface LN {
  id: string; text: string;
  x: number; y: number; w: number; h: number;
  lvl: number; color: string; dir: 1|-1; pid: string|null;
}

function stHeight(n: MindNode, lvl: number): number {
  if (!n.children.length) return nodeSize(n.text, lvl).h + V_GAP;
  return n.children.reduce((s,c) => s + stHeight(c, lvl+1), 0);
}

function place(
  n: MindNode, ax: number, topY: number,
  dir: 1|-1, lvl: number, color: string, pid: string|null,
  out: LN[]
) {
  const { w, h } = nodeSize(n.text, lvl);
  const sh = stHeight(n, lvl);
  out.push({ id:n.id, text:n.text, x: dir===1?ax:ax-w, y: topY+(sh-h)/2, w, h, lvl, color, dir, pid });
  if (!n.children.length) return;
  const nx = dir===1 ? ax+w+H_GAP : ax-w-H_GAP;
  let cy = topY;
  for (const c of n.children) { place(c,nx,cy,dir,lvl+1,color,n.id,out); cy+=stHeight(c,lvl+1); }
}

function layout(root: MindNode): LN[] {
  const out: LN[] = [];
  const { w:rw, h:rh } = nodeSize(root.text,0);
  out.push({ id:root.id, text:root.text, x:-rw/2, y:-rh/2, w:rw, h:rh, lvl:0, color:"#7c3aed", dir:1, pid:null });
  if (!root.children.length) return out;

  const right = root.children.filter((_,i)=>i%2===0);
  const left  = root.children.filter((_,i)=>i%2!==0);

  let ry = -right.reduce((s,c)=>s+stHeight(c,1),0)/2;
  right.forEach((c,i) => { const sh=stHeight(c,1); place(c,rw/2+H_GAP,ry,1,1,PALETTE[i%PALETTE.length],root.id,out); ry+=sh; });

  let ly = -left.reduce((s,c)=>s+stHeight(c,1),0)/2;
  left.forEach((c,i) => { const sh=stHeight(c,1); place(c,-rw/2-H_GAP,ly,-1,1,PALETTE[(i+4)%PALETTE.length],root.id,out); ly+=sh; });

  return out;
}

// bezier connection
function bezier(a: LN, b: LN) {
  const sx = b.dir===1 ? a.x+a.w : a.x;
  const sy = a.y+a.h/2;
  const tx = b.dir===1 ? b.x : b.x+b.w;
  const ty = b.y+b.h/2;
  const cx = (sx+tx)/2;
  return `M${sx},${sy} C${cx},${sy} ${cx},${ty} ${tx},${ty}`;
}

// ─── Tree ops ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2,10);

function setText(n: MindNode, id: string, t: string): MindNode {
  if (n.id===id) return {...n,text:t};
  return {...n,children:n.children.map(c=>setText(c,id,t))};
}
function addChild(n: MindNode, pid: string): MindNode {
  if (n.id===pid) return {...n,children:[...n.children,{id:uid(),text:"Novo tópico",children:[]}]};
  return {...n,children:n.children.map(c=>addChild(c,pid))};
}
function remove(n: MindNode, id: string): MindNode {
  return {...n,children:n.children.filter(c=>c.id!==id).map(c=>remove(c,id))};
}
function findNode(n: MindNode, id: string): MindNode|null {
  if (n.id===id) return n;
  for (const c of n.children){ const f=findNode(c,id); if(f) return f; }
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
  const [tree, setTree]         = useState<MindNode>(initialNodes);
  const [sel, setSel]           = useState<string|null>(null);
  const [editId, setEditId]     = useState<string|null>(null);
  const [editTxt, setEditTxt]   = useState("");
  const [panX, setPanX]         = useState(0);
  const [panY, setPanY]         = useState(0);
  const [zoom, setZoom]         = useState(1);
  const [dirty, setDirty]       = useState(false);
  const [saving, setSaving]     = useState(false);

  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const lastXY   = useRef({ x:0, y:0 });

  const nodes = useMemo(() => layout(tree), [tree]);
  const nodeMap = useMemo(() => new Map(nodes.map(n=>[n.id,n])), [nodes]);

  // Center on mount
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setPanX(el.clientWidth/2);
    setPanY(el.clientHeight/2);
  }, []);

  // Focus edit input
  useEffect(() => { if (editId) inputRef.current?.focus(); }, [editId]);

  // Keyboard handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editId) return; // let input handle keys
      if (!sel) return;

      if (e.key==="Tab") {
        e.preventDefault();
        const newTree = addChild(tree, sel);
        setTree(newTree);
        setDirty(true);
        // select new child
        const newLayout = layout(newTree);
        const pid = newLayout.find(n=>n.id===sel);
        const orig = findNode(newTree, sel);
        if (orig?.children.length) {
          const last = orig.children[orig.children.length-1];
          setSel(last.id);
          setEditId(last.id);
          setEditTxt(last.text);
        }
      }
      if ((e.key==="Delete"||e.key==="Backspace") && sel !== tree.id) {
        e.preventDefault();
        setTree(prev=>remove(prev,sel));
        setSel(null);
        setDirty(true);
      }
      if (e.key==="F2"||e.key==="Enter") {
        const n = findNode(tree,sel);
        if (n) { setEditId(sel); setEditTxt(n.text); }
      }
      if (e.key==="Escape") setSel(null);
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  }, [sel,editId,tree]);

  // Pan with mouse drag on canvas
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".mind-node")) return;
    dragging.current=true;
    lastXY.current={x:e.clientX,y:e.clientY};
  },[]);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx=e.clientX-lastXY.current.x;
    const dy=e.clientY-lastXY.current.y;
    lastXY.current={x:e.clientX,y:e.clientY};
    setPanX(p=>p+dx);
    setPanY(p=>p+dy);
  },[]);
  const onMouseUp = useCallback(()=>{ dragging.current=false; },[]);

  // Zoom with ctrl+wheel
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey||e.metaKey) {
      e.preventDefault();
      setZoom(z=>Math.min(3,Math.max(0.2,z - e.deltaY*0.001)));
    }
  },[]);

  const commitEdit = () => {
    if (editId && editTxt.trim()) {
      setTree(prev=>setText(prev,editId,editTxt.trim()));
      setDirty(true);
    }
    setEditId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(tree);
    setSaving(false);
    setDirty(false);
  };

  const resetView = () => {
    const el = wrapRef.current;
    if (!el) return;
    setPanX(el.clientWidth/2);
    setPanY(el.clientHeight/2);
    setZoom(1);
  };

  const fmtMonth = (m:string)=>{
    const [y,mo]=m.split("-");
    return new Date(+y,+mo-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  };

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

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="hidden sm:block">Tab = filho · Del = remover · F2 = editar · Ctrl+Scroll = zoom</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#262626] rounded-xl overflow-hidden">
            <button onClick={()=>setZoom(z=>Math.max(0.2,z-0.1))} className="px-3 py-1.5 text-gray-400 hover:bg-[#262626] hover:text-gray-200 transition-colors text-sm">−</button>
            <span className="px-2 text-xs text-gray-500 min-w-[46px] text-center">{Math.round(zoom*100)}%</span>
            <button onClick={()=>setZoom(z=>Math.min(3,z+0.1))} className="px-3 py-1.5 text-gray-400 hover:bg-[#262626] hover:text-gray-200 transition-colors text-sm">+</button>
          </div>
          <button onClick={resetView} title="Centralizar" className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#262626] text-gray-500 hover:text-gray-300 hover:border-[#333] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
          </button>
          {dirty && (
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-xl font-semibold transition-colors">
              {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              Salvar
            </button>
          )}
          {!dirty && <span className="text-xs text-gray-600 px-2">Salvo</span>}
        </div>
      </div>

      {/* ── Canvas ── */}
      <div
        ref={wrapRef}
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
        style={{ background: "radial-gradient(circle at 50% 50%, #141414 0%, #0d0d0d 100%)" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onClick={e => { if(!(e.target as HTMLElement).closest(".mind-node")) { setSel(null); if(editId) commitEdit(); } }}
      >
        {/* Dot grid background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#2a2a2a"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>

        {/* Transform layer */}
        <div
          className="absolute"
          style={{ left:0,top:0, transform:`translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin:"0 0" }}
        >
          {/* SVG connections */}
          <svg
            className="absolute pointer-events-none"
            style={{ overflow:"visible", left:0, top:0, width:0, height:0 }}
          >
            {nodes.filter(n=>n.pid!==null).map(n=>{
              const parent = nodeMap.get(n.pid!);
              if (!parent) return null;
              const isRoot = parent.lvl===0;
              return (
                <path
                  key={n.id+"-conn"}
                  d={bezier(parent,n)}
                  fill="none"
                  stroke={n.color}
                  strokeWidth={isRoot ? 2.5 : 2}
                  strokeOpacity={0.75}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(n => {
            const isRoot   = n.lvl===0;
            const isSel    = sel===n.id;
            const isEdit   = editId===n.id;
            const hex      = n.color;

            return (
              <div
                key={n.id}
                className="mind-node absolute group"
                style={{ left:n.x, top:n.y, width:n.w, height:n.h }}
                onClick={e=>{ e.stopPropagation(); if(editId&&editId!==n.id) commitEdit(); setSel(n.id); }}
                onDoubleClick={e=>{ e.stopPropagation(); setSel(n.id); setEditId(n.id); setEditTxt(n.text); }}
              >
                {/* Node background */}
                <div
                  className="w-full h-full rounded-2xl flex items-center justify-center px-3 transition-all duration-150 relative"
                  style={{
                    background: isRoot ? hex : `${hex}22`,
                    border: `2px solid ${isSel ? "#fff" : hex}`,
                    boxShadow: isSel
                      ? `0 0 0 3px ${hex}55, 0 4px 20px ${hex}33`
                      : isRoot
                      ? `0 4px 16px ${hex}44`
                      : `0 2px 8px ${hex}22`,
                  }}
                >
                  {isEdit ? (
                    <input
                      ref={inputRef}
                      value={editTxt}
                      onChange={e=>setEditTxt(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={e=>{
                        if (e.key==="Enter"){ e.preventDefault(); commitEdit(); }
                        if (e.key==="Escape"){ e.preventDefault(); setEditId(null); }
                        e.stopPropagation();
                      }}
                      onClick={e=>e.stopPropagation()}
                      className="w-full bg-transparent text-center outline-none text-sm font-semibold"
                      style={{ color: isRoot?"#fff":hex, caretColor:"white" }}
                    />
                  ) : (
                    <span
                      className="text-sm font-semibold text-center leading-tight px-1 truncate"
                      style={{ color: isRoot?"#fff":hex, maxWidth:"100%" }}
                    >
                      {n.text}
                    </span>
                  )}

                  {/* Action buttons (on hover / selected) */}
                  {!isEdit && (
                    <div className={`absolute -right-2 -top-2 items-center gap-1 ${isSel||"hidden group-hover:flex"} flex`}>
                      <button
                        onClick={e=>{ e.stopPropagation(); const nt=addChild(tree,n.id); setTree(nt); setDirty(true);
                          const orig=findNode(nt,n.id); if(orig?.children.length){ const last=orig.children[orig.children.length-1]; setSel(last.id); setEditId(last.id); setEditTxt(last.text); }
                        }}
                        title="Adicionar filho (Tab)"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform hover:scale-110"
                        style={{ background: hex }}
                      >+</button>
                      {n.lvl>0 && (
                        <button
                          onClick={e=>{ e.stopPropagation(); setTree(prev=>remove(prev,n.id)); setSel(null); setDirty(true); }}
                          title="Remover (Del)"
                          className="w-5 h-5 rounded-full bg-[#333] hover:bg-red-600 flex items-center justify-center text-gray-400 hover:text-white text-xs font-bold shadow transition-colors"
                        >×</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mini help */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#111]/80 backdrop-blur border border-[#222] rounded-2xl px-4 py-2 pointer-events-none">
          <span className="text-[11px] text-gray-600">🖱 Arraste o fundo para mover</span>
          <span className="text-[11px] text-gray-600">Ctrl + Scroll = zoom</span>
          <span className="text-[11px] text-gray-600">2× clique = editar</span>
          <span className="text-[11px] text-gray-600">Tab = filho</span>
          <span className="text-[11px] text-gray-600">Del = remover</span>
        </div>
      </div>
    </div>
  );
}
