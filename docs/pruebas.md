# Revisión manual del sitio

Abrir `index.html` o ejecutar `npm start` y visitar `http://127.0.0.1:5500`.

- Recorrer las nueve páginas y comprobar enlaces, imágenes y navegación en escritorio y móvil.
- Seleccionar cada cultivo del seguimiento y comprobar que cambian sus cifras; volver a Todos los Valles.
- Cambiar el importe del simulador y comprobar que coincide con el deslizador y se transfiere al formulario.
- Revisar los tres perfiles del formulario, sus campos obligatorios y los mensajes de error. Con `DEMO_MODE` activado, la confirmación corresponde a una simulación y no guarda datos.
- Usar el menú y el chat con teclado. Comprobar el foco al abrir el chat y al cerrarlo con Escape.
- Reproducir el vídeo, activar los subtítulos y comprobar que el cuadro mantiene su tamaño. Revisar también el audio y sus transcripciones.
- Comprobar que las tarjetas de una misma fila conservan su altura y que no hay desplazamiento horizontal de toda la página.

Los servicios opcionales requieren una comprobación adicional en el entorno donde se publiquen. La configuración está en [backend.md](backend.md).

Para revisar el formato del código, instalar las herramientas con `npm ci` y ejecutar `npm run format:check`.
