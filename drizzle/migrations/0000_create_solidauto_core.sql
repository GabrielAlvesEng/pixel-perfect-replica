-- ============ PERFIS ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  name text not null default '',
  created_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

create policy "profiles: equipe pode ver" on public.profiles
  for select to authenticated using (true);
create policy "profiles: dono pode editar" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- cria o perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(coalesce(new.email,''), '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(coalesce(new.email,''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ PROJETOS ============
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title1 text not null default '',
  title2 text not null default '',
  order_no text not null default '',
  status text not null default 'lido',
  read_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

create policy "projects: equipe acessa tudo" on public.projects
  for all to authenticated using (true) with check (true);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ============ ARVORE E QUANTIDADES ============
create table public.project_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_id uuid references public.project_nodes(id) on delete cascade,
  code text not null default '',
  node_type text not null default 'Montagem' check (node_type in ('Montagem','Soldagem')),
  title3 text not null default '',
  qty_parent int not null default 1,
  qty_total int not null default 1,
  status text not null default 'ok' check (status in ('ok','aviso','erro')),
  position int not null default 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_nodes TO authenticated;
GRANT ALL ON public.project_nodes TO service_role;

ALTER TABLE public.project_nodes ENABLE ROW LEVEL SECURITY;

create policy "project_nodes: equipe acessa tudo" on public.project_nodes
  for all to authenticated using (true) with check (true);

-- ============ COMERCIAIS E REFERENCIAS ============
create table public.project_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null default '',
  file text not null default '',
  folder text not null default '',
  qty int not null default 1,
  item_type text not null default 'Peça',
  kind text not null default 'CM' check (kind in ('CM','REF','Projeto')),
  position int not null default 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_items TO authenticated;
GRANT ALL ON public.project_items TO service_role;

ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;

create policy "project_items: equipe acessa tudo" on public.project_items
  for all to authenticated using (true) with check (true);

-- ============ VERIFICACOES DA LEITURA ============
create table public.project_checks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  severity text not null default 'ok' check (severity in ('ok','aviso','erro')),
  code text not null default '',
  message text not null default ''
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_checks TO authenticated;
GRANT ALL ON public.project_checks TO service_role;

ALTER TABLE public.project_checks ENABLE ROW LEVEL SECURITY;

create policy "project_checks: equipe acessa tudo" on public.project_checks
  for all to authenticated using (true) with check (true);

-- ============ LISTA DE CORTE ============
create table public.cut_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  weld_code text not null default '',
  weld_title text not null default '',
  pos text not null default '',
  profile text not null default '',
  material text not null default '',
  length_mm numeric(10,2) not null default 0,
  qty int not null default 1,
  kgm numeric(10,2) not null default 0,
  status text not null default 'ok' check (status in ('ok','aviso','erro')),
  position int not null default 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cut_items TO authenticated;
GRANT ALL ON public.cut_items TO service_role;

ALTER TABLE public.cut_items ENABLE ROW LEVEL SECURITY;

create policy "cut_items: equipe acessa tudo" on public.cut_items
  for all to authenticated using (true) with check (true);

-- ============ CHAPAS / DXF ============
create table public.sheets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  material text not null default '',
  thickness text not null default '',
  code text not null default '',
  name text not null default '',
  w_mm numeric(10,2) not null default 0,
  h_mm numeric(10,2) not null default 0,
  qty int not null default 1,
  holes int not null default 0,
  shape text not null default 'rect' check (shape in ('rect','l','flange','gusset')),
  position int not null default 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sheets TO authenticated;
GRANT ALL ON public.sheets TO service_role;

ALTER TABLE public.sheets ENABLE ROW LEVEL SECURITY;

create policy "sheets: equipe acessa tudo" on public.sheets
  for all to authenticated using (true) with check (true);

-- ============ LISTAS DE MATERIAIS ============
create table public.material_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  assembly text not null default '',
  title text not null default '',
  item text not null default '',
  description text not null default '',
  spec text not null default '',
  unit text not null default 'pç',
  qty int not null default 1,
  position int not null default 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_items TO authenticated;
GRANT ALL ON public.material_items TO service_role;

ALTER TABLE public.material_items ENABLE ROW LEVEL SECURITY;

create policy "material_items: equipe acessa tudo" on public.material_items
  for all to authenticated using (true) with check (true);