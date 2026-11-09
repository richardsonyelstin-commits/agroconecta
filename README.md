# AgroConecta

Sitio de compra futura agrícola desarrollado con HTML, CSS, Bootstrap y JavaScript. Incluye seis fichas de cultivo, seguimiento de campañas, simulador, formulario de postulación y chat.

Autor: Richardson Yelstin Tantajulca Perez. Curso de Desarrollo Web, IDAT.

## Abrir el sitio

Se puede abrir `index.html` directamente. Para usar un servidor local, instalar Node.js 22 o superior y ejecutar:

```powershell
npm start
```

El sitio queda en `http://127.0.0.1:5500`. El servidor permite reproducir el vídeo con subtítulos; cerrar con Ctrl+C. Las imágenes, fuentes y Bootstrap se sirven desde el proyecto. YouTube y Google Maps necesitan internet.

## Dónde editar

| Carpeta o archivo     | Contenido                                             |
| --------------------- | ----------------------------------------------------- |
| `index.html`          | Inicio, catálogo y seguimiento de campañas            |
| `page/`               | Fichas de cultivo, Nosotros y Contacto                |
| `css/estilos.css`     | Tema, componentes y adaptación a móvil                |
| `css/chatbot.css`     | Ventana y mensajes del chat                           |
| `js/main.js`          | Barras de progreso, ayudas y carruseles               |
| `js/dashboard.js`     | Filtros de campaña y cálculo del simulador            |
| `js/formulario.js`    | Perfiles, validación y confirmación de la postulación |
| `js/postulaciones.js` | Preparación de datos y envío al servidor              |
| `js/chatbot.js`       | Respuestas locales y conexión opcional al chat remoto |
| `js/config.public.js` | Configuración que carga el navegador                  |
| `assets/`             | Imágenes, fuentes, multimedia y librerías externas    |
| `supabase/` y `api/`  | Base de datos y servicios opcionales                  |
| `tools/`              | Servidor local                                        |
| `docs/`               | Informe de entrega, configuración y pruebas           |

Las rutas de `page/` se mantienen para que los enlaces existentes sigan funcionando. `assets/` contiene los archivos que utiliza el sitio; no hay un paso de compilación.

## Configuración

Por defecto, `DEMO_MODE` está activado: el formulario valida los campos y muestra una simulación, sin enviar datos ni adjuntos. El chat responde con información local. Para conectar servicios, seguir [la configuración del backend](docs/backend.md).

El navegador solo carga `js/config.public.js`. `js/config.example.js` sirve de referencia. Las claves privadas van en el servidor y no forman parte de la entrega.

## Revisar cambios

```powershell
npm ci
npm run format:check
```

Para ordenar el formato del código, usar `npm run format`. La [guía de revisión](docs/pruebas.md) describe las comprobaciones manuales del sitio.

El [informe final](docs/informe-final.md) relaciona el proyecto con la rúbrica. La carpeta `docs/` contiene la documentación vigente para la revisión.

Enlace de referencia: [AgroConecta en Vercel](https://agroconecta-two-drab.vercel.app/). Los cambios locales todavía deben publicarse y comprobarse allí.
