# Invitadigital CRM

CRM personal para gestionar proyectos, clientes y notas de pago de Invitadigital.
Funciona **offline-first**: todos los datos viven en tu dispositivo (IndexedDB
vía Dexie) y, si configuras Supabase, se sincronizan en segundo plano cada vez
que hay internet.

## Arranque rápido (modo local, sin configurar nada)

```bash
npm install
npm run dev
```

Así, tal cual, el CRM ya funciona completo: crear/editar/eliminar proyectos y
notas de pago, agenda, dashboard. Sin login, sin internet. Los datos quedan
guardados en el navegador de ese dispositivo.

## Activar login + sincronización entre dispositivos (Supabase)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **Project Settings -> API**, copia el `Project URL` y el `anon public key`.
3. Copia `.env.example` a `.env` y pega ahí esos dos valores:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
4. En Supabase, ve a **SQL Editor**, pega el contenido de `supabase-schema.sql`
   de este repo y dale **Run**. Esto crea las tablas y activa Row Level
   Security (cada quien solo ve sus propios datos).
5. Crea tu usuario de acceso: en Supabase ve a **Authentication -> Users ->
   Add user**, pon tu correo (`marcoantoniocastromedina72@gmail.com`) y la
   contraseña que quieras usar. **No la pongas en el código ni la subas a
   GitHub** — se crea directo ahí, en el dashboard de Supabase, y solo tú la
   ves.
6. Reinicia `npm run dev`. Ahora la app te va a pedir login. Una vez que
   inicias sesión una vez con internet, la sesión queda guardada y puedes
   seguir usando el CRM sin conexión después.

## Cómo funciona la sincronización

- Cada proyecto/nota/miembro tiene un campo `dirty` (cambios sin subir) y
  `updatedAt`. Al reconectar, primero se suben tus cambios pendientes y luego
  se bajan los cambios remotos.
- Si edita el mismo registro desde dos dispositivos sin conexión, gana el que
  tenga `updatedAt` más reciente (last-write-wins). No es un sistema de
  resolución de conflictos avanzado, pero es suficiente para 1-2 dispositivos.
- Puedes forzar una sincronización manual desde **Configuración ->
  Preferencias del CRM**.

## Roles y "agentes"

En **Configuración -> Equipo y roles** puedes registrar colaboradores o
agentes de IA (automatizaciones) que en el futuro se conecten al CRM. Su rol
(`owner`, `colaborador`, `agente_ia`) determina qué pueden crear, editar o
eliminar — ver `src/types/team.ts`.

## Stack

React 19 + TypeScript + Vite 8 + Tailwind v4 + Dexie (persistencia local) +
Supabase (auth + sincronización, opcional) + PWA.

## Despliegue

Sube el proyecto a Vercel o Netlify apuntando a tu dominio, y agrega las
mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
en la configuración del proyecto en esa plataforma.

Node requerido: 20.19+ o 22.12+.
