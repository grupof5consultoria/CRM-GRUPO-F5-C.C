"use client";

const particles = [
  { size: 4,  top: "10%",  left: "8%",   delay: "0s",    duration: "8s",  opacity: 0.5,  color: "#a78bfa" },
  { size: 6,  top: "20%",  left: "25%",  delay: "1.2s",  duration: "11s", opacity: 0.35, color: "#38bdf8" },
  { size: 3,  top: "35%",  left: "55%",  delay: "2.5s",  duration: "9s",  opacity: 0.45, color: "#f472b6" },
  { size: 5,  top: "60%",  left: "15%",  delay: "0.8s",  duration: "13s", opacity: 0.3,  color: "#34d399" },
  { size: 4,  top: "75%",  left: "40%",  delay: "3s",    duration: "10s", opacity: 0.4,  color: "#a78bfa" },
  { size: 7,  top: "85%",  left: "70%",  delay: "1.5s",  duration: "14s", opacity: 0.25, color: "#38bdf8" },
  { size: 3,  top: "50%",  left: "80%",  delay: "4s",    duration: "8s",  opacity: 0.5,  color: "#f472b6" },
  { size: 5,  top: "15%",  left: "72%",  delay: "0.3s",  duration: "12s", opacity: 0.35, color: "#a78bfa" },
  { size: 4,  top: "90%",  left: "90%",  delay: "2s",    duration: "9s",  opacity: 0.3,  color: "#34d399" },
  { size: 6,  top: "45%",  left: "5%",   delay: "3.5s",  duration: "15s", opacity: 0.2,  color: "#f472b6" },
  { size: 3,  top: "5%",   left: "50%",  delay: "1s",    duration: "10s", opacity: 0.45, color: "#38bdf8" },
  { size: 5,  top: "68%",  left: "60%",  delay: "2.8s",  duration: "11s", opacity: 0.3,  color: "#a78bfa" },
];

const orbs = [
  { size: 500, top: "-10%", left: "-5%",  delay: "0s",  duration: "20s", opacity: 0.055, color: "#7c3aed", blur: 80 },
  { size: 400, top: "40%",  left: "70%",  delay: "4s",  duration: "25s", opacity: 0.045, color: "#0ea5e9", blur: 80 },
  { size: 350, top: "75%",  left: "15%",  delay: "2s",  duration: "22s", opacity: 0.04,  color: "#ec4899", blur: 80 },
  { size: 300, top: "20%",  left: "50%",  delay: "6s",  duration: "28s", opacity: 0.035, color: "#10b981", blur: 70 },
];

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) translateX(0px); opacity: var(--op); }
          25%  { transform: translateY(-18px) translateX(8px); }
          50%  { transform: translateY(-10px) translateX(-6px); opacity: calc(var(--op) * 1.4); }
          75%  { transform: translateY(-22px) translateX(4px); }
          100% { transform: translateY(0px) translateX(0px); opacity: var(--op); }
        }
        @keyframes floatOrb {
          0%   { transform: translate(0px, 0px) scale(1); }
          30%  { transform: translate(30px, -20px) scale(1.06); }
          60%  { transform: translate(-15px, -35px) scale(0.96); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .dash-particle { animation: floatUp var(--dur) ease-in-out var(--delay) infinite; }
        .dash-orb      { animation: floatOrb var(--dur) ease-in-out var(--delay) infinite; }
      `}</style>

      {/* Orbs coloridos de fundo */}
      {orbs.map((o, i) => (
        <div
          key={`orb-${i}`}
          className="dash-orb absolute rounded-full"
          style={{
            width: o.size,
            height: o.size,
            top: o.top,
            left: o.left,
            background: `radial-gradient(circle at 40% 40%, ${o.color}, transparent 70%)`,
            opacity: o.opacity,
            filter: `blur(${o.blur}px)`,
            ["--dur" as string]: o.duration,
            ["--delay" as string]: o.delay,
          }}
        />
      ))}

      {/* Partículas pequenas */}
      {particles.map((p, i) => (
        <div
          key={`p-${i}`}
          className="dash-particle absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            background: `radial-gradient(circle, ${p.color}, ${p.color}88)`,
            boxShadow: `0 0 8px ${p.color}99`,
            ["--dur" as string]: p.duration,
            ["--delay" as string]: p.delay,
            ["--op" as string]: p.opacity,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
