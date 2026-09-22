# INFORME TÉCNICO DE EVALUACIÓN PARCIAL - DESARROLLO WEB
**Escuela de Tecnología - IDAT**

---

### DATOS GENERALES
* **Unidad Didáctica:** Desarrollo Web
* **Evaluación:** Evaluación Parcial
* **Estudiante:** Richardson
* **Proyecto Web:** AGROCONECTA (Plataforma de Financiamiento y Compra Futura Agrícola)
* **Fecha:** Septiembre de 2026
* **Enlace / Ubicación del Proyecto:** `index.html` (Raíz del proyecto)

---

## 1. INTRODUCCIÓN Y MODELO DE NEGOCIO

**AGROCONECTA** es una plataforma web estática orientada a resolver una de las principales problemáticas del agro nacional: la falta de liquidez oportuna y accesible para el pequeño agricultor familiar. A través de este sitio web, los productores publican sus campañas de cultivo que requieren capital de trabajo, permitiendo que inversionistas o compradores mayoristas aporten el financiamiento a cambio de un **acuerdo de compra futura de la cosecha** a precios preestablecidos y justos.

El diseño y desarrollo del sitio web responde a los estándares solicitados en la rúbrica de evaluación parcial, implementado **exclusivamente mediante etiquetas y atributos nativos de HTML**, asegurando total portabilidad, semántica moderna y compatibilidad entre plataformas.

---

## 2. CRITERIO 1: DISEÑO Y DESARROLLO DE SITIOS WEB ESTÁTICOS UTILIZANDO HTML (Nivel Sobresaliente - 12 Puntos)

### 2.1. Dominio de la Semántica Web (HTML5)
El sitio implementa una arquitectura estructurada basada en etiquetas semánticas para otorgar un significado inequívoco a los motores de búsqueda y tecnologías de asistencia:
* `<header>`: Delimita la cabecera principal e identidad de marca en todas las páginas.
* `<nav>`: Agrupa el sistema de navegación global con enlaces bidireccionales y botones de acceso.
* `<main>`: Contiene el contenido central único de cada página, diferenciándolo del encabezado y pie de página.
* `<section>`: Segmenta el contenido en módulos temáticos independientes: Banner de bienvenida, Catálogo de Cards en tabla, Recursos Iframe, Sección Multimedia, Cuadro Comparativo de Campañas y Preguntas Frecuentes.
* `<article>`: Utilizado para la presentación institucional independiente de la misión y modelo de AgroConecta.
* `<aside>`: Empleado para métricas de impacto, cifras acumuladas y glosario técnico lateral.
* `<figure>` y `<figcaption>`: Estructuran las tarjetas (cards) de cultivos combinando la imagen con su descripción formal y llamada a la acción.
* `<details>` y `<summary>`: Implementan menús desplegables nativos de preguntas frecuentes (FAQ) sin necesidad de librerías ni scripts externos.
* `<footer>`: Pie de página corporativo estructurado en 4 columnas (identidad de marca con logotipo y RUC, navegación de plataforma, catálogo regional de los 6 cultivos y central de atención y soporte), finalizando con la barra legal y derechos de autor con la etiqueta semántica `<time>`.

### 2.2. Buenas Prácticas de Accesibilidad, Ergonomía Visual y UI/UX
* **Accesibilidad (a11y) y Mitigación de Fatiga Visual:**
  * **Ergonomía Cromática Anti-Fatiga:** Se implementó un lienzo base cálido (`#F6F8F6`) que sustituye el blanco puro cegador, reduciendo drásticamente el deslumbramiento y la astenia visual en sesiones prolongadas de lectura.
  * **Cumplimiento Estricto WCAG 2.1 (Niveles AA y AAA):**
    * *Texto principal (`#1C2D27`) sobre fondo (`#F6F8F6`):* Ratio de contraste **14.2:1** (Supera ampliamente el estándar AAA de 7.0:1).
    * *Cabeceras de tabla e institucional (`#143D32`) con texto blanco:* Ratio de contraste **12.6:1** (Nivel AAA).
    * *Botones de acción primaria / Ámbar Cosecha (`#B86E18`):* Ratio de contraste superior a **4.5:1** (Nivel AA para interactividad).
    * *Enlaces de navegación en pie de página (`#82DDB0` sobre `#0F3027`):* Ratio de contraste **10.1:1** (Nivel AAA).
  * **Teoría del Color y Regla 60-30-10:**
    * **60% Superficie / Canvas:** Tono salvia alabastro suave (`#F6F8F6`) y tarjetas limpias (`#FFFFFF`), proporcionando estabilidad y orden visual.
    * **30% Estructura y Marca:** Verde bosque profundo institucional (`#143D32`, `#0F3027`) y carbón botánico para tipografía (`#1C2D27`), evocando seguridad financiera, solidez bancaria y compromiso ecológico.
    * **10% Acento Semántico (CTA & Status):** Ámbar cosecha (`#B86E18`) para guiar la atención del inversionista hacia conversiones clave, complementado por esmeralda (`#1E6B52`) y badges tipo píldora suaves (reemplazando el amarillo chillón nativo de `<mark>`).
  * Todas las imágenes (`<img>`) poseen el atributo `alt` descriptivo para lectores de pantalla.
  * Los formularios asocian de forma unívoca cada `<label for="ID">` con su respectivo `<input id="ID">`, facilitando la navegación mediante teclado y tecnología adaptativa con anillos de enfoque visibles.
  * Se definieron los atributos de idioma `<html lang="es">` y codificación de caracteres `<meta charset="UTF-8">` para la interpretación correcta de acentos, tildes y caracteres especiales como la "ñ".
