/**
 * AGROCONECTA - Script Principal
 * Integración de interactividad para Bootstrap 5.3 y mejoras de UX
 * Manual de Bootstrap Págs. 12-16
 */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Inicialización de Tooltips de Bootstrap (Pág. 16)
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  // 2. Validación visual interactiva para formularios (Bootstrap Pág. 12-13)
  const formPostulacion = document.getElementById('formPostulacion');
  if (formPostulacion) {
    formPostulacion.addEventListener('submit', function (event) {
      if (!formPostulacion.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        event.preventDefault();
        // Mostrar modal de confirmación si está disponible (Pág. 14)
        const modalElement = document.getElementById('modalConfirmacion');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      }
      formPostulacion.classList.add('was-validated');
    }, false);
  }

  // 3. Animación de barras de progreso al entrar en viewport
  const barras = document.querySelectorAll('.progreso-fill');
  barras.forEach(barra => {
    const anchoOriginal = barra.style.width;
    barra.style.width = '0%';
    setTimeout(() => {
      barra.style.width = anchoOriginal;
    }, 300);
  });
});
