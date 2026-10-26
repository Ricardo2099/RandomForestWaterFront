# Frontend de potabilidad del agua (React + Vite)

Interfaz para consumir el endpoint `/score` del backend FastAPI del proyecto RandomForestWater.

## Ejecutar localmente

1. Crear un archivo `.env` a partir de `.env.example`.
2. Cambiar la variable `VITE_API_URL` por la URL real del backend desplegado en Render, sin `/score` al final.
3. Ejecutar `npm install` y `npm run dev`.

## Desplegar en Render

1. Subir este frontend a un repositorio GitHub nuevo.
2. Render → New → Static Site → conectar el repositorio.
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. En Environment, crear `VITE_API_URL` con la URL completa del backend, sin `/score`.
6. Crear o redeplegar el Static Site. La variable Vite se integra durante el build.

El backend existente ya permite CORS mediante FastAPI. El frontend envía las 9 características a `/score` y muestra `prediccion` y `probabilidad_potable`.

El resultado es una estimación del modelo, no una certificación sanitaria del agua.
