create table if not exists categories (
  id text primary key,
  name text not null,
  base_severity integer not null check (base_severity between 1 and 5)
);

create table if not exists tickets (
  id uuid primary key,
  category_id text not null references categories(id),
  description text not null,
  citizen_email text not null,
  district text not null,
  priority integer not null check (priority between 1 and 5),
  status text not null default 'OPEN',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key,
  type text not null,
  recipient text not null,
  message text not null,
  created_at timestamptz not null default now()
);

insert into categories (id, name, base_severity) values
  ('pothole', 'Buraco em via', 4),
  ('lighting', 'Iluminacao publica', 3),
  ('waste', 'Descarte irregular', 2),
  ('flood', 'Alagamento', 5),
  ('other', 'Outros / Avulso', 2)
on conflict (id) do update set
  name = excluded.name,
  base_severity = excluded.base_severity;
