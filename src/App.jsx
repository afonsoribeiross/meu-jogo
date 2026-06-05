import { useState, useEffect, useRef } from "react";

const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,0,1,0,1,1,0,0,1],
  [1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,0,1,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,0,1,0,1,1,0,0,1],
  [1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const CELL = 36;

const ITENS_INICIAIS = [
  { x: 3,  y: 1,  tipo: "kit" },
  { x: 6,  y: 4,  tipo: "bateria" },
  { x: 1,  y: 6,  tipo: "kit" },
  { x: 9,  y: 1,  tipo: "bateria" },
  { x: 11, y: 4,  tipo: "kit" },
  { x: 15, y: 2,  tipo: "kit" },
  { x: 17, y: 5,  tipo: "bateria" },
  { x: 3,  y: 13, tipo: "kit" },
  { x: 9,  y: 15, tipo: "bateria" },
  { x: 15, y: 14, tipo: "kit" },
  { x: 1,  y: 17, tipo: "bateria" },
  { x: 17, y: 17, tipo: "kit" },
];

const INIMIGOS_INICIAIS = [
  { x: 6,  y: 1  },
  { x: 17, y: 1  },
  { x: 1,  y: 11 },
  { x: 17, y: 11 },
  { x: 6,  y: 17 },
  { x: 17, y: 17 },
];

function bfs(ini, alvo) {
  const fila = [{ x: ini.x, y: ini.y, caminho: [] }];
  const visitado = new Set([`${ini.x},${ini.y}`]);

  while (fila.length > 0) {
    const { x, y, caminho } = fila.shift();
    const vizinhos = [{ x: x+1, y }, { x: x-1, y }, { x, y: y+1 }, { x, y: y-1 }];

    for (const v of vizinhos) {
      const key = `${v.x},${v.y}`;
      if (visitado.has(key)) continue;
      if (MAP[v.y]?.[v.x] !== 0) continue;
      visitado.add(key);
      const novoCaminho = [...caminho, { x: v.x, y: v.y }];
      if (v.x === alvo.x && v.y === alvo.y) return novoCaminho[0] ?? ini;
      fila.push({ x: v.x, y: v.y, caminho: novoCaminho });
    }
  }
  return ini;
}

export default function App() {
  const [pos, setPos]           = useState({ x: 1, y: 1 });
  const [vida, setVida]         = useState(100);
  const [tempo, setTempo]       = useState(0);
  const [vivo, setVivo]         = useState(true);
  const [itens, setItens]       = useState(ITENS_INICIAIS);
  const [inimigos, setInimigos] = useState(INIMIGOS_INICIAIS);
  const [msg, setMsg]           = useState("");

  const posRef  = useRef(pos);
  const vivoRef = useRef(vivo);
  useEffect(() => { posRef.current = pos; },   [pos]);
  useEffect(() => { vivoRef.current = vivo; }, [vivo]);

  // Tick de vida
  useEffect(() => {
    const tick = setInterval(() => {
      if (!vivoRef.current) return;
      setTempo((t) => t + 1);
      setVida((v) => {
        if (v <= 1) { setVivo(false); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Inimigos
  useEffect(() => {
    const mover = setInterval(() => {
      if (!vivoRef.current) return;
      const alvo = posRef.current;
      setInimigos((atual) =>
        atual.map((ini) => {
          const proximo = bfs(ini, alvo);
          if (proximo.x === alvo.x && proximo.y === alvo.y) {
            setVida((v) => {
              const nova = v - 20;
              if (nova <= 0) { setVivo(false); return 0; }
              return nova;
            });
            setMsg("💀 Tomou dano!");
            setTimeout(() => setMsg(""), 1000);
            return ini;
          }
          return proximo;
        })
      );
    }, 800);
    return () => clearInterval(mover);
  }, []);

  // Jogador
  useEffect(() => {
    const handleKey = (e) => {
      if (!vivoRef.current) return;
      let dx = 0, dy = 0;
      if (e.key === "ArrowUp")    dy = -1;
      if (e.key === "ArrowDown")  dy = +1;
      if (e.key === "ArrowLeft")  dx = -1;
      if (e.key === "ArrowRight") dx = +1;
      if (dx === 0 && dy === 0) return;

      setPos((atual) => {
        const novoX = atual.x + dx;
        const novoY = atual.y + dy;
        if (MAP[novoY][novoX] !== 0) return atual;

        setItens((itensAtuais) => {
          const item = itensAtuais.find((i) => i.x === novoX && i.y === novoY);
          if (!item) return itensAtuais;
          if (item.tipo === "kit") {
            setVida((v) => Math.min(100, v + 25));
            setMsg("🩹 +25 vida!");
          } else {
            setTempo((t) => Math.max(0, t - 10));
            setMsg("⚡ Radiação reduzida!");
          }
          setTimeout(() => setMsg(""), 1500);
          return itensAtuais.filter((i) => !(i.x === novoX && i.y === novoY));
        });

        return { x: novoX, y: novoY };
      });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const corVida = vida > 60 ? "#4caf50" : vida > 30 ? "#ff9800" : "#f44336";

  const reiniciar = () => {
    setVida(100); setTempo(0);
    setPos({ x: 1, y: 1 });
    setVivo(true);
    setItens(ITENS_INICIAIS);
    setInimigos(INIMIGOS_INICIAIS);
    setMsg("");
    vivoRef.current = true;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#ccc",
    }}>
      <h2 style={{ color: "#b0440a", letterSpacing: 4, marginBottom: 16, fontSize: 13, textTransform: "uppercase" }}>
        Zona Morta — Setor 7
      </h2>

      {/* HUD */}
      <div style={{ display: "flex", gap: 32, marginBottom: 12, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "#666" }}>❤ Vida</span>
          <div style={{ width: 160, height: 10, background: "#1a1a1a", borderRadius: 4, border: "1px solid #333" }}>
            <div style={{ width: `${vida}%`, height: "100%", background: corVida, borderRadius: 4, transition: "width 0.3s, background 0.3s" }} />
          </div>
          <span style={{ color: corVida, fontSize: 11 }}>{vida} / 100</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "#666" }}>🕒 Sobreviveu</span>
          <span style={{ color: "#aaa", fontSize: 20 }}>{tempo}s</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "#666" }}>🎒 Itens</span>
          <span style={{ color: "#aaa", fontSize: 20 }}>{ITENS_INICIAIS.length - itens.length}/{ITENS_INICIAIS.length}</span>
        </div>
      </div>

      <div style={{ height: 20, marginBottom: 8, fontSize: 12, color: msg.includes("💀") ? "#f44336" : "#ffe082", letterSpacing: 2, opacity: msg ? 1 : 0 }}>
        {msg}
      </div>

      {!vivo ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#f44336", fontSize: 28, letterSpacing: 4 }}>GAME OVER</p>
          <p style={{ color: "#555", fontSize: 12, marginTop: 8 }}>Você sobreviveu {tempo}s e coletou {ITENS_INICIAIS.length - itens.length} itens</p>
          <button onClick={reiniciar} style={{ marginTop: 16, padding: "8px 24px", background: "transparent", border: "1px solid #b0440a", color: "#b0440a", fontFamily: "'Courier New', monospace", letterSpacing: 2, cursor: "pointer", fontSize: 12, textTransform: "uppercase" }}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: "70vh",
          overflow: "auto",
        }}>
          {MAP.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex", gap: 2 }}>
              {row.map((cell, colIndex) => {
                const isPlayer  = rowIndex === pos.y && colIndex === pos.x;
                const isInimigo = inimigos.some((i) => i.x === colIndex && i.y === rowIndex);
                const item      = itens.find((i) => i.x === colIndex && i.y === rowIndex);
                return (
                  <div key={colIndex} style={{
                    width: CELL, height: CELL,
                    background: isPlayer ? "#b0440a" : isInimigo ? "#1a0a2e" : cell === 1 ? "#2a2a2a" : "#110d0a",
                    border: cell === 1 ? "1px solid #3a3a3a" : "1px solid #1a1410",
                    boxShadow: isPlayer ? "0 0 12px #b0440a" : isInimigo ? "0 0 10px #7c3aed" : cell === 1 ? "inset 0 0 8px #000" : "none",
                    borderRadius: (isPlayer || isInimigo) ? "50%" : 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}>
                    {isPlayer ? "☢" : isInimigo ? "👾" : item ? (item.tipo === "kit" ? "🩹" : "⚡") : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}