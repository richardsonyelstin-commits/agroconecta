document.addEventListener('DOMContentLoaded', function () {
  const formPostulacion = document.getElementById('formPostulacion');
  if (formPostulacion) {
    const secProductor = document.getElementById('seccionCamposProductor');
    const secInversionista = document.getElementById('seccionCamposInversionista');
    const secCooperativa = document.getElementById('seccionCamposCooperativa');
    const submitBtn =
      document.getElementById('btnSubmitForm') ||
      formPostulacion.querySelector('button[type="submit"]');
    const radiosRol = formPostulacion.querySelectorAll('input[name="rolUsuario"]');

    function configurarCamposDelPerfil(seccion, rolActual, rolObjetivo, idsRequeridos = null) {
      if (!seccion) return;
      const inputs = seccion.querySelectorAll('input, select, textarea');
      inputs.forEach((input) => {
        const esActivo = rolActual === rolObjetivo;
        const debeSerRequerido =
          esActivo &&
          (idsRequeridos ? idsRequeridos.includes(input.id) : input.dataset.required === 'true');
        input.required = debeSerRequerido;
        input.disabled = !esActivo;
        input.removeAttribute('aria-invalid');
      });
    }

    function mostrarPerfil(rol) {
      if (secProductor) secProductor.classList.toggle('d-none', rol !== 'productor');
      if (secInversionista) secInversionista.classList.toggle('d-none', rol !== 'inversionista');
      if (secCooperativa) secCooperativa.classList.toggle('d-none', rol !== 'cooperativa');

      configurarCamposDelPerfil(secProductor, rol, 'productor', null);
      configurarCamposDelPerfil(secInversionista, rol, 'inversionista', [
        'nombreCompletoInversionista',
        'dniRucInversionista',
        'telefonoInversionista',
        'montoEstimadoInversionista'
      ]);
      configurarCamposDelPerfil(secCooperativa, rol, 'cooperativa', [
        'razonSocialCooperativa',
        'rucCooperativa',
        'representanteCooperativa',
        'dniRepresentanteCooperativa',
        'telefonoCooperativa',
        'regionValleCooperativa',
        'sociosCooperativa',
        'hectareasCooperativa',
        'cultivoInteresCooperativa',
        'montoEstimadoCooperativa'
      ]);

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

    radiosRol.forEach((radio) => {
      radio.addEventListener('change', function () {
        if (this.checked) {
          mostrarPerfil(this.value);
        }
      });
    });

    const radioActivo = formPostulacion.querySelector('input[name="rolUsuario"]:checked');
    if (radioActivo) {
      mostrarPerfil(radioActivo.value);
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramRol = urlParams.get('rol');
      const paramMonto = urlParams.get('monto');

      if (
        paramRol &&
        ['productor', 'inversionista', 'cooperativa'].includes(paramRol.toLowerCase())
      ) {
        const rolSeguro = paramRol.toLowerCase();
        const targetRadio = formPostulacion.querySelector(
          `input[name="rolUsuario"][value="${rolSeguro}"]`
        );
        if (targetRadio) {
          targetRadio.checked = true;
          mostrarPerfil(rolSeguro);
        }
      }

      if (paramMonto) {
        const inputMontoInv = document.getElementById('montoEstimadoInversionista');
        if (inputMontoInv) {
          const monto = Number(paramMonto);
          if (Number.isFinite(monto))
            inputMontoInv.value = Math.round(Math.min(50000, Math.max(500, monto)) / 500) * 500;
        }
      }
      const cultivo = document.getElementById('cultivoInteresInversionista');
      const paramCultivo = urlParams.get('cultivo');
      if (cultivo && [...cultivo.options].some((o) => o.value === paramCultivo))
        cultivo.value = paramCultivo;
      const plazo = document.getElementById('duracionCampanaInversionista');
      const meses = urlParams.get('meses');
      if (plazo && [...plazo.options].some((o) => o.value === meses)) plazo.value = meses;
    } catch (e) {
      console.info('[AgroConecta] Parámetros URL no procesados:', e);
    }

    formPostulacion.addEventListener('reset', function () {
      setTimeout(() => {
        formPostulacion.classList.remove('was-validated');
        formPostulacion
          .querySelectorAll('[aria-invalid]')
          .forEach((c) => c.removeAttribute('aria-invalid'));
        const defaultRadio = document.getElementById('rolProductor');
        if (defaultRadio) {
          defaultRadio.checked = true;
          mostrarPerfil('productor');
        }
      }, 50);
    });

    formPostulacion.addEventListener(
      'submit',
      async function (event) {
        event.preventDefault();
        const estadoForm = document.getElementById('estadoFormulario');
        if (estadoForm) estadoForm.textContent = '';
        formPostulacion.querySelectorAll('input,select,textarea').forEach((c) => {
          if (!c.disabled) c.setAttribute('aria-invalid', String(!c.validity.valid));
        });

        if (!formPostulacion.checkValidity()) {
          event.stopPropagation();
          formPostulacion.classList.add('was-validated');

          const primerInvalido = formPostulacion.querySelector(
            'input:invalid:not(:disabled),select:invalid:not(:disabled),textarea:invalid:not(:disabled)'
          );
          if (primerInvalido) {
            primerInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
            primerInvalido.focus();
          }
          if (estadoForm)
            estadoForm.textContent = 'Revisa los campos indicados antes de continuar.';
          return;
        }

        formPostulacion.classList.add('was-validated');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Procesando solicitud...';
        }

        try {
          if (typeof window.enviarPostulacion !== 'function')
            throw new Error(
              'El formulario no está disponible. Recarga la página e inténtalo nuevamente.'
            );
          const resultado = await window.enviarPostulacion(formPostulacion);

          if (resultado.success) {
            const modalElement = document.getElementById('modalConfirmacion');
            if (modalElement) {
              const elCodigo = document.getElementById('modalCodigoSeguimiento');
              const elCorreo = document.getElementById('modalCorreoDestino');
              const elRol = document.getElementById('modalRolRegistrado');
              const elCultivo = document.getElementById('modalCultivoRegistrado');
              const elMonto = document.getElementById('modalMontoRegistrado');

              if (elCodigo) elCodigo.textContent = resultado.trackingCode || 'Sin referencia';
              if (elCorreo)
                elCorreo.textContent =
                  resultado.email || formPostulacion.querySelector('#correo').value;
              if (elRol) elRol.textContent = resultado.rolNombre || 'Pequeño Productor';
              if (elCultivo) elCultivo.textContent = resultado.cultivo || 'Línea Agrícola';
              if (elMonto) elMonto.textContent = resultado.montoFormateado || 'S/. 0.00';
              document.getElementById('modalLabel').textContent = resultado.demo
                ? 'Simulación completada'
                : 'Solicitud registrada';
              document.getElementById('modalResultadoTitulo').textContent = resultado.demo
                ? 'Has completado la simulación de tu postulación'
                : 'Tu solicitud se guardó correctamente';
              document.getElementById('modalResultadoDescripcion').textContent = resultado.demo
                ? 'Esta demostración no guarda datos, no sube archivos y no envía correos.'
                : 'Conserva la referencia de tu solicitud. No se ha enviado una notificación por correo.';
              document.getElementById('modalReferenciaLabel').textContent = resultado.demo
                ? 'Referencia de simulación:'
                : 'Referencia de solicitud:';
              document.getElementById('modalSiguientePaso').textContent = resultado.demo
                ? 'Puedes cerrar esta ventana y explorar los demás perfiles.'
                : 'Conserva esta referencia para tus consultas sobre la solicitud.';

              const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
              modalInstance.show();
            }

            formPostulacion.reset();
            formPostulacion.classList.remove('was-validated');
            const defaultRadio = document.getElementById('rolProductor');
            if (defaultRadio) {
              defaultRadio.checked = true;
              mostrarPerfil('productor');
            }
          } else {
            if (estadoForm)
              estadoForm.textContent =
                resultado.error || 'No se pudo guardar. Tus datos siguen en el formulario.';
          }
        } catch (err) {
          console.error('[Error Postulación]:', err);
          if (estadoForm)
            estadoForm.textContent =
              err.message || 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.';
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            mostrarPerfil(
              formPostulacion.querySelector('input[name="rolUsuario"]:checked')?.value ||
                'productor'
            );
          }
        }
      },
      false
    );
  }

  const btnCopiar = document.getElementById('btnCopiarCodigo');
  if (btnCopiar) {
    btnCopiar.addEventListener('click', function () {
      const elCodigo = document.getElementById('modalCodigoSeguimiento');
      if (!elCodigo) return;
      const texto = elCodigo.textContent.trim();
      navigator.clipboard
        .writeText(texto)
        .then(() => {
          const originalText = btnCopiar.innerHTML;
          btnCopiar.innerHTML = '✓ ¡Copiado!';
          btnCopiar.classList.replace('btn-outline-dark', 'btn-success');
          setTimeout(() => {
            btnCopiar.innerHTML = originalText;
            btnCopiar.classList.replace('btn-success', 'btn-outline-dark');
          }, 2000);
        })
        .catch((err) => {
          console.warn('No se pudo copiar automáticamente:', err);
        });
    });
  }

  document.querySelectorAll('.needs-validation').forEach((form) => {
    form.addEventListener('input', (e) => {
      if (e.target.validity)
        e.target.setAttribute('aria-invalid', String(!e.target.validity.valid));
    });
  });
});
