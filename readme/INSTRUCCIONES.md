# 🎮 INSTRUCCIONES DE INSTALACIÓN - ¿QUIÉN COÑO FALTA?

## 📂 ESTRUCTURA DE CARPETAS

Organiza los archivos de esta manera:

```
tu-proyecto/
│
├── index.html              ← Archivo principal HTML
│
├── css/
│   └── styles.css          ← Archivo de estilos
│
├── js/
│   └── app.js              ← Archivo JavaScript modificado
│
└── data/                   ← CARPETA NUEVA para los JSON
    ├── liga.json           ← Partidos de liga
    ├── champions.json      ← Partidos de Champions
    └── historico.json      ← Partidos históricos
```

## 📝 PASOS DE INSTALACIÓN

### 1. Crear la estructura de carpetas

```bash
mkdir css
mkdir js
mkdir data
```

### 2. Colocar los archivos en su lugar

- `index.html` → En la raíz del proyecto
- `styles.css` → Dentro de la carpeta `css/`
- `app.js` → Dentro de la carpeta `js/`
- `liga.json` → Dentro de la carpeta `data/`
- `champions.json` → Dentro de la carpeta `data/`
- `historico.json` → Dentro de la carpeta `data/`

### 3. Verificar las rutas en index.html

El archivo `index.html` debe tener estas líneas:

```html
<link rel="stylesheet" href="./css/styles.css">
<script src="./js/app.js"></script>
```

## ✅ VERIFICACIÓN

Abre el archivo `index.html` en tu navegador. Deberías ver:

1. ✅ El título "¿QUIÉN COÑO FALTA?" con efecto neón
2. ✅ Cuatro botones de modo de juego
3. ✅ Al hacer clic en cualquier modo, debe cargar partidos

Si ves un error "Error al cargar los datos", verifica:
- Que los archivos JSON estén en `/data/`
- Que los JSON sean válidos (sin errores de sintaxis)
- Abre la consola del navegador (F12) para ver errores específicos

## 🔧 CAMBIOS REALIZADOS

### ¿Qué se modificó?

**app.js** - SE MODIFICÓ COMPLETAMENTE
- ❌ ANTES: Datos hardcodeados en el código
- ✅ AHORA: Lee datos desde archivos JSON externos

**index.html** - MÍNIMOS CAMBIOS
- Solo se actualizaron las rutas de CSS y JS
- Todo el HTML permanece idéntico

**styles.css** - SIN CAMBIOS
- Diseño 100% idéntico al original
- Todas las animaciones y efectos intactos

## 📋 FORMATO DE LOS JSON

Consulta el archivo `FORMATO_JSON.md` para saber:
- Estructura exacta de cada archivo JSON
- Cómo añadir nuevos partidos
- Ejemplos de diferentes formaciones
- Troubleshooting

## 🎯 VENTAJAS DE ESTA ESTRUCTURA

✅ **Fácil de mantener**: Solo editas los JSON
✅ **Escalable**: Añade tantos partidos como quieras
✅ **Organizado**: Partidos separados por categoría
✅ **Flexible**: Puedes crear nuevos modos fácilmente
✅ **Sin tocar código**: No necesitas modificar el JavaScript

## 🚀 CÓMO AÑADIR MÁS PARTIDOS

1. Abre el archivo JSON correspondiente (`liga.json`, `champions.json`, o `historico.json`)
2. Copia un partido existente
3. Modifica los datos
4. Asegúrate de que el JSON sigue siendo válido
5. Guarda el archivo
6. Recarga la página en el navegador

## 💡 EJEMPLOS DE USO

### Crear un nuevo modo "Copa del Rey"

1. Crea un nuevo archivo: `data/copa.json`
2. Añade partidos siguiendo el formato
3. Modifica `app.js` añadiendo el nuevo modo:

```javascript
// En la función loadMatchData, añade:
case 'copa':
    files = ['data/copa.json'];
    break;
```

4. Añade el botón en `index.html`:

```html
<div class="mode-btn" onclick="startGame('copa')">
    <div class="mode-btn-title">🏆 COPA DEL REY</div>
    <div class="mode-btn-desc">Eliminatorias de copa</div>
    <div class="mode-btn-teams">Finales memorables...</div>
</div>
```

## 🔍 SOLUCIÓN DE PROBLEMAS

### Problema: "Error al cargar los datos"
**Solución**: 
- Verifica que los archivos JSON estén en la carpeta `/data/`
- Usa un validador JSON online para verificar sintaxis
- Abre la consola del navegador (F12) para ver el error exacto

### Problema: Los jugadores no aparecen
**Solución**:
- Verifica que cada partido tenga exactamente 11 jugadores
- Comprueba que todos los jugadores tengan `name` y `position`

### Problema: El diseño se ve raro
**Solución**:
- Verifica que `styles.css` esté en la carpeta `css/`
- Comprueba la ruta en `index.html`: `<link rel="stylesheet" href="./css/styles.css">`

### Problema: El wordle no funciona
**Solución**:
- Verifica que `app.js` esté en la carpeta `js/`
- Comprueba la ruta en `index.html`: `<script src="./js/app.js"></script>`
- Abre la consola (F12) para ver errores de JavaScript

## 📞 CHECKLIST FINAL

Antes de usar la aplicación, verifica:

- [ ] Todas las carpetas creadas (`css`, `js`, `data`)
- [ ] `index.html` en la raíz
- [ ] `styles.css` en `/css/`
- [ ] `app.js` en `/js/`
- [ ] Los tres JSON en `/data/`
- [ ] Los JSON son válidos (sin errores de sintaxis)
- [ ] Cada partido tiene exactamente 11 jugadores
- [ ] Las rutas en `index.html` son correctas

## 🎉 ¡LISTO!

Si todo está correcto, abre `index.html` en tu navegador y disfruta del juego.

Para añadir más partidos, solo edita los archivos JSON siguiendo el formato en `FORMATO_JSON.md`.

¡Que lo disfrutes! ⚽
