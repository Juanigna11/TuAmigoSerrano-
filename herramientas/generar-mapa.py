"""
Genera el mapa ilustrado de Sierras Chicas (SVG) y lo pega en index.html,
entre las marcas <!-- MAPA:INICIO --> y <!-- MAPA:FIN -->.

Uso (desde la carpeta del proyecto):
    python3 herramientas/generar-mapa.py

Por qué un script y no el SVG a mano: las localidades, lagos y sierras se
ubican con su latitud y longitud reales, y el script las convierte a
coordenadas del dibujo. Para mover o sumar un pueblo se cambia la lista
PUEBLOS y se vuelve a correr.

Es un mapa ILUSTRATIVO: la ubicación es aproximada.
"""
import math
from pathlib import Path

# ---------- 1. Proyección: (longitud, latitud) → (x, y) del dibujo ----------
LON_MIN, LON_MAX = -64.52, -64.14
LAT_NORTE, LAT_SUR = -30.92, -31.43
ANCHO = 600
# En esta latitud un grado de longitud mide ~0,857 de uno de latitud
ALTO = round(ANCHO * (LAT_NORTE - LAT_SUR) / ((LON_MAX - LON_MIN) * 0.857))


def xy(lon, lat):
    x = (lon - LON_MIN) / (LON_MAX - LON_MIN) * ANCHO
    y = (LAT_NORTE - lat) / (LAT_NORTE - LAT_SUR) * ALTO
    return round(x, 1), round(y, 1)


# ---------- 2. Datos ----------
# (nombre, tramo, lon, lat, lado de la etiqueta)
PUEBLOS = [
    ("La Calera", "Sur", -64.336, -31.343, "der"),
    ("Saldán", "Sur", -64.315, -31.303, "izq"),
    ("Villa Allende", "Sur", -64.295, -31.295, "der"),
    ("Mendiolaza", "Sur", -64.302, -31.265, "der"),
    ("Unquillo", "Centro", -64.316, -31.230, "der"),
    ("Río Ceballos", "Centro", -64.322, -31.165, "izq"),
    ("Salsipuedes", "Norte", -64.296, -31.137, "der"),
    ("El Manzano", "Norte", -64.299, -31.083, "der"),
    ("Agua de Oro", "Norte", -64.300, -31.065, "izq"),
    ("La Granja", "Norte", -64.263, -31.008, "der"),
    ("Ascochinga", "Norte", -64.275, -30.958, "der"),
]

# Cerros del cordón (lon, lat, radio este-oeste, radio norte-sur, anillos).
# Van pegados uno al otro a lo largo de la cresta, para que se lean como
# un cordón y no como cerros sueltos.
CERROS = [
    (-64.455, -31.330, 62, 80, 5),
    (-64.430, -31.272, 66, 92, 6),
    (-64.418, -31.226, 70, 100, 8),   # zona del Pan de Azúcar, la más alta
    (-64.405, -31.170, 62, 90, 6),
    (-64.392, -31.112, 64, 92, 7),
    (-64.385, -31.050, 60, 86, 6),
    (-64.377, -30.990, 58, 84, 6),
    (-64.470, -31.200, 46, 70, 4),
    (-64.460, -31.080, 44, 76, 4),
]

# Pie de las sierras: el borde este va un poco al oeste de los pueblos
PIEDEMONTE = [(-64.355, -30.92), (-64.345, -31.00), (-64.352, -31.08), (-64.360, -31.15),
              (-64.372, -31.22), (-64.385, -31.30), (-64.410, -31.35), (-64.445, -31.36),
              (-64.52, -31.36)]


def ruido(i, k, semilla):
    """Ondulación fija (siempre igual) para que los anillos no sean óvalos perfectos."""
    return (math.sin(k * 3 + semilla) * 0.10 + math.sin(k * 5 + semilla * 2.3) * 0.06
            + math.sin(k * 2 + i * 0.7 + semilla) * 0.05)


def anillo(cx, cy, rx, ry, i, semilla, puntos=36):
    pts = []
    for n in range(puntos):
        a = 2 * math.pi * n / puntos
        f = 1 + ruido(i, a, semilla)
        pts.append((cx + math.cos(a) * rx * f, cy + math.sin(a) * ry * f))
    return curva_cerrada(pts)


def curva_cerrada(pts):
    """Catmull-Rom → curvas Bézier: une los puntos con una línea suave."""
    n = len(pts)
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}"
    return d + " Z"


