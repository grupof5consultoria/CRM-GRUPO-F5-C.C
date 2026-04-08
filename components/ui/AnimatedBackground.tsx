"use client";

const particles = [
  { size: 4,  top: "10%",  left: "8%",   delay: "0s",    duration: "8s",  opacity: 0.5 },
  { size: 6,  top: "20%",  left: "25%",  delay: "1.2s",  duration: "11s", opacity: 0.35 },
  { size: 3,  top: "35%",  left: "55%",  delay: "2.5s",  duration: "9s",  opacity: 0.45 },
  { size: 5,  top: "60%",  left: "15%",  delay: "0.8s",  duration: "13s", opacity: 0.3  },
  { size: 4,  top: "75%",  left: "40%",  delay: "3s",    duration: "10s", opacity: 0.4  },
  { size: 7,  top: "85%",  left: "70%",  delay: "1.5s",  duration: "14s", opacity: 0.25 },
  { size: 3,  top: "50%",  left: "80%",  delay: "4s",    duration: "8s",  opacity: 0.5  },
  { size: 5,  top: "15%",  left: "72%",  delay: "0.3s",  duration: "12s", opacity: 0.35 },
  { size: 4,  top: "90%",  left: "90%",  delay: "2s",    duration: "9s",  opacity: 0.3  },
  { size: 6,  top: "45%",  left: "5%",   delay: "3.5s",  duration: "15s", opacity: 0.2  },
  { size: 3,  top: "5%",   left: "50%",  delay: "1s",    duration: "10s", opacity: 0.45 },
  { size: 5,  top: "68%",  left: "60%",  delay: "2.8s",  duration: "11s", opacity: 0.3  },
  // Orbs maiores e desfocados para profundidade
  { size: 80, top: "20%",  left: "10%",  delay: "0s",    duration: "18s", opacity: 0.04, blur: true },
  { size: 60, top: "60%",  left: "75%",  delay: "3s",    duration: "22s", opacity: 0.05, blur: true },
  { size: 100,top: "80%",  left: "30%",  delay: "1s",    duration: "20s", opacity: 0.03, blur: true },
];

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) translateX(0px); opacity: var(--op); }
          25%  { transform: translateY(-18px) translateX(8px); }
          50%  { transform: translateY(-10px) translateX(-6px); opacity: calc(var(--op) * 1.3); }
          75%  { transform: translateY(-22px) translateX(4px); }
          100% { transform: translateY(0px) translateX(0px); opacity: var(--op); }
        }
        @keyframes floatOrb {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(20px, -15px) scale(1.05); }
          66%  { transform: translate(-10px, -25px) scale(0.97); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .particle { animation: floatUp var(--dur) ease-in-out var(--delay) infinite; }
        .orb      { animation: floatOrb var(--dur) ease-in-out var(--delay) infinite; }
      `}</style>

      {particles.map((p, i) =>
        p.blur ? (
          <div
            key={i}
            className="orb absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              background: "radial-gradient(circle, #7c3aed, transparent 70%)",
              opacity: p.opacity,
              filter: "blur(30px)",
              ["--dur" as string]: p.duration,
              ["--delay" as string]: p.delay,
              ["--op" as string]: p.opacity,
            }}
          />
        ) : (
          <div
            key={i}
            className="particle absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              background: "radial-gradient(circle, #a78bfa, #7c3aed)",
              boxShadow: "0 0 6px rgba(139, 92, 246, 0.6)",
              ["--dur" as string]: p.duration,
              ["--delay" as string]: p.delay,
              ["--op" as string]: p.opacity,
              opacity: p.opacity,
            }}
          />
        )
      )}
    </div>
  );
}
