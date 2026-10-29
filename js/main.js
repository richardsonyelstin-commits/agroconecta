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

    // Auto-completar desde parámetros URL (ej. ?rol=inversionista&monto=2000 desde el simulador)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramRol = urlParams.get('rol');
      const paramMonto = urlParams.get('monto');

      if (paramRol) {
        const targetRadio = formPostulacion.querySelector(`input[name="rolUsuario"][value="${paramRol}"]`);
        if (targetRadio) {
          targetRadio.checked = true;
          actualizarCamposPorRol(paramRol);
        }
      }

      if (paramMonto) {
        const inputMontoInv = document.getElementById('montoEstimadoInversionista');
        if (inputMontoInv) {
          inputMontoInv.value = paramMonto;
        }
      }
    } catch (e) {
      console.info('[AgroConecta] Parámetros URL no procesados:', e);
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

  // ==============================================================================
  // DASHBOARD AGRÍCOLA Y SIMULADOR DE RENTABILIDAD EN TIEMPO REAL
  // ==============================================================================
  inicializarDashboardInteractiva();

  function inicializarDashboardInteractiva() {
    // 1. Filtros por Valle / Cultivo
    const botonesFiltro = document.querySelectorAll('.btn-filtro-agro');
    const cardsCultivo = document.querySelectorAll('.cultivo-item-card');

    botonesFiltro.forEach(btn => {
      btn.addEventListener('click', function () {
        botonesFiltro.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const cultivoSeleccionado = this.dataset.cultivo;

        cardsCultivo.forEach(card => {
          if (cultivoSeleccionado === 'todos' || card.dataset.cultivo === cultivoSeleccionado) {
            card.style.display = 'block';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // 2. Simulador Interactivo de Rentabilidad
    const inputMonto = document.getElementById('simuladorMontoInput');
    const rangeMonto = document.getElementById('simuladorMontoRange');
    const selectCultivo = document.getElementById('simuladorCultivoSelect');
    const displayMonto = document.getElementById('simuladorMontoDisplay');
    const resCapital = document.getElementById('resumenCapital');
    const resTasa = document.getElementById('resumenTasa');
    const resGanancia = document.getElementById('resumenGanancia');
    const resPlazo = document.getElementById('resumenPlazo');
    const resTotal = document.getElementById('resumenTotal');
    const btnPostular = document.getElementById('btnPostularSimulador');

    function actualizarSimulador() {
      if (!inputMonto || !selectCultivo) return;

      let monto = parseFloat(inputMonto.value) || 500;
      if (monto < 500) monto = 500;
      if (monto > 50000) monto = 50000;

      const optSeleccionada = selectCultivo.options[selectCultivo.selectedIndex];
      const tasaAnual = parseFloat(optSeleccionada.dataset.tasa) || 14.5;
      const mesesPlazo = parseInt(optSeleccionada.dataset.meses) || 8;

      // Cálculo de rendimiento proporcional al plazo en meses
      const ganancia = monto * (tasaAnual / 100) * (mesesPlazo / 12);
      const totalEstimado = monto + ganancia;

      if (displayMonto) displayMonto.textContent = `S/. ${monto.toLocaleString('es-PE')}`;
      if (resCapital) resCapital.textContent = `S/. ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (resTasa) resTasa.textContent = `${tasaAnual}% Anual`;
      if (resGanancia) resGanancia.textContent = `+ S/. ${ganancia.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (resPlazo) resPlazo.textContent = `${mesesPlazo} meses`;
      if (resTotal) resTotal.textContent = `S/. ${totalEstimado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      if (btnPostular) {
        btnPostular.href = `page/contacto.html?rol=inversionista&monto=${monto}`;
      }
    }

    if (inputMonto && rangeMonto) {
      inputMonto.addEventListener('input', function () {
        rangeMonto.value = this.value;
        actualizarSimulador();
      });

      rangeMonto.addEventListener('input', function () {
        inputMonto.value = this.value;
        actualizarSimulador();
      });
    }

    if (selectCultivo) {
      selectCultivo.addEventListener('change', actualizarSimulador);
    }

    // Inicializar cálculo inicial si los elementos están en pantalla
    actualizarSimulador();
  }
});
