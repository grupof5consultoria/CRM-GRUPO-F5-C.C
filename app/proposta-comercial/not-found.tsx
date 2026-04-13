export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Proposta não encontrada</p>
        <p style={{ color: "#666", fontSize: 14 }}>Este link pode estar expirado ou incorreto. Solicite um novo link à agência.</p>
      </div>
    </div>
  );
}
