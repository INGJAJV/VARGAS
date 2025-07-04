const k = 9e9; // Constante de Coulomb (N·m²/C²)

function convertir(valor, unidad) {
  const v = parseFloat(valor);
  if (isNaN(v)) return 0;
  switch (unidad) {
    case "nano":
      return v * 1e-9;
    case "micro":
      return v * 1e-6;
    case "mili":
      return v * 1e-3;
    default:
      return v;
  }
}

// Función para validar y obtener datos
// Función para convertir unidades
function convertir(valor, unidad) {
  // ejemplo simple para micro a Coulombs
  switch(unidad) {
    case 'nano': return valor * 1e-9;
    case 'micro': return valor * 1e-6;
    case 'mili': return valor * 1e-3;
    default: return valor;
  }
}

// Función para obtener datos con signo incluido
function obtenerDatos() {
  const signo1 = parseInt(document.getElementById("sign1").value);
  const signo2 = parseInt(document.getElementById("sign2").value);
  const signo3 = parseInt(document.getElementById("sign3").value);

  const q1_raw = parseFloat(document.getElementById("q1").value);
  const q2_raw = parseFloat(document.getElementById("q2").value);
  const q3_raw = parseFloat(document.getElementById("q3").value);

  const q1 = signo1 * convertir(q1_raw, document.getElementById("unit1").value);
  const q2 = signo2 * convertir(q2_raw, document.getElementById("unit2").value);
  const q3 = signo3 * convertir(q3_raw, document.getElementById("unit3").value);

  const r12 = parseFloat(document.getElementById("r12").value);
  const r13 = parseFloat(document.getElementById("r13").value);
  const r23 = parseFloat(document.getElementById("r23").value);
  const target = document.getElementById("target").value;

  return { q1, q2, q3, r12, r13, r23, target };
}

// Event listener para el botón
document.getElementById("btnCalcular").addEventListener("click", () => {
  const datos = obtenerDatos();
  // Aquí va tu función para calcular las fuerzas usando datos.q1, datos.q2, datos.q3, etc.
  calcularFuerzas(datos);
});

// Aquí iría la función calcularFuerzas() con la lógica de la física
function calcularFuerzas(datos) {
  // lógica para calcular fuerza...
  // ejemplo ficticio:
  console.log("q1:", datos.q1, "q2:", datos.q2, "q3:", datos.q3);
  // Mostrar resultado en #resultado
  document.getElementById("resultado").textContent = `q1 = ${datos.q1} C\nq2 = ${datos.q2} C\nq3 = ${datos.q3} C`;
}

// Ley de Coulomb (fuerza entre dos cargas)
function fuerzaElectrica(qi, qj, r) {
  if (r === 0) return 0;
  return k * Math.abs(qi) * Math.abs(qj) / (r * r);
}

// Conversión de grados a radianes
function deg2rad(deg) {
  return (deg * Math.PI) / 180;
}

// Descomposición de vectores según ángulos del triángulo
function calcularPosiciones(r12, r13, r23) {
  const p1 = { x: 0, y: 0 };
  const p2 = { x: r12, y: 0 };

  const C_rad = deg2rad(60); // Ángulo C predefinido

  const x3 = r12 - r23 * Math.cos(C_rad);
  const y3 = r23 * Math.sin(C_rad);

  const p3 = { x: x3, y: y3 };

  return { p1, p2, p3 };
}

// Calcula fuerza vectorial de qi sobre qj con dirección del vector r_ij
function fuerzaVector(qi, qj, pi, pj) {
  const dx = pj.x - pi.x;
  const dy = pj.y - pi.y;
  const r = Math.sqrt(dx * dx + dy * dy);

  if (r === 0) return { Fx: 0, Fy: 0, magnitud: 0, angulo: 0 };

  const F = fuerzaElectrica(qi, qj, r);

  let ux = dx / r;
  let uy = dy / r;

  const signo = Math.sign(qi) * Math.sign(qj);
  if (signo > 0) {
    ux = -ux;
    uy = -uy;
  }

  const Fx = F * ux;
  const Fy = F * uy;

  const anguloRad = Math.atan2(Fy, Fx);
  const anguloDeg = (anguloRad * 180) / Math.PI;

  return { Fx, Fy, magnitud: F, angulo: anguloDeg };
}