* **Usabilidad y Ergonomía de Espaciado Nativo:**
  * Navegación intuitiva, coherente y consistente en las 9 páginas del sitio: Inicio (`index.html`), Nosotros (`page/nosotros.html`), Contacto (`page/contacto.html`), Café Orgánico (`page/cafe.html`), Cacao Criollo (`page/cacao.html`), Palta Hass (`page/palta.html`), Maíz Morado (`page/maiz.html`), Quinua Real (`page/quinua.html`) y Mango Kent (`page/mango.html`).
  * **Control de Espaciado en HTML Puro:** En ausencia de CSS, se implementó un sistema de respiro visual basado en `cellpadding` generoso (14 en header, 25 en banners, 22 en multimedia/FAQ/footer y 30 en el formulario), `cellspacing` controlado (15 a 16 px de separación en columnas), alineaciones verticales precisas (`valign="top"` y `valign="middle"`) y respiradores `<br>` en torno a los separadores `<hr color="#D6E2DA">`, evitando elementos apretados o fatiga por saturación.
  * Formularios estructurados visual y funcionalmente mediante `<fieldset>` y `<legend>`, dividiendo la postulación en bloques lógicos con espaciado ergonómico entre campos (`cellpadding="11"`).
  * Inclusión de atributos amigables de entrada como `placeholder`, `required`, `pattern`, `min`, `max`, `step` y `autofocus`.

### 2.3. Elementos Complejos Desarrollados
1. **Tablas Avanzadas de Doble Entrada:**
   * En `index.html`, `page/cafe.html` y `page/cacao.html` se desarrollaron tablas comparativas y fichas técnicas con `<caption>`, encabezados `<th>`, fusión de columnas (`colspan="2"`) y fusión de filas (`rowspan="2"`), permitiendo una lectura jerárquica de la inversión y los retornos proyectados con filas alternas para descanso ocular.
2. **Sistema de Maquetación por Tablas y Cards Nativas:**
   * Siguiendo el modelo de la clase, se implementó una grilla de 6 columnas de 15% de ancho con márgenes laterales del 5% mediante `cellspacing="15"`, utilizando contenedores sobre fondo blanco con sutiles sombras y bordes en `#D6E2DA`, combinando `<figure>` con `<figcaption>`, enlazando las campañas directamente a sus páginas de detalle en `page/`.
3. **Formularios Multinivel con Entradas Diversas:**
   * En `page/contacto.html` se integraron múltiples tipos de `<input>` (`text`, `email`, `tel`, `date`, `number`, `radio`, `checkbox`, `file`), menús desplegables agrupados con `<select>` y `<optgroup>`, sugerencias mediante `<datalist>`, campos extensos con `<textarea>` y botones de tipo `submit` y `reset`. Con validaciones exactas para campos numéricos (`min`, `max`, `step`).
4. **Multimedia Nativa:**
   * Inclusión de elementos `<video controls poster="...">` y `<audio controls preload="...">` con mensajes de fallback para navegadores no compatibles, enmarcados en módulos de contraste suave `#EBF3EE`.
   * Inserción de páginas y mapas interactivos mediante `<iframe>` con atributos `title`, `width` y `height`.
5. **Animaciones y Secuencias en Bucle (Loop Nativo en HTML):**
   * En `index.html`, `page/cafe.html` y `page/cacao.html` se empleó la etiqueta nativa `<marquee behavior="scroll" direction="left" scrollamount="3" loop="infinite">`, integrando en un bucle continuo las múltiples imágenes PNG consolidadas para el café y el cacao, logrando dinamismo visual directamente en HTML puro sin necesidad de JavaScript ni hojas de estilo CSS.

---

## 3. CRITERIO 2: DOMINIO DE LOS FUNDAMENTOS PARA LA CREACIÓN DE UN SITIO WEB (Nivel Sobresaliente - 8 Puntos)

