# 📁 GUÍA DE ORGANIZACIÓN DE DATOS

## Estructura de carpetas

Organiza tus archivos JSON en estas carpetas dentro de `data/`:

```
data/
  ├── liga/              → Partidos de ligas nacionales
  ├── champions/         → Partidos de Champions League
  └── historico/         → Partidos históricos (Mundiales, Eurocopas, etc.)
```

## 🎯 Tres formas de organizar tus archivos

### OPCIÓN 1: Con subcarpetas por equipo (SÚPER ORGANIZADO ⭐⭐⭐)

**Perfecta para tener muchos partidos bien organizados**

```
data/liga/
  ├── manifest.json              → Lista las carpetas de equipos
  ├── BARCELONA/
  │   ├── manifest.json          → (OPCIONAL) Lista los archivos del Barcelona
  │   ├── BARCELONA_2019-20.json
  │   ├── BARCELONA_2020-21.json
  │   └── ...
  ├── VALENCIA/
  │   ├── manifest.json          → (OPCIONAL) Lista los archivos del Valencia
  │   ├── VALENCIA_2019-20.json
  │   ├── VALENCIA_2020-21.json
  │   └── ...
  └── ATLETICO_MADRID/
      └── ...
```

**data/liga/manifest.json:**
```json
{
  "folders": ["BARCELONA", "VALENCIA", "ATLETICO_MADRID"]
}
```

**OPCIÓN A - Con manifest en cada subcarpeta (RECOMENDADA):**

**data/liga/VALENCIA/manifest.json:**
```json
{
  "files": [
    "VALENCIA_2014-15.json",
    "VALENCIA_2015-16.json",
    "VALENCIA_2016-17.json",
    "VALENCIA_2017-18.json",
    "VALENCIA_2018-19.json",
    "VALENCIA_2019-20.json",
    "VALENCIA_2020-21.json",
    "VALENCIA_2021-22.json",
    "VALENCIA_2022-23.json"
  ]
}
```

✅ **Ventajas:**
- Control total sobre qué archivos se cargan de cada equipo
- Más rápido (no intenta cargar archivos que no existen)
- Puedes usar cualquier nombre de archivo
- Fácil activar/desactivar temporadas específicas

**OPCIÓN B - Sin manifest en subcarpetas (AUTOMÁTICA):**

Si NO creas manifest.json dentro de la subcarpeta, el juego buscará automáticamente:
- `partido1.json`, `partido2.json`, ..., `partido20.json`
- `partidos.json`, `data.json`, `matches.json`
- `NOMBREEQUIPO_2014-15.json`, `NOMBREEQUIPO_2015-16.json`, ..., `NOMBREEQUIPO_2024-25.json`
  
Ejemplo: Para la carpeta `VALENCIA/`, buscará automáticamente:
- `VALENCIA_2014-15.json`
- `VALENCIA_2015-16.json`
- `VALENCIA_2019-20.json`
- etc.

✅ **Ventajas:**
- No necesitas crear manifest en cada subcarpeta
- Funciona automáticamente si tus archivos siguen los patrones

**Ventajas generales de usar subcarpetas:**
- ✅ Super organizado visualmente
- ✅ Fácil encontrar partidos de cada equipo
- ✅ Puedes tener 10, 20, 50 partidos por equipo sin desorden
- ✅ Solo añades el nombre de la carpeta al manifest principal

---

### OPCIÓN 2: Con archivos directos y manifest.json (ORGANIZADA ⭐⭐)

Crea un archivo `manifest.json` en cada carpeta que liste todos los archivos disponibles:

**Ejemplo: data/liga/manifest.json**
```json
{
  "files": [
    "barcelona.json",
    "real-madrid.json",
    "atletico.json",
    "sevilla.json",
    "valencia.json"
  ]
}
```

**Ventajas:**
- Control total sobre qué archivos se cargan
- Más rápido (no busca archivos que no existen)
- Puedes tener cualquier nombre de archivo
- Fácil activar/desactivar archivos

---

### OPCIÓN 3: Sin manifest.json (AUTOMÁTICA ⭐)

Si no creas un `manifest.json`, el juego intentará cargar automáticamente estos archivos:

**En data/liga/:**
- barcelona.json
- real-madrid.json
- atletico.json
- sevilla.json
- valencia.json
- athletic.json
- real-sociedad.json
- betis.json
- villarreal.json
- celta.json
- espanyol.json
- getafe.json

**En data/champions/:**
- finales.json
- semifinales.json
- remontadas.json
- clasicos.json

**En data/historico/:**
- mundiales.json
- eurocopas.json
- olimpiadas.json

**Ventajas:**
- No necesitas crear manifest.json
- Funciona automáticamente
- Solo pon los archivos y listo

---

## 📝 Estructura de cada archivo JSON

Cada archivo debe ser un **array de partidos**. Ejemplo:

