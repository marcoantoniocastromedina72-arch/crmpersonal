-- Invitadigital CRM -- esquema de Supabase
-- Cópialo y pégalo en Supabase -> SQL Editor -> Run, una sola vez por proyecto.
-- Crea las 3 tablas que el CRM sincroniza y activa Row Level Security (RLS)
-- para que cada usuario SOLO pueda ver/editar sus propias filas.

create table if not exists proyectos (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  cliente text not null,
  tipo text not null,
  estado text not null,
  precio numeric not null default 0,
  progreso int not null default 0,
  fecha_entrega date not null,
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create table if not exists notas_pago (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  cliente text not null,
  proyecto_id uuid,
  concepto text not null,
  monto numeric not null default 0,
  monto_recibido numeric not null default 0,
  fecha date not null,
  estado text not null,
  metodo text not null,
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create table if not exists miembros (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  email text,
  tipo text not null,
  rol text not null,
  activo boolean not null default true,
  descripcion text,
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

alter table proyectos enable row level security;
alter table notas_pago enable row level security;
alter table miembros enable row level security;

create policy "Dueño lee/escribe sus proyectos" on proyectos
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Dueño lee/escribe sus notas de pago" on notas_pago
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Dueño lee/escribe sus miembros" on miembros
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
