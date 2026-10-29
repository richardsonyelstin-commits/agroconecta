# 🌾 AGROCONECTA - Plataforma de Financiamiento y Compra Futura Agrícola

[![Bootstrap 5.3](https://img.shields.io/badge/Bootstrap-5.3.3-purple.svg)](https://getbootstrap.com/)
[![CSS3](https://img.shields.io/badge/CSS3-Variables%20%7C%20Grid%20%7C%20Flexbox-1572B6.svg)](https://developer.mozilla.org/es/docs/Web/CSS)
[![HTML5](https://img.shields.io/badge/HTML5-Sem%C3%A1ntico%20%7C%20a11y-E34F26.svg)](https://developer.mozilla.org/es/docs/Web/HTML)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://agroconecta-two-drab.vercel.app/)

> Plataforma web peruana orientada a solucionar la falta de liquidez en la agricultura familiar mediante **acuerdos de compra futura de cosechas**, conectando a pequeños productores agrícolas con inversionistas y compradores mayoristas a precios justos y garantizados.

🌐 **Demo en Vivo:** [https://agroconecta-two-drab.vercel.app/](https://agroconecta-two-drab.vercel.app/)

---

## 📌 Datos del Proyecto Académico

* **Institución:** Escuela de Tecnología - IDAT
* **Unidad Didáctica:** Desarrollo Web
* **Estudiante / Desarrollador:** Richardson Yelstin Tantajulca Perez
* **Proyecto:** AGROCONECTA V2.0

---

## 🚀 Arquitectura y Tecnologías Implementadas

El proyecto integra de forma integral los estándares del **Manual Completo de CSS** y del **Manual Completo de Bootstrap 5.3**:

### 1. Sistema de Estilos y CSS3 Moderno (`css/estilos.css`)
* **Variables CSS Globales (`:root`):** Implementación de la regla de diseño cromático 60-30-10 (`--color-canvas: #F6F8F6`, `--color-primario: #0F3027`, `--color-acento: #B86E18`), con sobrescritura limpia de variables Bootstrap (`--bs-primary`, `--bs-success`, etc.).
* **Modelo de Caja y Layout:** `box-sizing: border-box` universal, contenedores fluidos con función `min()` y tipografía responsive con `clamp()`.
* **Selectores Avanzados:** Por etiqueta, clase, ID, hijos directos (`>`), hermanos adyacentes (`+`), selectores de atributo (`input[required]`, `img[src$=".png"]`) y combinados (`:is()`, `:where()`).
* **Pseudo-clases y Pseudo-elementos:** `:hover`, `:active`, `:focus`, `:focus-visible`, `:checked`, `:nth-child(even)`, `::before`, `::after`, `::selection`, `::first-letter` y `::file-selector-button`.
* **Dashboard Agrícola con Gráficos Nativos en CSS:**
  * Barra de progreso porcentual (`.barra-progreso-css`).
  * Gráfico de barras horizontales (`.grafico-barras-agro`).
  * Indicador circular de efectividad con `conic-gradient` (`.indicador-circular-conic`).
  * Línea de tiempo vertical (`.timeline-agro`) con pseudo-elementos.
  * Tooltips nativos con `attr(data-texto)`.

### 2. Framework Bootstrap 5.3
* **Sistema de Grillas (Grid):** Maquetación responsiva con `container`, `row`, `col-12 col-md-6 col-lg-4` y gutters `g-4`.
* **Componentes Interactivos:**
  * **Navbar Responsive:** Barra colapsable con toggler móvil accesible.
  * **Carousel:** Carrusel táctil con indicadores y controles en sustitución del `<marquee>`.
  * **Accordion:** Menú colapsable fluido para Preguntas Frecuentes (FAQ).
  * **Modal:** Ventana emergente con confirmación de postulación en formulario.
  * **Formularios:** Etiquetas flotantes (`form-floating`), grupos de entrada (`input-group` con "S/.") y switches (`form-check form-switch`).
  * **Tablas:** Tablas rayadas con scroll responsivo (`table-responsive`, `table-striped`, `table-hover`).
  * **Helpers:** Envoltura `ratio ratio-16x9` para iframes de YouTube y Google Maps.

---

## 📂 Estructura de Archivos del Proyecto

```plaintext
C:\Proyectos\DESARROLLO WEB\
│
├── index.html                       # Página principal con Hero, Dashboard, Cards y FAQ
├── logo.ico                         # Favicon para el navegador
├── README.md                        # Documentación técnica general
├── INFORME_EVALUACION_PARCIAL.md     # Informe histórico de la Evaluación Parcial
│
├── css/
│   └── estilos.css                  # Estilos personalizados organizados en 5 bloques canónicos
│
├── js/
│   └── main.js                      # Inicialización de componentes Bootstrap y validación
│
├── dist/
│   ├── imagenes/                    # Fotografía de cultivos y logos optimizados
│   ├── videos/                      # Cápsula audiovisual (MP4 y WebM)
│   ├── audios/                      # Testimonio radial (MP3)
│   └── documentos/                  # Fichas técnicas descargables
│
└── page/                            # Módulo de páginas secundarias
    ├── nosotros.html                # Historia, Misión, Visión y Timeline institucional
    ├── contacto.html                # Formulario con validación visual y modal de éxito
    ├── cafe.html                    # Ficha técnica con Carousel de Café Orgánico
    ├── cacao.html                   # Ficha técnica de Cacao Criollo
    ├── palta.html                   # Ficha técnica de Palta Hass
    ├── maiz.html                    # Ficha técnica de Maíz Morado
    ├── quinua.html                  # Ficha técnica de Quinua Real
    └── mango.html                   # Ficha técnica de Mango Kent
```

---

## 📱 Compatibilidad y Pruebas Responsive

El sitio web ha sido validado para ofrecer una experiencia ergonómica en todos los rangos de pantalla:
* **Móviles pequeños (360px - 480px):** Menú colapsable hamburguesa, tarjetas en 1 columna, carruseles táctiles y tablas con desplazamiento lateral suave.
* **Tablets (768px - 992px):** Grillas en 2 columnas y gráficos balanceados.
* **Escritorio y Laptops (> 1200px):** Navegación completa, grilla en 3 columnas y widgets analíticos.

---

## 👨‍💻 Autor

**Richardson Yelstin Tantajulca Perez**  
*Estudiante de Desarrollo Web - IDAT*  
Lima, Perú &bull; 2026