// Dibuja el triángulo y fuerzas en el canvas
function dibujar({ p1, p2, p3 }, fuerzas, target) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const margen = 50;
  const coords = [p1, p2, p3];
  const xs = coords.map((p) => p.x);
  const ys = coords.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const scaleX = (canvas.width - 2 * margen) / (maxX - minX || 1);
  const scaleY = (canvas.height - 2 * margen) / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY);
  

  function escalar(p) {
    return {
      x: margen + (p.x - minX) * scale,
      y: canvas.height - (margen + (p.y - minY) * scale),
    };
  }

  const sp1 = escalar(p1);
  const sp2 = escalar(p2);
  const sp3 = escalar(p3);

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sp1.x, sp1.y);
  ctx.lineTo(sp2.x, sp2.y);
  ctx.lineTo(sp3.x, sp3.y);
  ctx.closePath();
  ctx.stroke();

  function dibujarCarga(p, label, q) {
    ctx.fillStyle = q > 0 ? "#007bff" : "#d9534f";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, p.x, p.y);
  }

  dibujarCarga(sp1, "q₁", fuerzas.q1);
  dibujarCarga(sp2, "q₂", fuerzas.q2);
  dibujarCarga(sp3, "q₃", fuerzas.q3);

  function dibujarFlecha(x, y, dx, dy, color, texto) {
    const arrowLength = Math.sqrt(dx * dx + dy * dy);
    if (arrowLength < 5) return;
    const scale = 30;

    const ex = x + dx * scale;
    const ey = y + dy * scale;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const angle = Math.atan2(ey - y, ex - x);
    const headLength = 10;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(
      ex - headLength * Math.cos(angle - Math.PI / 6),
      ey - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      ex - headLength * Math.cos(angle + Math.PI / 6),
      ey - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, ex + 5, ey);
  }

  if (target === "F12") {
    const f = fuerzas.F12;
    const pos = sp2;
    dibujarFlecha(
      pos.x,
      pos.y,
      f.Fx / fuerzas.maxF,
      -f.Fy / fuerzas.maxF,
      "#007bff",
      `F₁₂ (${f.magnitud.toExponential(2)} N)`
    );
  } else if (target === "F13") {
    const f = fuerzas.F13;
    const pos = sp3;
    dibujarFlecha(
      pos.x,
      pos.y,
      f.Fx / fuerzas.maxF,
      -f.Fy / fuerzas.maxF,
      "#28a745",
      `F₁₃ (${f.magnitud.toExponential(2)} N)`
    );
  } else if (target === "F23") {
    const f = fuerzas.F23;
    const pos = sp3;
    dibujarFlecha(
      pos.x,
      pos.y,
      f.Fx / fuerzas.maxF,
      -f.Fy / fuerzas.maxF,
      "#dc3545",
      `F₂₃ (${f.magnitud.toExponential(2)} N)`
    );
  } else if (target === "Fnet3") {
    const neta = fuerzas.neta3;
    const pos = sp3;
    const f13 = fuerzas.F13;
    dibujarFlecha(
      pos.x,
      pos.y,
      f13.Fx / fuerzas.maxF,
      -f13.Fy / fuerzas.maxF,
      "#28a745",
      `F₁₃ (${f13.magnitud.toExponential(2)} N)`
    );
    const f23 = fuerzas.F23;
    dibujarFlecha(
      pos.x,
      pos.y,
      f23.Fx / fuerzas.maxF,
      -f23.Fy / fuerzas.maxF,
      "#dc3545",
      `F₂₃ (${f23.magnitud.toExponential(2)} N)`
    );
    dibujarFlecha(
      pos.x,
      pos.y,
      neta.Fx / fuerzas.maxF,
      -neta.Fy / fuerzas.maxF,
      "#000",
      `F neta (${neta.magnitud.toExponential(2)} N)`
    );
  }

  ctx.fillStyle = "#555";
  ctx.font = "14px Arial";

  function dibujarEtiquetaTexto(x, y, texto) {
    ctx.fillText(texto, x, y);
  }

  dibujarEtiquetaTexto(
    (sp1.x + sp2.x) / 2,
    (sp1.y + sp2.y) / 2 + 15,
    `r₁₂ = ${document.getElementById("r12").value} m`
  );
  dibujarEtiquetaTexto(
    (sp1.x + sp3.x) / 2 - 40,
    (sp1.y + sp3.y) / 2,
    `r₁₃ = ${document.getElementById("r13").value} m`
  );
  dibujarEtiquetaTexto(
    (sp2.x + sp3.x) / 2 + 20,
    (sp2.y + sp3.y) / 2,
    `r₂₃ = ${document.getElementById("r23").value} m`
  );

  dibujarEtiquetaTexto(sp1.x - 20, sp1.y + 10, `A = 60°`);
  dibujarEtiquetaTexto(sp2.x + 10, sp2.y + 10, `B = 60°`);
  dibujarEtiquetaTexto(sp3.x, sp3.y - 20, `C = 60°`);
}