```json
[
  {
    "competition": "LA LIGA",
    "homeTeam": "FC BARCELONA",
    "awayTeam": "REAL MADRID",
    "homeBadge": "🔵🔴",
    "awayBadge": "⚪",
    "score": "5-0",
    "date": "29 NOV 2010",
    "playingTeam": "FC BARCELONA",
    "formation": [
      [
        {
          "name": "VÍCTOR VALDÉS",
          "number": "1",
          "position": "GK"
        }
      ],
      [
        {
          "name": "DANI ALVES",
          "number": "2",
          "position": "RB"
        },
        {
          "name": "GERARD PIQUÉ",
          "number": "3",
          "position": "CB"
        },
        // ... resto de defensas
      ],
      [
        // ... centrocampistas
      ],
      [
        // ... delanteros
      ]
    ]
  },
  {
    // Otro partido...
  }
]
```

---

## 🎮 Cómo funciona en el juego

- **Modo LIGA**: Carga todos los .json de `data/liga/`
- **Modo CHAMPIONS**: Carga todos los .json de `data/champions/`
- **Modo HISTÓRICO**: Carga todos los .json de `data/historico/`
- **Modo ALEATORIO**: Mezcla partidos de las 3 carpetas

---

## 💡 Consejos de organización

### ⭐ RECOMENDADO: Por equipos con SUBCARPETAS:
```
data/liga/
  ├── manifest.json          → Lista las carpetas de equipos
  ├── BARCELONA/
  │   ├── partido1.json      → Barça 5-0 Madrid
  │   ├── partido2.json      → Barça 3-1 United
  │   ├── partido3.json      → Barça 6-2 Madrid
  │   └── ...
  ├── VALENCIA/
  │   ├── partido1.json
  │   └── partido2.json
  ├── ATLETICO_MADRID/
  │   └── partido1.json
  └── ...
```

**manifest.json:**
```json
{
  "folders": ["BARCELONA", "VALENCIA", "ATLETICO_MADRID"]
}
```

### Por equipos (archivos directos):
```
data/liga/
  ├── manifest.json
  ├── barcelona.json       (10-15 partidos del Barça en un solo archivo)
  ├── real-madrid.json     (10-15 partidos del Madrid en un solo archivo)
  ├── atletico.json        (10-15 partidos del Atleti en un solo archivo)
  └── ...
```

**manifest.json:**
```json
{
  "files": ["barcelona.json", "real-madrid.json", "atletico.json"]
}
```

### Por temporadas:
```
data/liga/
  ├── manifest.json
  ├── temporada-2008-09.json
  ├── temporada-2009-10.json
  └── ...
```

### Por competiciones (para CHAMPIONS con subcarpetas):
```
data/champions/
  ├── manifest.json
  ├── FINALES/
  │   ├── final-2009.json
  │   ├── final-2011.json
  │   └── final-2015.json
  ├── SEMIFINALES/
  │   └── ...
  └── REMONTADAS/
      └── ...
```

**manifest.json:**
```json
{
  "folders": ["FINALES", "SEMIFINALES", "REMONTADAS"]
}
```

### Por eventos (para HISTÓRICO):
```
data/historico/
  ├── manifest.json
  ├── MUNDIAL_2010/
  │   ├── final.json
  │   ├── semifinal.json
  │   └── ...
  ├── EUROCOPA_2008/
  │   └── final.json
  └── ...
```

---

## ⚠️ Importante

1. **Todos los archivos JSON deben tener la misma estructura**
2. **Cada formación debe tener exactamente 11 jugadores** (1 GK + 10 de campo)
3. **Los nombres pueden tener tildes** (se normalizan automáticamente)
4. **Si usas subcarpetas**: El manifest debe tener `"folders": [...]`
5. **Si usas archivos directos**: El manifest debe tener `"files": [...]`
6. **Dentro de subcarpetas**: Puedes llamar a los archivos como quieras (partido1.json, final-2009.json, etc.)

---

## 🔧 Ejemplos completos

### Ejemplo 1: Subcarpetas (RECOMENDADO para muchos partidos)

**data/liga/manifest.json:**
```json
{
  "folders": [
    "BARCELONA",
    "VALENCIA"
  ]
}
```

**data/liga/BARCELONA/partido1.json:**
```json
[
  { "competition": "LA LIGA", "homeTeam": "FC BARCELONA", ... }
]
```

**data/liga/BARCELONA/partido2.json:**
```json
[
  { "competition": "COPA DEL REY", "homeTeam": "FC BARCELONA", ... }
]
```

**data/liga/VALENCIA/partido1.json:**
```json
[
  { "competition": "LA LIGA", "homeTeam": "VALENCIA CF", ... }
]
```

### Ejemplo 2: Archivos directos

**data/liga/manifest.json:**
```json
{
  "files": [
    "barcelona.json",
    "real-madrid.json"
  ]
}
```

**data/liga/barcelona.json:**
```json
[
  { "competition": "LA LIGA", ... },
  { "competition": "COPA DEL REY", ... },
  { "competition": "CHAMPIONS LEAGUE", ... }
]
```

**data/liga/real-madrid.json:**
```json
[
  { "competition": "LA LIGA", ... },
  { "competition": "CHAMPIONS LEAGUE", ... }
]
```

---

## 🎉 ¡Listo!

Elige la opción que mejor se adapte a tu forma de organizar. Si tienes muchos partidos por equipo, usa subcarpetas. Si tienes pocos, usa archivos directos.
