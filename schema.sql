-- 1. Crear secuencias necesarias antes de las tablas
CREATE SEQUENCE IF NOT EXISTS public.perfil_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.usuario_id_usuario_seq;
CREATE SEQUENCE IF NOT EXISTS public.analisis_id_analisis_seq;

-- 2. Tabla Base: Perfil (no depende de nadie)
CREATE TABLE IF NOT EXISTS public.perfil (
  id integer NOT NULL DEFAULT nextval('public.perfil_id_seq'::regclass),
  usuario character varying NOT NULL UNIQUE,
  contrasena character varying NOT NULL,
  codigo_unico text,
  verification_code text,
  code_expires_at timestamp with time zone,
  is_verified boolean NOT NULL DEFAULT false,
  CONSTRAINT perfil_pkey PRIMARY KEY (id)
);

-- 3. Tabla: Usuario (depende de Perfil)
CREATE TABLE IF NOT EXISTS public.usuario (
  id_usuario integer NOT NULL DEFAULT nextval('public.usuario_id_usuario_seq'::regclass),
  id_perfil integer NOT NULL,
  nombre character varying,
  telefono character varying,
  direccion character varying,
  CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario),
  CONSTRAINT usuario_id_perfil_fkey FOREIGN KEY (id_perfil) 
    REFERENCES public.perfil(id) ON DELETE CASCADE
);

-- 4. Tabla: Paciente (depende de Perfil vía id_institucion)
CREATE TABLE IF NOT EXISTS public.paciente (
  id_paciente bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  apellido character varying NOT NULL,
  direccion character varying,
  telefono character varying,
  sexo character varying NOT NULL,
  fecha_de_nacimiento date NOT NULL,
  fecha_de_diagnostico date,
  cedula bigint NOT NULL UNIQUE,
  id_institucion integer NOT NULL,
  grupo_sanguineo text,
  CONSTRAINT paciente_pkey PRIMARY KEY (id_paciente),
  CONSTRAINT paciente_id_institucion_fkey FOREIGN KEY (id_institucion) 
    REFERENCES public.perfil(id) ON DELETE RESTRICT
);

-- 5. Tabla: Analisis (depende de Paciente)
CREATE TABLE IF NOT EXISTS public.analisis (
  id_analisis integer NOT NULL DEFAULT nextval('public.analisis_id_analisis_seq'::regclass),
  id_paciente bigint,
  glucosa real NOT NULL,
  insulina real NOT NULL,
  numero_de_embarazos real NOT NULL,
  presion_arterial real NOT NULL,
  grosor_de_piel real NOT NULL,
  indice_de_masa_corporal real NOT NULL,
  edad integer NOT NULL,
  probabilidad_diabetes real,
  fecha_de_analisis date NOT NULL,
  funcion_de_herencia double precision,
  CONSTRAINT analisis_pkey PRIMARY KEY (id_analisis),
  CONSTRAINT analisis_id_paciente_fkey FOREIGN KEY (id_paciente) 
    REFERENCES public.paciente(id_paciente) ON DELETE CASCADE
);