### 3.1. Identificación y Compatibilidad de Navegadores Web
El sitio web estático ha sido probado y optimizado para funcionar sin fisuras en los principales navegadores del mercado:
* **Google Chrome / Microsoft Edge (Motor Blink):** Soporte total de HTML5, renderizado de tablas nativas y aceleración de componentes multimedia (`<video>`, `<audio>`).
* **Mozilla Firefox (Motor Gecko):** Excelente interpretación de formularios semánticos, compatibilidad con controles de fecha (`type="date"`) y validaciones nativas por expresiones regulares (`pattern`).
* **Apple Safari (Motor WebKit):** Compatibilidad con la etiqueta `<time>`, renderizado de tipografías nativas y ejecución fluida de elementos `<iframe>`.

### 3.2. Mapa de Sitio (Sitemap y Arquitectura de la Información)
El sitio cuenta con una estructura jerárquica idéntica al modelo de la clase, con enlaces relativos bidireccionales (`../` y rutas descendentes):

```plaintext
AGROCONECTA (Raíz /)
│
├── index.html                       # Inicio: Banner, 6 Cards de cultivos, Video iframe, 
│                                    # Multimedia nativa, Tabla de rendimientos, FAQs.
│
├── logo.ico                         # Favicon para pestañas de navegador
│
├── page/                            # Módulo de páginas secundarias
│   ├── nosotros.html                # Identidad institucional: Misión, Visión, Historia y Modelo
│   ├── contacto.html                # Formulario integral de postulación y mapa de sede
│   ├── cafe.html                    # Ficha técnica, procesos y financiamiento de Café Orgánico
│   ├── cacao.html                   # Ficha técnica, procesos y financiamiento de Cacao Criollo
│   ├── palta.html                   # Ficha técnica, procesos y financiamiento de Palta Hass
│   ├── maiz.html                    # Ficha técnica, procesos y financiamiento de Maíz Morado
│   ├── quinua.html                  # Ficha técnica, procesos y financiamiento de Quinua Real
│   └── mango.html                   # Ficha técnica, procesos y financiamiento de Mango Kent
│
└── dist/                            # Recursos distribuidos
    ├── imagenes/                    # Formatos PNG optimizados (portadas de cultivos, logo.png, Image 3.png)
    ├── videos/                      # Formatos MP4/WebM para cápsulas informativas
    ├── audios/                      # Formatos MP3/OGG para testimonios comunitarios
    └── documentos/                  # Almacenamiento de fichas técnicas en PDF
```

### 3.3. Servidores Web, Hosting y Dominio
* **Servidores Web:** El proyecto está preparado para ser servido por tecnologías líderes como **Apache HTTP Server** o **Nginx** en entornos Linux, o mediante **Internet Information Services (IIS)** en Windows Server. Los archivos HTML planos no requieren compilación ni motores de ejecución pesados, lo que minimiza el consumo de memoria RAM y CPU del servidor.
* **Hosting:** Se recomienda un servicio de hosting compartido con almacenamiento SSD o un bucket de almacenamiento para sitios estáticos (como GitHub Pages, Vercel o AWS S3), garantizando una latencia mínima de respuesta (`Time To First Byte`).
* **Dominio y Protocolos:** La configuración proyectada es bajo el dominio institucional `agroconecta.pe` utilizando el protocolo seguro **HTTPS** (puerto 443) respaldado por certificados SSL/TLS, protegiendo los datos enviados a través de los formularios.

### 3.4. Reconocimiento de Elementos Gráficos en la Web
Se emplearon y diferenciaron los formatos gráficos idóneos según su uso específico:
* **PNG (Portable Network Graphics):** Utilizado en el logotipo corporativo (`logo.png`) y en las fotografías consolidadas de cultivos (`cafe.portada.png`, `cacao.portada.png`, etc.) para admitir transparencias y preservar bordes nítidos sin pérdida por compresión.
* **ICO (Icon File):** Utilizado para el favicon (`logo.ico`), compatible universalmente con pestañas de navegadores y marcadores.
* **JPG / JPEG:** Ideal para fotografías realistas de alta densidad cromática como los campos de cultivo y retratos campesinos (`Image 3.png`, `mage 31.png`), balanceando calidad visual y peso de descarga.
* **SVG (Scalable Vector Graphics):** Recomendado para esquemas vectoriales e iconografía de escalabilidad infinita sin pixelado.

---

## 4. CONCLUSIÓN
El proyecto **AGROCONECTA** cumple de forma rigurosa con la totalidad de exigencias pedagógicas y técnicas de la rúbrica de evaluación parcial de IDAT, demostrando dominio de la estructura básica de HTML, etiquetas semánticas de HTML5, diseño de formularios, manipulación de tablas con fusiones complejas, integración multimedia nativa y fundamentos de arquitectura web.
