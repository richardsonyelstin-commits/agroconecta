# Informe final de AgroConecta

Curso: Desarrollo Web, IDAT. Autor: Richardson Yelstin Tantajulca Perez. Revisión: 9 de noviembre de 2026.

AgroConecta presenta un modelo de compra futura agrícola en nueve páginas. El catálogo reúne seis cultivos; el inicio incluye seguimiento de campañas y un simulador de interés simple. El formulario distingue productores, inversionistas y cooperativas.

La rúbrica del PDF tiene dos criterios que suman 20 puntos: HTML, estructura y experiencia de uso (12 puntos), y CSS con Bootstrap (8 puntos). La calificación corresponde al docente. Los servicios de datos y chat son extensiones y no sustituyen esos criterios.

## HTML y funcionamiento

Cada página tiene idioma español, título, un `h1`, navegación, contenido principal y pie. El menú se adapta a móvil y existe un enlace para saltar al contenido. Las fichas usan tablas con encabezados y enlaces relativos.

Los filtros del dashboard actualizan el resumen de la campaña seleccionada. El simulador sincroniza el campo numérico con el deslizador y permite llevar monto, cultivo y plazo al formulario. Los importes van de S/. 500 a S/. 50,000, en pasos de S/. 500.

En el formulario, los campos de perfiles inactivos quedan deshabilitados. Los controles tienen etiquetas y mensajes de error asociados. La validación admite DNI de ocho o RUC de once dígitos y comprueba los rangos de cada perfil. El servidor opcional vuelve a validar los datos.

La confirmación diferencia simulación, registro confirmado y error. El modo predeterminado no guarda datos ni envía correos. Si falla un envío, conserva los campos. El chat cerrado queda fuera del recorrido de teclado; al abrirlo recibe el foco y Escape permite cerrarlo y volver al botón.

El vídeo incluye MP4 y WebM, subtítulos VTT, transcripción y descripción visual. Su cuadro conserva el formato 16:9 durante la reproducción. El audio tiene una transcripción completa.

Las imágenes utilizan WebP, variantes según pantalla, dimensiones declaradas y carga diferida. Se renovaron la imagen principal, el encuentro de productores y las escenas de procesamiento de café y cacao, conservando sus proporciones y las versiones de 960 y 480 píxeles de ancho.

## CSS y Bootstrap

Bootstrap 5.3.3 aporta la grilla, navegación, pestañas, carruseles, acordeón y modal. Se sirve localmente para permitir también la apertura directa de los HTML. La hoja `css/estilos.css` define colores, medidas, tarjetas y reglas para móvil; `css/chatbot.css` reúne el aspecto del chat.

El proyecto usa Flexbox, Grid, `clamp()`, transiciones y transformaciones. La fuente Manrope se incluye en WOFF2, con pesos del 400 al 800, licencia OFL y `font-display: swap`. Bootstrap conserva su licencia MIT en `assets/vendor/`.

El botón principal usa blanco sobre `#965711`, con un contraste aproximado de 5.74:1. Las tablas y el catálogo pueden desplazarse dentro de sus contenedores; la página no oculta globalmente los desbordamientos horizontales. Las tarjetas de una misma fila conservan alturas iguales.

Estas seis animaciones cubren el requisito de al menos cinco de la rúbrica:

| Nombre            | Dónde se observa                                            |
| ----------------- | ----------------------------------------------------------- |
| `pulse-dot-agro`  | Dos pulsos del indicador de seguimiento al cargar el inicio |
| `resaltarSeccion` | Resaltado de la sección al navegar por un ancla             |
| `fadeInRol`       | Entrada de campos al cambiar el perfil del formulario       |
| `agrobot-pulse`   | Dos pulsos de la insignia del chat                          |
| `agrobot-fadein`  | Entrada del aviso de ayuda en escritorio                    |
| `agrobot-blink`   | Indicador de escritura mientras se espera una respuesta     |

Las animaciones respetan `prefers-reduced-motion`. Los carruseles arrancan detenidos y tienen controles de reproducción y pausa. No se declara cumplimiento AAA ni una certificación WCAG integral.

## Revisión y entrega

La [guía de revisión](pruebas.md) describe cómo comprobar el sitio manualmente. La organización del código y las instrucciones para ejecutarlo están en el [README](../README.md).

El código de los servicios usa referencias UUID generadas por Postgres, almacenamiento privado y lectura restringida a administradores. Las comprobaciones locales realizadas antes de la entrega utilizaron servicios simulados y no demuestran el estado de un servicio remoto.

El enlace de referencia es [AgroConecta en Vercel](https://agroconecta-two-drab.vercel.app/). Falta publicar esta revisión y comprobarla en ese enlace. Si se activa el registro persistente, también falta aplicar y verificar el esquema y las funciones en Supabase remoto. No se han enviado datos personales ni correos, ni se ha utilizado el proveedor de chat con credenciales reales.
