"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Erro ao carregar a proposta</p>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Ocorreu um erro inesperado. Tente recarregar a página.</p>
        <button
          onClick={reset}
          style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
