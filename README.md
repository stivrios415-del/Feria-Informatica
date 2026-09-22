# Feria de Informática — Gaming Edition (React + Vite)

Migración del sistema original (HTML + JS planos) a React + Vite, manteniendo
exactamente la misma base de datos de Supabase y el mismo diseño visual.

## Instalar y correr

```bash
npm install
npm run dev
```

Abre la URL que te muestre Vite (normalmente `http://localhost:5173`).

Para producción:

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  lib/
    supabaseClient.js   → cliente de Supabase (antes config.js)
    criterios.js         → CATEGORIAS, CRITERIOS, calcularNotaFinal (antes config.js)
  hooks/
    useAdminAuth.js      → sesión + verificación de admin (antes repetido en admin.js)
    useJuezAuth.js        → login por código (antes repetido en juez.js)
    useRealtimeRefresh.js → suscripción realtime genérica (antes copiada 3 veces)
  components/
    Topbar.jsx, Tabs.jsx, MsgBox.jsx, Badge.jsx, CriterioSlider.jsx
  pages/
    Home.jsx        → antes index.html (conserva su tema cyan/magenta propio en Home.css)
    Inscripcion.jsx  → antes inscripcion.html + inscripcion.js
    Juez.jsx         → antes juez.html + juez.js
    Admin.jsx        → antes admin.html + admin.js
    Ranking.jsx      → antes ranking.html + ranking.js
  App.jsx            → rutas (react-router-dom, SPA de una sola página)
  index.css          → tu style.css original (tema azul/dorado), sin cambios
```

## Qué cambió respecto al original

- Todo vive en **una sola app** con rutas de React Router; ya no son 5 páginas
  HTML sueltas — navegar entre ellas no recarga el navegador.
- La lógica repetida (login de admin, login de juez por código, suscripción
  realtime a tablas de Supabase, cálculo de nota final) ahora vive **una sola
  vez** en `lib/` y `hooks/`, en vez de estar copiada en cada archivo `.js`.
- El manejo de formularios pasó de leer `document.getElementById(...).value` a
  estado controlado de React (`useState`).
- Las credenciales de Supabase y las claves anónimas siguen siendo las mismas
  (`src/lib/supabaseClient.js`) — nada cambia del lado de la base de datos,
  tablas, RPCs (`vincular_juez`, `mi_juez`) ni políticas RLS.

## Nota

Este proyecto se generó sin acceso a internet en este entorno, así que no se
corrió `npm install` aquí — al hacerlo tú localmente, npm resolverá las
versiones exactas de las dependencias listadas en `package.json`.
