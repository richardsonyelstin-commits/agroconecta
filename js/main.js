/**
 * AGROCONECTA - Script Principal
 * Interactividad y mejoras de experiencia de usuario
 */

document.addEventListener('DOMContentLoaded', function () {
  // Inicialización de Tooltips de Bootstrap
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  // Validación visual interactiva para formularios e integración con Supabase
  const formPostulacion = document.getElementById('formPostulacion');
  if (formPostulacion) {
    formPostulacion.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (!formPostulacion.checkValidity()) {
        event.stopPropagation();
        formPostulacion.classList.add('was-validated');
        return;
      }

      formPostulacion.classList.add('was-validated');

      // Botón submit con estado de carga interactivo
      const submitBtn = formPostulacion.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Conectando con Supabase...';
      }

      try {
        let resultado = { success: true };
        if (typeof window.guardarPostulacionEnSupabase === 'function') {
          resultado = await window.guardarPostulacionEnSupabase(formPostulacion);
        }

        if (resultado.success) {
          // Mostrar modal de confirmación si está disponible
          const modalElement = document.getElementById('modalConfirmacion');
          if (modalElement) {
            const modalInstance = new bootstrap.Modal(modalElement);
            modalInstance.show();
          }
          // Limpiar formulario y resetear estados visuales
          formPostulacion.reset();
          formPostulacion.classList.remove('was-validated');
        } else {
          alert('Hubo un inconveniente al registrar la postulación: ' + (resultado.error || 'Error desconocido'));
        }
      } catch (err) {
        console.error('Error al enviar postulación:', err);
        alert('Ocurrió un error al procesar el envío. Por favor revisa la conexión con Supabase.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
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
