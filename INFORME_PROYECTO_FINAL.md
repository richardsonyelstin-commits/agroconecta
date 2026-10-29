# INFORME TÉCNICO DE PROYECTO FINAL: AGROCONECTA V2.0
## Modernización Integral con CSS3 Avanzado y Bootstrap 5.3
**Escuela de Tecnología - IDAT**

---

### DATOS GENERALES
* **Unidad Didáctica:** Desarrollo Web
* **Evaluación:** Proyecto Final / Modernización de Plataforma
* **Estudiante:** Richardson Yelstin Tantajulca Perez
* **Proyecto Web:** AGROCONECTA (Plataforma de Financiamiento y Compra Futura Agrícola)
* **Fecha:** Octubre de 2026
* **Enlace del Proyecto (Vercel):** [https://agroconecta-two-drab.vercel.app/](https://agroconecta-two-drab.vercel.app/)

---

## 1. RESUMEN EJECUTIVO DE LA TRANSFORMACIÓN

El proyecto **AGROCONECTA** ha transitado exitosamente desde su versión preliminar estructurada en tablas nativas de HTML (Evaluación Parcial) hacia una plataforma web moderna, modular y adaptativa de nivel profesional (**V2.0**). La actualización integra en su totalidad las directrices pedagógicas y técnicas contenidas en el **Manual Completo de CSS** y el **Manual Completo de Bootstrap 5.3**, implementando:

1. **Separación estricta de estructura y presentación:** Eliminación completa de etiquetas obsoletas (`<marquee>`, `<font>`) y atributos de estilo en línea (`bgcolor`, `cellpadding`, `cellspacing`, `align`, `valign`), delegando el diseño en una arquitectura CSS modular organizada en 5 bloques canónicos.
2. **Sistema de Maquetación Híbrido (CSS Grid + Flexbox + Bootstrap 5.3):** Adopción de la grilla de 12 columnas y contenedores fluidos para garantizar una experiencia de usuario *Mobile First* sin desbordamientos horizontales.
3. **Componentes Interactivos Oficiales:** Integración de componentes JavaScript nativos de Bootstrap (Navbar colapsable, Carousel táctil, Accordion para preguntas frecuentes y Modal de confirmación).
4. **Dashboard Agrícola con Visualizaciones en CSS Puro:** Desarrollo de widgets analíticos que incluyen barra de progreso porcentual, gráfico de barras horizontales, indicador circular con `conic-gradient` y línea de tiempo vertical.

---

## 2. MATRIZ DE CUMPLIMIENTO TÉCNICO

### 2.1. Criterios del Manual Completo de CSS (Pág. 55)

| Requisito Pedagógico | Estado | Evidencia en el Código de AGROCONECTA |
| :--- | :---: | :--- |
| **1. Uso de CSS Externo** | Cumplido | Archivo [`css/estilos.css`](file:///c:/Proyectos/DESARROLLO%20WEB/css/estilos.css) vinculado en las 9 páginas HTML mediante `<link rel="stylesheet">`. |
| **2. Selectores (etiqueta, clase, ID y atributo)** | Cumplido | `body`, `h1, h2, h3`, `.agro-card`, `#campanas`, `#faq`, `input[required]`, `img[src$=".png"]` y selectores combinados. |
| **3. Mínimo 5 Pseudo-clases** | Cumplido | Implementadas 12: `:hover`, `:active`, `:focus`, `:focus-visible`, `:focus-within`, `:link`, `:visited`, `:nth-child(even)`, `:checked`, `:is()`, `:where()`, `:target`. |
| **4. Mínimo 4 Pseudo-elementos** | Cumplido | Implementados 6: `::before` (timeline), `::after` (tooltips), `::selection`, `::first-letter` (estilo editorial), `::placeholder`, `::file-selector-button`. |
| **5. Variables CSS (`:root`)** | Cumplido | Paleta 60-30-10 (`--color-canvas`, `--color-primario`, `--color-acento`, etc.) con sobrescritura limpia de variables Bootstrap. |
| **6. Flexbox y CSS Grid** | Cumplido | CSS Grid en el Dashboard y fichas; Flexbox en navegación, alineaciones y tarjetas dinámicas. |
| **7. Gráficos Visuales con CSS** | Cumplido | Barra de progreso (`.barra-progreso-css`), barras horizontales (`.grafico-barras-agro`), indicador circular `conic-gradient` y timeline vertical. |
| **8. Responsive Design & Media Queries** | Cumplido | Contenedores fluidos `min()`, fuentes adaptativas con `clamp()` y `@media (prefers-reduced-motion)`. |
| **9. Ausencia de abuso de `!important`** | Cumplido | Cascada controlada mediante especificidad limpia y organización por capas. |
| **10. Organización en 5 bloques canónicos** | Cumplido | Estructura en `css/estilos.css`: 1. Variables, 2. Base, 3. Layout, 4. Componentes, 5. Utilidades/Gráficos. |

### 2.2. Criterios del Manual Completo de Bootstrap 5.3 (Pág. 19-21)

| Requisito Pedagógico | Estado | Evidencia en el Código de AGROCONECTA |
| :--- | :---: | :--- |
| **1. Enlace CDN de Bootstrap 5.3 y Bundle JS** | Cumplido | `bootstrap.min.css` en `<head>` y `bootstrap.bundle.min.js` antes del cierre de `</body>`. |
| **2. Sistema de Grillas (12 columnas) y Mobile First** | Cumplido | Uso de `container`, `row`, `col-12 col-md-6 col-lg-4` y espaciados `g-4`. |
| **3. Navbar Responsive con colapso móvil** | Cumplido | `<nav class="navbar navbar-expand-lg">` con botón toggler hamburguesa funcional. |
| **4. Componente Carousel** | Cumplido | Implementado en [`page/cafe.html`](file:///c:/Proyectos/DESARROLLO%20WEB/page/cafe.html) y [`page/cacao.html`](file:///c:/Proyectos/DESARROLLO%20WEB/page/cacao.html) en reemplazo del `<marquee>`. |
| **5. Componente Accordion** | Cumplido | Sección de Preguntas Frecuentes (FAQ) en [`index.html`](file:///c:/Proyectos/DESARROLLO%20WEB/index.html) con acordeón colapsable animado. |
| **6. Componente Modal** | Cumplido | Modal de confirmación `#modalConfirmacion` en [`page/contacto.html`](file:///c:/Proyectos/DESARROLLO%20WEB/page/contacto.html) al enviar la postulación. |
| **7. Formularios Modernos y Validación Visual** | Cumplido | `form-floating`, `input-group` (S/.), `form-switch`, `is-valid`, `is-invalid` y `invalid-feedback`. |
| **8. Tablas Estilizadas y Responsivas** | Cumplido | `table table-striped table-hover align-middle` envueltas en `table-responsive`. |
| **9. Utilidades de Helpers y Ratios** | Cumplido | `ratio ratio-16x9` en iframes de YouTube y Google Maps para evitar deformaciones en smartphones. |

---

## 3. MAPA DE SITIO Y ARQUITECTURA DE ARCHIVOS V2.0

```plaintext
AGROCONECTA (Raíz /)
│
├── index.html                                 # Landing principal con Hero, Dashboard, Cards y FAQ
├── logo.ico                                   # Favicon oficial
├── README.md                                  # Documentación técnica completa
├── INFORME_EVALUACION_PARCIAL.md              # Archivo histórico
├── INFORME_PROYECTO_FINAL.md                  # Este documento
│
├── css/
│   └── estilos.css                            # Hoja de estilos con variables :root y gráficos CSS
│
├── js/
│   └── main.js                                # Lógica de validación, modal y tooltips
│
├── dist/
│   ├── imagenes/                              # Fotografía de cultivos y logos (hero-campesino.png, etc.)
│   ├── videos/                                # Cápsulas informativas (MP4 y WebM)
│   ├── audios/                                # Testimonio radial (MP3)
│   └── documentos/                            # Plantillas y fichas técnicas
│
└── page/                                      # Módulo de páginas secundarias
    ├── nosotros.html                          # Identidad institucional, timeline y valores
    ├── contacto.html                          # Formulario con floating labels, switches y modal
    ├── cafe.html                              # Ficha técnica con Carousel de Café Orgánico
    ├── cacao.html                             # Ficha técnica con Carousel de Cacao Criollo
    ├── palta.html                             # Ficha técnica de Palta Hass
    ├── maiz.html                              # Ficha técnica de Maíz Morado
    ├── quinua.html                            # Ficha técnica de Quinua Real
    └── mango.html                             # Ficha técnica de Mango Kent
```

---

## 4. CONCLUSIÓN

La plataforma **AGROCONECTA V2.0** consolida con distinción la totalidad de competencias pedagógicas del ciclo: estructura semántica rigurosa, diseño visual ergonómico bajo WCAG AAA, interactividad nativa mediante Bootstrap 5.3 y componentes analíticos avanzados en CSS3. El sitio web se encuentra completamente optimizado y listo para su presentación y evaluación final en IDAT.
