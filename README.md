# ReportARG Frontend

**Proyecto Final - Práctica Profesionalizante I**  
**Instituto Superior Santo Domingo**  
**Carrera:** Tecnicatura Superior en Desarrollo de Software  
**Profesora:** Nadia Gallardo  
**Alumnos:** Julieta Landra, Ana Valentina Vargas y Ludmila Mansilla
**Año:** 2026

---

## 📘 Descripción del Proyecto

**ReportARG** es un sistema de información que busca **mejorar la comunicación y la participación ciudadana** en los barrios, permitiendo conectar a vecinos, instituciones y organizaciones mediante una aplicación.

El objetivo principal es **centralizar la información local** —como cortes de servicios, reclamos, alertas, eventos y campañas de salud— en una plataforma única, accesible y confiable para toda la comunidad.

---

## 🎯 Objetivos del Sistema

- Facilitar la **difusión de información** oficial y vecinal.  
- Permitir **denuncias y reclamos** con fotos y ubicación geográfica.  
- Fomentar la **organización comunitaria** a través de foros o grupos temáticos.  
- Brindar acceso a **notificaciones en tiempo real** sobre servicios, emergencias y actividades.  
- Integrar **instituciones oficiales** (municipio, policía, hospitales, etc.) para publicar información verificada.

---

## ⚙️ Tecnologías Utilizadas (Stack Actual)

El frontend de ReportARG está construido con tecnologías modernas para asegurar una experiencia rápida, escalable y mantenible:

- **Framework principal:** [Next.js 15](https://nextjs.org/) (App Router).
- **Librería de UI:** [React 19](https://react.dev/).
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) junto con [HeroUI](https://heroui.com/) para componentes accesibles y atractivos.
- **Autenticación:** [NextAuth.js](https://next-auth.js.org/) con soporte para credenciales locales, Google y Facebook.
- **Formularios y Validación:** `react-hook-form` y `zod`.
- **Notificaciones:** `sonner` para toasts (alertas visuales).
- **Cliente HTTP:** Axios configurado en `apiClient.js` con soporte para interceptores y protección SSR.

---

## 🚀 Cómo levantar el proyecto localmente

1. **Instalar dependencias:**  
   En la raíz del proyecto (donde está el `package.json`), ejecuta:
   ```bash
   npm install
   ```

2. **Configurar las variables de entorno:**  
   Crea un archivo `.env` o `.env.local` basado en el archivo `.env.example` incluido en el repositorio y configura los siguientes valores:

   ```env
   # URL base del backend (generalmente http://localhost:3001)
   NEXT_PUBLIC_API_URL=http://localhost:3001
   
   # Secret para firmar los JWT de NextAuth (cualquier string largo y seguro)
   NEXTAUTH_SECRET=your_nextauth_secret_here
   
   # URL del frontend (generalmente http://localhost:3000)
   NEXTAUTH_URL=http://localhost:3000
   
   # Credenciales OAuth de Google (opcional para auth)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   
   # Credenciales OAuth de Facebook (opcional para auth)
   FACEBOOK_CLIENT_ID=your_facebook_client_id_here
   FACEBOOK_CLIENT_SECRET=your_facebook_client_secret_here
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   El proyecto estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 📂 Estructura de carpetas principal

- **/src/app/**: Contiene las rutas principales de la aplicación usando el App Router de Next.js (por ejemplo, `/login`, `/home`, `/admin`, etc.).
- **/src/components/**: Todos los componentes reutilizables de React. Aquí encontrarás componentes del Panel de Admin, componentes de UI generales (botones, tablas) y layouts.
- **/src/services/**: Archivos dedicados a interactuar con la API, como `apiClient.js` (cliente HTTP base).
- **/src/styles/**: Hojas de estilo globales (ej. `globals.css`, `admin-dash.css`).
- **/src/utils/**: Funciones auxiliares, esquemas de validación Zod (`schemas.js`), y variables globales (`constants.js`).

---

## 👥 Roles del Sistema y Accesos

El sistema maneja 3 tipos de roles de usuarios, y las rutas/vistas se protegen usando *middleware* para asegurar que cada rol solo vea lo que le corresponde:

1. **Admin (`admin`)**
   - Tiene acceso total a la gestión del sistema.
   - **Rutas clave:** `/admin` y todas sus sub-rutas (`/admin/users`, `/admin/institutions`, `/admin/categories`, `/admin/reclamos`, `/admin/roles`, `/admin/settings`).
   
2. **Ciudadano (`ciudadano`)**
   - El usuario común, vecino del barrio. Puede generar reclamos y consumir comunicados.
   - **Rutas clave:** `/home`, `/home/reclamos`, `/home/mapa`.

3. **Institución (`institucion`)**
   - Cuentas verificadas para organizaciones (ej. municipalidad, policía, hospital). Pueden emitir comunicados oficiales.
   - **Rutas clave:** `/home/institucion`, `/home/institucion/comunicados`.

> **Nota:** Todos los roles (incluyendo ciudadanos e instituciones) tienen acceso al panel de su perfil en `/profile` para modificar su información, contraseña y visualizar sus propios reportes.