def curva_abierta(pts):
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(len(pts) - 1):
        p0 = pts[max(i - 1, 0)]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[min(i + 2, len(pts) - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}"
    return d


# ---------- 3. Dibujo ----------
partes = []

# Relieve: anillos de curvas de nivel. Los de afuera, claros; los de adentro, oscuros.
tonos = ["#DCE9D0", "#C6DDB2", "#AECF95", "#8DBA6E", "#5E9255", "#3B7049", "#24543F"]
relieve_relleno, relieve_lineas = [], []
pie = [xy(lon, lat) for lon, lat in PIEDEMONTE]
pie_d = curva_abierta(pie) + f" L0 {pie[-1][1]} L0 0 L{pie[0][0]} 0 Z"
relieve_relleno.append(f'<path class="mapa__piedemonte" d="{pie_d}"/>')
for c, (lon, lat, rx, ry, anillos) in enumerate(CERROS):
    cx, cy = xy(lon, lat)
    for i in range(anillos):
        t = 1 - i / anillos
        d = anillo(cx, cy, rx * t * 1.0, ry * t, i, c * 1.7)
        tono = tonos[min(i, len(tonos) - 1)]
        relieve_relleno.append(f'<path d="{d}" fill="{tono}"/>')
        relieve_lineas.append(f'<path class="mapa__curva" pathLength="1" d="{d}" style="--i:{i}"/>')
partes.append('<g class="mapa__relieve">' + relieve_relleno[0].replace("/>", ' mask="url(#falda-mascara)"/>') + "".join(relieve_relleno[1:]) + "</g>")
partes.append('<g class="mapa__curvas">' + "".join(relieve_lineas) + "</g>")

# Agua: lago San Roque y dique La Quebrada
def lago(lon, lat, rx, ry, semilla):
    cx, cy = xy(lon, lat)
    return anillo(cx, cy, rx, ry, 0, semilla, 24), (cx, cy)

san_roque, (sx, sy) = lago(-64.468, -31.377, 34, 24, 4.2)
quebrada, (qx, qy) = lago(-64.347, -31.153, 11, 7, 1.3)
rio = curva_abierta([xy(-64.442, -31.372), xy(-64.40, -31.360), xy(-64.36, -31.352),
                     xy(-64.336, -31.346), xy(-64.29, -31.365), xy(-64.24, -31.395),
                     xy(-64.185, -31.415)])
arroyo = curva_abierta([(qx + 9, qy + 2), xy(-64.31, -31.172), xy(-64.27, -31.19), xy(-64.21, -31.205)])
partes.append(f'''<g class="mapa__agua">
  <path class="mapa__rio" d="{rio}"/>
  <path class="mapa__rio mapa__rio--fino" d="{arroyo}"/>
  <path class="mapa__lago" d="{san_roque}"/>
  <path class="mapa__lago" d="{quebrada}"/>
  <g class="mapa__brillos">
    <path d="M{sx-18} {sy-4} h14"/><path d="M{sx+2} {sy+6} h18" style="--d:1.2s"/><path d="M{sx-8} {sy+14} h10" style="--d:2.1s"/>
  </g>
</g>''')

# Camino que une los pueblos de sur a norte
camino = curva_abierta([xy(lon, lat) for _, _, lon, lat, _ in PUEBLOS])
partes.append(f'<path class="mapa__camino-borde" d="{camino}"/>')
partes.append(f'<path class="mapa__camino" pathLength="1" d="{camino}"/>')

# Referencias con nombre
cba = xy(-64.186, -31.414)
partes.append(f'''<g class="mapa__referencias">
  <text x="{sx}" y="{sy+42}" text-anchor="middle">Lago San Roque</text>
  <text x="{qx-16}" y="{qy-14}" text-anchor="end">Dique La Quebrada</text>
  <text x="{xy(-64.418,-31.228)[0]}" y="{xy(-64.418,-31.228)[1]+4}" text-anchor="middle" class="mapa__cerro">Pan de Azúcar</text>
  <text x="{xy(-64.24,-31.392)[0]+6}" y="{xy(-64.24,-31.392)[1]+22}" class="mapa__rio-nombre">Río Suquía</text>
  <rect x="{cba[0]-6}" y="{cba[1]-6}" width="12" height="12" rx="2" class="mapa__ciudad"/>
  <text x="{cba[0]-12}" y="{cba[1]+26}" text-anchor="end">Córdoba capital</text>
  <text x="34" y="{ALTO*0.62:.0f}" class="mapa__zona" transform="rotate(-90 34 {ALTO*0.62:.0f})" text-anchor="middle">Sierras Chicas</text>
</g>''')

# Rosa de los vientos
partes.append(f'''<g class="mapa__norte" transform="translate(48 52)">
  <circle r="24"/>
  <path d="M0 -15 L7 6 L0 2 L-7 6 Z"/>
  <text y="-30" text-anchor="middle">N</text>
</g>''')

# Pueblos (son botones: se pueden tocar y usar con teclado)
pueblos_svg = []
for i, (nombre, tramo, lon, lat, lado) in enumerate(PUEBLOS):
    x, y = xy(lon, lat)
    tx = x + 16 if lado == "der" else x - 16
    anchor = "start" if lado == "der" else "end"
    pueblos_svg.append(f'''<g class="pueblo pueblo--{tramo.lower()}" data-pueblo="{nombre}" data-tramo="{tramo}"
   role="button" tabindex="0" aria-label="{nombre}, tramo {tramo}" style="--i:{i}">
  <circle class="pueblo__onda" cx="{x}" cy="{y}" r="10"/>
  <circle class="pueblo__punto" cx="{x}" cy="{y}" r="9"/>
  <text x="{tx}" y="{y+6}" text-anchor="{anchor}">{nombre}</text>
</g>''')
partes.append('<g class="mapa__pueblos">' + "".join(pueblos_svg) + "</g>")

# Detalles vivos: dos nubes con su sombra y un ave planeando sobre las sierras
def nube(cx, cy, s):
    return (f'<ellipse cx="{cx}" cy="{cy+70}" rx="{38*s}" ry="{8*s}" class="nube__sombra"/>'
            f'<g class="nube__cuerpo"><circle cx="{cx-22*s}" cy="{cy+4*s}" r="{14*s}"/><circle cx="{cx}" cy="{cy-6*s}" r="{20*s}"/>'
            f'<circle cx="{cx+22*s}" cy="{cy+3*s}" r="{15*s}"/><rect x="{cx-36*s}" y="{cy+2*s}" width="{72*s}" height="{16*s}" rx="{8*s}"/></g>')

partes.append(f'''<g class="mapa__nubes">
  <g class="nube nube--1">{nube(120, 190, 1.0)}</g>
  <g class="nube nube--2">{nube(260, 560, 0.8)}</g>
</g>''')

vuelo = curva_abierta([(150, 820), (90, 640), (200, 470), (130, 300), (230, 140), (180, 40)])
partes.append(f'''<g class="mapa__ave">
  <path class="ave__alas" transform="scale(1.4)" d="M-12 0 Q-6 -7 0 0 Q6 -7 12 0">
    <animate attributeName="d" dur="1.6s" repeatCount="indefinite"
             values="M-12 0 Q-6 -7 0 0 Q6 -7 12 0;M-12 -3 Q-6 2 0 0 Q6 2 12 -3;M-12 0 Q-6 -7 0 0 Q6 -7 12 0"/>
  </path>
  <animateMotion dur="38s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear"
                 path="{vuelo}"/>
</g>''')

svg = f'''<svg class="mapa__svg" viewBox="0 0 {ANCHO} {ALTO}" role="group" aria-labelledby="titulo-mapa">
<defs>
  <linearGradient id="falda" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#DCE9D0"/>
    <stop offset="0.55" stop-color="#E6EFDF"/>
    <stop offset="1" stop-color="#EEF3F6"/>
  </linearGradient>
  <linearGradient id="falda-v" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset="0.08" stop-color="#fff" stop-opacity="1"/>
    <stop offset="0.92" stop-color="#fff" stop-opacity="1"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <mask id="falda-mascara"><rect width="{ANCHO}" height="{ALTO}" fill="url(#falda-v)"/></mask>
</defs>
<rect class="mapa__fondo" width="{ANCHO}" height="{ALTO}"/>
{chr(10).join(partes)}
</svg>'''

# ---------- 4. Pegar en index.html ----------
ruta = Path(__file__).resolve().parent.parent / "index.html"
html = ruta.read_text(encoding="utf-8")
ini, fin = "<!-- MAPA:INICIO -->", "<!-- MAPA:FIN -->"
a, b = html.index(ini) + len(ini), html.index(fin)
html = html[:a] + "\n" + svg + "\n" + html[b:]
ruta.write_text(html, encoding="utf-8")
print(f"Mapa generado: {ANCHO}×{ALTO}, {len(PUEBLOS)} pueblos.")
