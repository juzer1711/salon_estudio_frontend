# Roomix · Frontend

Interfaz web de **Roomix**, un proyecto educativo de salas de estudio colaborativas con chat, videollamadas y pantalla compartida desde el navegador.

**[Abrir demo](https://salon-estudio-frontend.vercel.app)** · [Proyecto completo](https://github.com/juzer1711/Roomix) · [Backend](https://github.com/juzer1711/salon_estudio_backend)

## Funcionalidades

- Registro e inicio de sesión con correo y contraseña o Google mediante Firebase Authentication.
- Gestión del perfil, nombre de usuario y avatar, con carga de imágenes a Cloudinary.
- Creación, búsqueda por identificador, edición y eliminación de salas de estudio.
- Consulta de salas propias y salas en las que participas, con opciones para unirte o abandonarlas.
- Vista previa de cámara y micrófono antes de entrar a una sala.
- Chat en tiempo real con historial de mensajes.
- Videollamadas con controles de cámara y micrófono, participantes conectados y pantalla compartida.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| React y TypeScript | Componentes y lógica de la aplicación. |
| Vite | Desarrollo y compilación. |
| React Router | Navegación y rutas protegidas. |
| Zustand | Estado de autenticación y salas. |
| Tailwind CSS y CSS | Estilos de la interfaz. |
| Framer Motion | Animaciones. |
| Lucide y React Icons | Iconos. |
| Zod | Validación de datos. |
| Firebase Authentication | Autenticación con correo y Google. |
| Socket.IO Client | Chat, presencia y señalización WebRTC. |
| WebRTC | Audio, video y pantalla compartida. |
| Cloudinary | Carga de imágenes de perfil. |

## Desarrollo local

Necesitas Node.js compatible con Vite 8 y npm, un proyecto de Firebase con Authentication y Cloud Firestore configurados, y el [backend de Roomix](https://github.com/juzer1711/salon_estudio_backend) disponible.

```bash
git clone https://github.com/juzer1711/salon_estudio_frontend.git
cd salon_estudio_frontend
npm install
```

Crea un archivo `.env.local` en la raíz con la configuración de tu aplicación web de Firebase y las direcciones del backend:

```dotenv
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

Habilita los proveedores de correo/contraseña y Google en Firebase Authentication y agrega el dominio de desarrollo a los dominios autorizados. El frontend y el backend deben utilizar el mismo proyecto de Firebase.

Opcionalmente, puedes configurar un servidor TURN para las conexiones multimedia:

```dotenv
VITE_TURN_URL=turn:tu_servidor:3478
VITE_TURN_USERNAME=tu_usuario
VITE_TURN_CREDENTIAL=tu_credencial
```

La carga de avatares utiliza la configuración de Cloudinary definida en [imageUploadService.ts](./src/services/imageUploadService.ts). Para usar tu propia cuenta, ajusta el nombre de nube y el preset de carga en ese servicio.

```bash
npm run dev
```

Abre la dirección que indique Vite, normalmente `http://localhost:5173`. Permite el acceso a cámara y micrófono para probar la videollamada.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Comprueba TypeScript y genera la aplicación en `dist/`. |
| `npm run preview` | Sirve localmente la compilación generada. |
| `npm run lint` | Ejecuta ESLint. |

## Despliegue

El frontend está desplegado en **Vercel**, el backend en **Render** y la base de datos en **Cloud Firestore**. Para un despliegue propio, configura las variables `VITE_*` antes de compilar, utiliza las URL HTTPS del backend y autoriza el dominio del frontend en Firebase Authentication y en el CORS del servidor.

## Estructura

- [src/pages](./src/pages): pantallas de autenticación, perfil, salas y sesión de estudio.
- [src/components](./src/components): componentes de interfaz, vista previa y cuadrícula de video.
- [src/store](./src/store): estado de autenticación y salas.
- [src/services](./src/services): integración con la API, Socket.IO, WebRTC y Cloudinary.
- [src/hooks](./src/hooks): lógica de conexión a salas y gestión multimedia.
- [src/config](./src/config): configuración de Firebase y direcciones del backend.

Este repositorio forma parte de [Roomix](https://github.com/juzer1711/Roomix), desarrollado con fines educativos para explorar aplicaciones full stack y comunicación en tiempo real.