// Cálculo y despliegue resultados
function calcularYMostrar() {
  const {
    q1, q2, q3,
    r12, r13, r23,
    target
  } = obtenerDatos();
  
  

  const mensajeDiv = document.getElementById("mensajeAngulos");
  mensajeDiv.textContent = ""; // Limpiar mensaje anterior

  // Validación básica: asegurarse de que todos los campos estén llenos y válidos
  const campos = [q1, q2, q3, r12, r13, r23];
  if (campos.some(v => isNaN(v) || v === 0)) {
    mensajeDiv.textContent = "Por favor completa todos los valores numéricos correctamente.";
    return;
  }

  // Validar que la suma de ángulos sea 180°
  const a = 60; // Ángulo A predefinido
  const b = 60; // Ángulo B predefinido
  const c = 60; // Ángulo C predefinido
  if (a + b + c !== 180) {
    mensajeDiv.textContent = "La suma de los ángulos debe ser 180°.";
    return;
  }

  if (r12 <= 0 || r13 <= 0 || r23 <= 0) {
    mensajeDiv.textContent = "Las distancias deben ser mayores que cero.";
    return;
  }

  // Si todo es válido, continuar con cálculos y limpieza del mensaje
  mensajeDiv.textContent = "";

  // Posiciones de cargas
  const posiciones = calcularPosiciones(r12, r13, r23);

  // Fuerzas vectoriales entre cargas que involucren q3
  const F13 = fuerzaVector(q1, q3, posiciones.p1, posiciones.p3);
  const F23 = fuerzaVector(q2, q3, posiciones.p2, posiciones.p3);
  const F12 = fuerzaVector(q1, q2, posiciones.p1, posiciones.p2);

  // Fuerza neta sobre q3
  const neta3 = {
    Fx: F13.Fx + F23.Fx,
    Fy: F13.Fy + F23.Fy,
    magnitud: Math.sqrt(
      (F13.Fx + F23.Fx) * (F13.Fx + F23.Fx) + (F13.Fy + F23.Fy) * (F13.Fy + F23.Fy)
    ),
  };
  neta3.angulo = (Math.atan2(neta3.Fy, neta3.Fx) * 180) / Math.PI;

  // Máxima fuerza para escala de flechas (evita flechas muy grandes)
  const maxF = Math.max(F13.magnitud, F23.magnitud, F12.magnitud, neta3.magnitud);
  

  // Mostrar resultados
  let texto = "";

  if (target === "F13") {
    texto +=
      `Fuerza F₁₃ (q₁ sobre q₃):\n` +
      `Magnitud: ${F13.magnitud.toExponential(4)} N\n` +
      `Dirección (ángulo con +X): ${F13.angulo.toFixed(2)}°\n` +
      `Componentes:\n  Fx = ${F13.Fx.toExponential(4)} N\n  Fy = ${F13.Fy.toExponential(4)} N\n`;
  } else if (target === "F23") {
    texto +=
      `Fuerza F₂₃ (q₂ sobre q₃):\n` +
      `Magnitud: ${F23.magnitud.toExponential(4)} N\n` +
      `Dirección (ángulo con +X): ${F23.angulo.toFixed(2)}°\n` +
      `Componentes:\n  Fx = ${F23.Fx.toExponential(4)} N\n  Fy = ${F23.Fy.toExponential(4)} N\n`;
  } else if (target === "F12") {
    texto +=
      `Fuerza F₁₂ (q₁ sobre q₂):\n` +
      `Magnitud: ${F12.magnitud.toExponential(4)} N\n` +
      `Dirección (ángulo con +X): ${F12.angulo.toFixed(2)}°\n` +
      `Componentes:\n  Fx = ${F12.Fx.toExponential(4)} N\n  Fy = ${F12.Fy.toExponential(4)} N\n`;
  } else if (target === "Fnet3") {
    texto +=
      `Fuerza neta sobre q₃:\n` +
      `Magnitud: ${neta3.magnitud.toExponential(4)} N\n` +
      `Dirección (ángulo con +X): ${neta3.angulo.toFixed(2)}°\n` +
      `Componentes:\n  Fx = ${neta3.Fx.toExponential(4)} N\n  Fy = ${neta3.Fy.toExponential(4)} N\n`;
  }
  // Dibujar DCL individuales
dibujarDCL("canvasF12", F12, "#007bff");
dibujarDCL("canvasF13", F13, "#28a745");
dibujarDCL("canvasF23", F23, "#dc3545");
dibujarDCL("canvasNeta", neta3, "#000");


  document.getElementById("resultado").textContent = texto;
  mostrarExplicacionSignos(q1, q2, q3, target);
  function dibujarDCL(canvasId, fuerza, color = "#007bff") {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const origen = { x: canvas.width / 2, y: canvas.height / 2 };

  const magnitud = Math.sqrt(fuerza.Fx ** 2 + fuerza.Fy ** 2);
  if (magnitud < 1e-12) return;

  const escala = 40 / magnitud;

  const dx = fuerza.Fx * escala;
  const dy = -fuerza.Fy * escala;

  const destino = {
    x: origen.x + dx,
    y: origen.y + dy
  };

  // Dibujar flecha
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(origen.x, origen.y);
  ctx.lineTo(destino.x, destino.y);
  ctx.stroke();

  const angle = Math.atan2(dy, dx);
  const headLength = 10;
  ctx.beginPath();
  ctx.moveTo(destino.x, destino.y);
  ctx.lineTo(
    destino.x - headLength * Math.cos(angle - Math.PI / 6),
    destino.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    destino.x - headLength * Math.cos(angle + Math.PI / 6),
    destino.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.lineTo(destino.x, destino.y);
  ctx.fill();

  // Dibujar etiquetas con signos de Fx y Fy
  ctx.fillStyle = "#000";
  ctx.font = "12px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const fxTexto = `Fx = ${(fuerza.Fx >= 0 ? "+" : "") + fuerza.Fx.toExponential(2)} N`;
  const fyTexto = `Fy = ${(fuerza.Fy >= 0 ? "+" : "") + fuerza.Fy.toExponential(2)} N`;

  ctx.fillText(fxTexto, 10, 10);
  ctx.fillText(fyTexto, 10, 28);
}



  // Dibujar en canvas
  dibujar(
    posiciones,
    { F13, F23, F12, neta3, maxF, q1, q2, q3 },
    target
  );
}

// Eventos
document.getElementById("btnCalcular").addEventListener("click", calcularYMostrar);

  // Transformación simple para centrar y escalar
  const offsetX = 100;
  const offsetY = 350;
  const scale = 200;

  function transform(p) {
    return { x: offsetX + p.x * scale, y: offsetY - p.y * scale };
  }

  const t1 = transform(p1);
  const t2 = transform(p2);
  const t3 = transform(p3);

  // Dibujar líneas del triángulo
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(t1.x, t1.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.closePath();
  ctx.stroke();

  // Dibujar cargas
  drawCircle(ctx, t1.x, t1.y, "purple", "q₁");
  drawCircle(ctx, t2.x, t2.y, "red", "q₂");
  drawCircle(ctx, t3.x, t3.y, "green", "q₃");

  // Dibujar fuerzas como flechas
  drawArrow(ctx, t3, t1, "blue", F13);
  drawArrow(ctx, t3, t2, "orange", F23);


function drawCircle(ctx, x, y, color, label) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.fillText(label, x - 15, y - 15);
}

function drawArrow(ctx, from, to, color, magnitude) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  const headlen = 10;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  // Line
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(to.x, to.y);
  ctx.fill();

  // Magnitude label
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  ctx.fillText(magnitude.toExponential(1) + " N", midX + 5, midY);
}
function mostrarExplicacionSignos(q1, q2, q3, target) {
  const cuadro = document.getElementById("explicacionSignos");
  let texto = "";
  

  function signo(c) {
    return c > 0 ? "+" : (c < 0 ? "−" : "0");
  }

  function productoTexto(c1, c2) {
    const prod = c1 * c2;
    const tipo = prod > 0 ? "REPULSIVA 🔁" : prod < 0 ? "ATRACTIVA 🔀" : "SIN FUERZA";
    return `Producto: ${c1.toExponential(2)} × ${c2.toExponential(2)} = ${prod.toExponential(2)}\nFuerza: ${tipo}`;
  }

  if (target === "F12") {
    texto += `🧾 Análisis de F₁₂ (q₁ sobre q₂)\n`;
    texto += `q₁ = ${signo(q1)} (${q1.toExponential(2)} C)\n`;
    texto += `q₂ = ${signo(q2)} (${q2.toExponential(2)} C)\n`;
    texto += productoTexto(q1, q2);
  } else if (target === "F23") {
    texto += `🧾 Análisis de F₂₃ (q₂ sobre q₃)\n`;
    texto += `q₂ = ${signo(q2)} (${q2.toExponential(2)} C)\n`;
    texto += `q₃ = ${signo(q3)} (${q3.toExponential(2)} C)\n`;
    texto += productoTexto(q2, q3);
  } else if (target === "F13") {
    texto += `🧾 Análisis de F₁₃ (q₁ sobre q₃)\n`;
    texto += `q₁ = ${signo(q1)} (${q1.toExponential(2)} C)\n`;
    texto += `q₃ = ${signo(q3)} (${q3.toExponential(2)} C)\n`;
    texto += productoTexto(q1, q3);
  } else if (target === "Fnet3") {
    texto += `🧾 Análisis de Fuerza neta sobre q₃\n`;
    texto += `Se suman F₁₃ y F₂₃ vectorialmente\n\n`;
    texto += `q₁ = ${signo(q1)} (${q1.toExponential(2)} C)\n`;
    texto += `q₂ = ${signo(q2)} (${q2.toExponential(2)} C)\n`;
    texto += `q₃ = ${signo(q3)} (${q3.toExponential(2)} C)\n\n`;
    texto += `F₁₃ → ${productoTexto(q1, q3)}\n\n`;
    texto += `F₂₃ → ${productoTexto(q2, q3)}`;
  }

  cuadro.textContent = texto;
}
function dibujarDCL(canvasId, fuerza, color = "#007bff") {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const origen = { x: canvas.width / 2, y: canvas.height / 2 };

  const magnitud = Math.sqrt(fuerza.Fx ** 2 + fuerza.Fy ** 2);
  if (magnitud < 1e-12) return;

  const escala = 40 / magnitud;

  const dx = fuerza.Fx * escala;
  const dy = -fuerza.Fy * escala;

  const destino = {
    x: origen.x + dx,
    y: origen.y + dy
  };

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(origen.x, origen.y);
  ctx.lineTo(destino.x, destino.y);
  ctx.stroke();

  const angle = Math.atan2(dy, dx);
  const headLength = 10;
  ctx.beginPath();
  ctx.moveTo(destino.x, destino.y);
  ctx.lineTo(
    destino.x - headLength * Math.cos(angle - Math.PI / 6),
    destino.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    destino.x - headLength * Math.cos(angle + Math.PI / 6),
    destino.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.lineTo(destino.x, destino.y);
  ctx.fill();
}



// Cálculo inicial al cargar
window.onload = calcularYMostrar;
