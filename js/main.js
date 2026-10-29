/**
 * AGROCONECTA - Script Principal
 * Interactividad y mejoras de experiencia de usuario
 */

document.addEventListener('DOMContentLoaded', function () {
  // Inicialización de Tooltips de Bootstrap
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  // Validación visual interactiva para formularios
  const formPostulacion = document.getElementById('formPostulacion');
  if (formPostulacion) {
    formPostulacion.addEventListener('submit', function (event) {
      if (!formPostulacion.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        event.preventDefault();
        // Mostrar modal de confirmación si está disponible
        const modalElement = document.getElementById('modalConfirmacion');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      }
      formPostulacion.classList.add('was-validated');
    }, false);
  }

  // Animación de barras de progreso al entrar en viewport
  const barras = document.querySelectorAll('.progreso-fill');
  barras.forEach(barra => {
    const anchoOriginal = barra.style.width;
    barra.style.width = '0%';
    setTimeout(() => {
      barra.style.width = anchoOriginal;
    }, 300);
  });
});
