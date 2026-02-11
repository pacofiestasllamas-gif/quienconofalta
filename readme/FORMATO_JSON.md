# 📋 FORMATO JSON PARA "¿QUIÉN COÑO FALTA?"

## 📁 Estructura de carpetas

```
tu-proyecto/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── data/
    ├── liga.json
    ├── champions.json
    └── historico.json
```

## 📝 Formato del JSON

Cada archivo JSON debe contener un **array de partidos**. Cada partido tiene esta estructura:

### Estructura de un partido

```json
{
  "competition": "NOMBRE DE LA COMPETICIÓN",
  "homeTeam": "EQUIPO LOCAL",
  "awayTeam": "EQUIPO VISITANTE",
  "homeBadge": "🏟️",
  "awayBadge": "⚽",
  "score": "2-1",
  "date": "DD de mes AAAA",
  "playingTeam": "EQUIPO QUE JUGÓ",
  "formation": [ /* Array de líneas */ ]
}
```

### Campos explicados

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `competition` | String | Nombre de la competición | "LA LIGA • JORNADA 15" |
| `homeTeam` | String | Equipo local | "REAL MADRID" |
| `awayTeam` | String | Equipo visitante | "FC BARCELONA" |
| `homeBadge` | String | Emoji del equipo local | "⚪" |
| `awayBadge` | String | Emoji del equipo visitante | "🔵" |
| `score` | String | Resultado del partido | "2-1" |
| `date` | String | Fecha del partido | "28 de octubre 2023" |
| `playingTeam` | String | Equipo del que mostrar la alineación | "REAL MADRID" |
| `formation` | Array | Array de líneas con jugadores | Ver abajo |

## 🎯 Estructura de la formación

La formación es un **array de líneas**, donde cada línea es un **array de jugadores**.

### Ejemplo de formación 4-3-3:

```json
"formation": [
  [
    /* PORTERO - Línea 1 */
    {
      "name": "COURTOIS",
      "position": "GK",
      "number": "1",
      "hint": "Portero belga de 2 metros"
    }
  ],
  [
    /* DEFENSA - Línea 2 */
    { "name": "CARVAJAL", "position": "DEF", "number": "2", "hint": "Lateral derecho español" },
    { "name": "MILITAO", "position": "DEF", "number": "3", "hint": "Central brasileño" },
    { "name": "RUDIGER", "position": "DEF", "number": "22", "hint": "Defensa alemán" },
    { "name": "MENDY", "position": "DEF", "number": "23", "hint": "Lateral izquierdo francés" }
  ],
  [
    /* CENTRO - Línea 3 */
    { "name": "TCHOUAMENI", "position": "MID", "number": "18", "hint": "Pivote francés" },
    { "name": "KROOS", "position": "MID", "number": "8", "hint": "Centrocampista alemán" },
    { "name": "MODRIC", "position": "MID", "number": "10", "hint": "Croata Balón de Oro" }
  ],
  [
    /* DELANTEROS - Línea 4 */
    { "name": "BELLINGHAM", "position": "FWD", "number": "5", "hint": "Fichaje inglés" },
    { "name": "RODRYGO", "position": "FWD", "number": "21", "hint": "Extremo brasileño" },
    { "name": "VINICIUS", "position": "FWD", "number": "7", "hint": "Extremo veloz" }
  ]
]
```

## 👤 Campos de cada jugador

| Campo | Tipo | Obligatorio | Descripción | Ejemplo |
|-------|------|-------------|-------------|---------|
| `name` | String | ✅ Sí | Nombre del jugador (MAYÚSCULAS) | "COURTOIS" |
| `position` | String | ✅ Sí | Posición: "GK", "DEF", "MID", "FWD" | "GK" |
| `number` | String | ❌ No | Número de dorsal (no se muestra) | "1" |
| `hint` | String | ❌ No | Pista opcional para ayudar | "Portero belga" |

### Posiciones válidas:
- `"GK"` - Portero (Goalkeeper) - Se muestra con color amarillo
- `"DEF"` - Defensa (Defender)
- `"MID"` - Centrocampista (Midfielder)  
- `"FWD"` - Delantero (Forward)

## 📊 Formaciones populares

### 4-4-2
```
Portero: 1 jugador
Defensa: 4 jugadores
Medio: 4 jugadores
Delanteros: 2 jugadores
```

### 4-3-3
```
Portero: 1 jugador
Defensa: 4 jugadores
Medio: 3 jugadores
Delanteros: 3 jugadores
```

### 3-5-2
```
Portero: 1 jugador
Defensa: 3 jugadores
Medio: 5 jugadores
Delanteros: 2 jugadores
```

### 4-2-3-1
```
Portero: 1 jugador
Defensa: 4 jugadores
Medio defensivo: 2 jugadores
Medio ofensivo: 3 jugadores
Delantero: 1 jugador
```

## ⚠️ IMPORTANTE - Reglas

1. **SIEMPRE 11 jugadores** - La suma de todos los jugadores debe ser exactamente 11
2. **Nombres en MAYÚSCULAS** - Para mantener consistencia visual
3. **Sin espacios extras** - El nombre se usa para el juego de adivinanzas
4. **Orden de líneas** - Desde portero (atrás) hasta delanteros (adelante)
5. **JSON válido** - No olvides las comas entre elementos

## ✅ Checklist antes de usar un JSON

- [ ] El archivo está en la carpeta `/data/`
- [ ] Es un array válido (empieza con `[` y termina con `]`)
- [ ] Cada partido tiene todos los campos obligatorios
- [ ] La formación tiene exactamente 11 jugadores
- [ ] Todos los nombres están en MAYÚSCULAS
- [ ] Cada jugador tiene `name`, `position`, y `number`
- [ ] El JSON es sintácticamente válido (puedes validarlo en jsonlint.com)

## 💡 Consejos

### Para nombres compuestos:
```json
"name": "DE BRUYNE"  // ✅ Correcto
"name": "De Bruyne"  // ❌ Incorrecto
```

### Para nombres con acentos:
```json
"name": "IÑAKI"  // ✅ Correcto - mantén los acentos
```

### Para pistas útiles:
```json
"hint": "Portero belga de 2 metros"  // ✅ Útil
"hint": "Jugador"                     // ❌ Demasiado genérica
```

## 🎮 Cómo añadir más partidos

1. Abre el archivo JSON correspondiente (`liga.json`, `champions.json`, o `historico.json`)
2. Añade una coma después del último partido
3. Copia la estructura de un partido existente
4. Modifica los datos del nuevo partido
5. Asegúrate de que el JSON sigue siendo válido

### Ejemplo de añadir un partido:

```json
[
  {
    "competition": "PARTIDO EXISTENTE",
    ...
  },  // ← Añade esta coma si no estaba
  {
    "competition": "NUEVO PARTIDO",
    "homeTeam": "EQUIPO 1",
    "awayTeam": "EQUIPO 2",
    ...
  }
]
```

## 🔧 Solución de problemas

### "Error al cargar los datos"
- Verifica que los archivos estén en `/data/`
- Comprueba que el JSON sea válido
- Revisa la consola del navegador (F12) para ver el error específico

### "No se muestran los jugadores"
- Verifica que haya exactamente 11 jugadores
- Comprueba que cada jugador tenga `name` y `position`

### El juego no carga partidos
- Asegúrate de que el archivo JSON no esté vacío
- Verifica que sea un array `[...]` y no un objeto `{...}`
