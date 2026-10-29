/**
 * AGROCONECTA - Script Principal
 * Interactividad, Validación Adaptable e Integración de Persistencia
 */

document.addEventListener('DOMContentLoaded', function () {
  // Inicialización de Tooltips de Bootstrap
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].forEach(el => new bootstrap.Tooltip(el));

  // Animación de barras de progreso al entrar en viewport
  const barras = document.querySelectorAll('.progreso-fill');
  barras.forEach(barra => {
    const anchoOriginal = barra.style.width;
    barra.style.width = '0%';
    setTimeout(() => {
      barra.style.width = anchoOriginal;
    }, 300);
  });

  // ==============================================================================
  // FORMULARIO ADAPTABLE DE POSTULACIÓN Y REGISTRO (AgroConecta)
  // ==============================================================================
  const formPostulacion = document.getElementById('formPostulacion');
  if (formPostulacion) {
    const secProductor = document.getElementById('seccionCamposProductor');
    const secInversionista = document.getElementById('seccionCamposInversionista');
    const secCooperativa = document.getElementById('seccionCamposCooperativa');
    const submitBtn = document.getElementById('btnSubmitForm') || formPostulacion.querySelector('button[type="submit"]');
    const radiosRol = formPostulacion.querySelectorAll('input[name="rolUsuario"]');

    /**
     * Alterna la visibilidad y reglas de validación según el rol activo
     * @param {string} rol 'productor' | 'inversionista' | 'cooperativa'
     */
    function actualizarCamposPorRol(rol) {
      // 1. Mostrar/ocultar secciones
      if (secProductor) secProductor.classList.toggle('d-none', rol !== 'productor');
      if (secInversionista) secInversionista.classList.toggle('d-none', rol !== 'inversionista');
      if (secCooperativa) secCooperativa.classList.toggle('d-none', rol !== 'cooperativa');

      // 2. Gestionar atributo 'required' en la sección de Productor
      if (secProductor) {
        const inputs = secProductor.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          if (rol === 'productor' && input.dataset.required === 'true') {
            input.required = true;
          } else {
            input.required = false;
          }
        });
      }

      // 3. Gestionar atributo 'required' en la sección de Inversionista
      if (secInversionista) {
        const inputs = secInversionista.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          const reqIds = ['nombreCompletoInversionista', 'dniRucInversionista', 'telefonoInversionista', 'montoEstimadoInversionista'];
          if (rol === 'inversionista' && reqIds.includes(input.id)) {
            input.required = true;
          } else {
            input.required = false;
          }
        });
      }

      // 4. Gestionar atributo 'required' en la sección de Cooperativa
      if (secCooperativa) {
        const inputs = secCooperativa.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          const reqIds = ['razonSocialCooperativa', 'rucCooperativa', 'representanteCooperativa', 'dniRepresentanteCooperativa', 'telefonoCooperativa', 'regionValleCooperativa', 'sociosCooperativa', 'hectareasCooperativa', 'cultivoInteresCooperativa', 'montoEstimadoCooperativa'];
          if (rol === 'cooperativa' && reqIds.includes(input.id)) {
            input.required = true;
          } else {
            input.required = false;
          }
        });
      }

      // 5. Ajustar texto del botón de envío según el perfil
      if (submitBtn) {
        if (rol === 'inversionista') {
          submitBtn.innerHTML = '💼 Registrar Intención de Inversión y Compra Futura';
        } else if (rol === 'cooperativa') {
          submitBtn.innerHTML = '🤝 Enviar Solicitud Asociativa de Cooperativa';
        } else {
          submitBtn.innerHTML = '🚀 Enviar Postulación de Campaña Agrícola';
        }
      }
    }

    // Escuchar cambios en los selectores de rol
    radiosRol.forEach(radio => {
      radio.addEventListener('change', function () {
        if (this.checked) {
          actualizarCamposPorRol(this.value);
        }
      });
    });

    // Inicializar con el rol marcado por defecto
    const radioActivo = formPostulacion.querySelector('input[name="rolUsuario"]:checked');
    if (radioActivo) {
      actualizarCamposPorRol(radioActivo.value);
    }

    // Manejador de reseteo del formulario
    formPostulacion.addEventListener('reset', function () {
      setTimeout(() => {
        formPostulacion.classList.remove('was-validated');
        const defaultRadio = document.getElementById('rolProductor');
        if (defaultRadio) {
          defaultRadio.checked = true;
          actualizarCamposPorRol('productor');
        }
      }, 50);
    });

    // ==============================================================================
    // ENVÍO ASÍNCRONO Y PERSISTENCIA EN SUPABASE
    // ==============================================================================
    formPostulacion.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (!formPostulacion.checkValidity()) {
        event.stopPropagation();
        formPostulacion.classList.add('was-validated');

        // Scroll suave al primer elemento inválido
        const primerInvalido = formPostulacion.querySelector(':invalid');
        if (primerInvalido) {
          primerInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
          primerInvalido.focus();
        }
        return;
      }

      formPostulacion.classList.add('was-validated');

      // Estado visual de carga en el botón
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
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
          // Poblar datos de confirmación en el modal
          const modalElement = document.getElementById('modalConfirmacion');
          if (modalElement) {
            const elCodigo = document.getElementById('modalCodigoSeguimiento');
            const elCorreo = document.getElementById('modalCorreoDestino');
            const elRol = document.getElementById('modalRolRegistrado');
            const elCultivo = document.getElementById('modalCultivoRegistrado');
            const elMonto = document.getElementById('modalMontoRegistrado');

            if (elCodigo) elCodigo.textContent = resultado.trackingCode || 'AGC-2026-REGISTRADO';
            if (elCorreo) elCorreo.textContent = resultado.email || formPostulacion.querySelector('#correo').value;
            if (elRol) elRol.textContent = resultado.rolNombre || 'Pequeño Productor';
            if (elCultivo) elCultivo.textContent = resultado.cultivo || 'Línea Agrícola';
            if (elMonto) elMonto.textContent = resultado.montoFormateado || 'S/. 0.00';

            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show();
          }

          // Limpiar formulario y resetear estado adaptable
          formPostulacion.reset();
          formPostulacion.classList.remove('was-validated');
          const defaultRadio = document.getElementById('rolProductor');
          if (defaultRadio) {
            defaultRadio.checked = true;
            actualizarCamposPorRol('productor');
          }
        } else {
          alert('Hubo un inconveniente al registrar la postulación: ' + (resultado.error || 'Error desconocido'));
        }
      } catch (err) {
        console.error('[Error Postulación]:', err);
        alert('Ocurrió un error inesperado al procesar el envío. Revisa la conexión con el servidor.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    }, false);
  }

  // ==============================================================================
  // BOTÓN DE COPIAR CÓDIGO DE SEGUIMIENTO EN EL MODAL
  // ==============================================================================
  const btnCopiar = document.getElementById('btnCopiarCodigo');
  if (btnCopiar) {
    btnCopiar.addEventListener('click', function () {
      const elCodigo = document.getElementById('modalCodigoSeguimiento');
      if (!elCodigo) return;
      const texto = elCodigo.textContent.trim();
      navigator.clipboard.writeText(texto).then(() => {
        const originalText = btnCopiar.innerHTML;
        btnCopiar.innerHTML = '✓ ¡Copiado!';
        btnCopiar.classList.replace('btn-outline-success', 'btn-success');
        setTimeout(() => {
          btnCopiar.innerHTML = originalText;
          btnCopiar.classList.replace('btn-success', 'btn-outline-success');
        }, 2000);
      }).catch(err => {
        console.warn('No se pudo copiar automáticamente:', err);
      });
    });
  }
});
