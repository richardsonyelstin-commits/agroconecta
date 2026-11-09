document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('dashboardTabs')) return;

  const botonesFiltro = document.querySelectorAll('.btn-filtro-agro');
  const cardsCultivo = document.querySelectorAll('.cultivo-item-card');

  // Las fichas no informan todos los campos. null evita repetir el total de cartera.
  const campanas = {
    cafe: {
      nombre: 'Café · Chanchamayo',
      meta: 25000,
      avance: 88,
      tasa: 14.5,
      hectareas: null,
      familias: 25,
      unidad: 'Familias Productoras'
    },
    palta: {
      nombre: 'Palta · Huaral',
      meta: 32000,
      avance: 94,
      tasa: 16,
      hectareas: 18,
      familias: 12,
      unidad: 'Productores'
    },
    cacao: {
      nombre: 'Cacao · Quillabamba',
      meta: 18500,
      avance: 72,
      tasa: 12,
      hectareas: null,
      familias: null,
      unidad: 'Familias Productoras'
    },
    quinua: {
      nombre: 'Quinua · Puno',
      meta: 15000,
      avance: 65,
      tasa: 11.8,
      hectareas: null,
      familias: null,
      unidad: 'Familias Productoras'
    }
  };
  const moneda = (valor) => 'S/. ' + valor.toLocaleString('es-PE');
  const porcentaje = (valor) => Number(valor.toFixed(1)) + '%';
  const camposKpi = (nombre) => {
    const card = document.querySelector(`[data-kpi="${nombre}"]`);
    if (!card) return null;
    return {
      valor: card.querySelector('strong'),
      etiqueta: card.querySelector(':scope > .d-flex:first-child > span:first-child'),
      badge: card.querySelector('.badge'),
      pie: card.querySelector(':scope > .d-flex:last-child > span'),
      detalle: card.querySelector(':scope > .d-flex:last-child > small'),
      barra: card.querySelector('.kpi-mini-fill')
    };
  };
  const kpis = {};
  const resumenGeneral = {};

  // Guardar el estado inicial permite volver a "Todos los Valles" sin duplicar cifras.
  for (const nombre of ['capital', 'hectareas', 'familias', 'retorno']) {
    const campos = camposKpi(nombre);
    kpis[nombre] = campos;
    if (!campos) continue;

    resumenGeneral[nombre] = {};
    for (const [campo, elemento] of Object.entries(campos)) {
      resumenGeneral[nombre][campo] = elemento
        ? campo === 'barra'
          ? elemento.getAttribute('style')
          : elemento.textContent
        : null;
    }
  }
  const texto = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };
  function actualizarSeguimiento(cultivo) {
    const datos = campanas[cultivo];
    botonesFiltro.forEach((btn) => {
      const activo = btn.dataset.cultivo === cultivo;
      btn.classList.toggle('active', activo);
      btn.setAttribute('aria-pressed', String(activo));
    });
    cardsCultivo.forEach((card) => {
      const visible = !datos || card.dataset.cultivo === cultivo;
      card.hidden = !visible;
      card.style.display = visible ? 'block' : 'none';
    });
    if (datos) {
      const capital = Math.round((datos.meta * datos.avance) / 100);
      const actualizarKpi = (nombre, valores, ancho) => {
        const campos = kpis[nombre];
        if (!campos) return;
        Object.entries(valores).forEach(([campo, valor]) => {
          if (campos[campo]) campos[campo].textContent = valor;
        });
        if (campos.barra) campos.barra.style.width = ancho + '%';
      };
      actualizarKpi(
        'capital',
        {
          valor: moneda(capital),
          badge: porcentaje(datos.avance) + ' Meta',
          pie: 'Meta: ' + moneda(datos.meta),
          detalle: datos.nombre
        },
        datos.avance
      );
      actualizarKpi(
        'hectareas',
        {
          valor: datos.hectareas === null ? '—' : datos.hectareas + ' Ha',
          pie: datos.nombre,
          badge: datos.hectareas === null ? 'Sin registro' : 'Superficie',
          detalle: datos.hectareas === null ? 'Área por confirmar' : 'Área de la campaña'
        },
        datos.hectareas === null ? 0 : 100
      );
      actualizarKpi(
        'familias',
        {
          valor: datos.familias === null ? '—' : String(datos.familias),
          etiqueta: datos.unidad,
          badge: datos.familias === null ? 'Sin registro' : 'Beneficiarios',
          pie: datos.nombre,
          detalle: datos.familias === null ? 'Cantidad por confirmar' : 'Participantes de campaña'
        },
        datos.familias === null ? 0 : 100
      );
      actualizarKpi(
        'retorno',
        {
          valor: porcentaje(datos.tasa),
          badge: 'Proyección',
          pie: 'Tasa anual simple',
          detalle: datos.nombre
        },
        Math.min(100, (datos.tasa / 18) * 100)
      );
      texto('campanaSeleccionada', datos.nombre);
      texto('tituloAvanceCampana', 'Avance de ' + datos.nombre);
      texto('metaAvanceCampana', 'Meta de campaña: ' + moneda(datos.meta));
      texto('porcentajeAvanceCampana', porcentaje(datos.avance) + ' alcanzado');
      texto('barraAvanceCampana', moneda(capital) + ' recaudados');
      const barra = document.getElementById('barraAvanceCampana');
      if (barra) {
        barra.dataset.ancho = datos.avance + '%';
        barra.style.width = datos.avance + '%';
      }
    } else {
      Object.entries(kpis).forEach(([nombre, campos]) => {
        if (!campos) return;
        Object.entries(campos).forEach(([campo, el]) => {
          if (!el) return;
          const original = resumenGeneral[nombre][campo];
          if (campo === 'barra') {
            if (original === null) el.removeAttribute('style');
            else el.setAttribute('style', original);
          } else el.textContent = original;
        });
      });
      texto('campanaSeleccionada', 'Seguimiento de campañas');
      texto('tituloAvanceCampana', 'Distribución de Fondos y Fases de Cultivo');
      texto('metaAvanceCampana', 'Fondo Global 2026 (Meta: S/. 250,000)');
      texto('porcentajeAvanceCampana', '74.2% alcanzado');
      texto('barraAvanceCampana', 'S/. 185,500 recaudados');
      const barra = document.getElementById('barraAvanceCampana');
      if (barra) {
        barra.dataset.ancho = '74.2%';
        barra.style.width = '74.2%';
      }
    }
  }
  botonesFiltro.forEach((btn) =>
    btn.addEventListener('click', () => actualizarSeguimiento(btn.dataset.cultivo))
  );
  if (botonesFiltro.length) actualizarSeguimiento('todos');

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

    const valor = Number(inputMonto.value);
    const monto =
      Math.round(Math.min(50000, Math.max(500, Number.isFinite(valor) ? valor : 500)) / 500) * 500;
    inputMonto.value = monto;
    if (rangeMonto) rangeMonto.value = monto;

    const optSeleccionada = selectCultivo.options[selectCultivo.selectedIndex];
    const tasaAnual = parseFloat(optSeleccionada.dataset.tasa) || 14.5;
    const mesesPlazo = parseInt(optSeleccionada.dataset.meses) || 8;

    const ganancia = monto * (tasaAnual / 100) * (mesesPlazo / 12);
    const totalEstimado = monto + ganancia;

    if (displayMonto) displayMonto.textContent = `S/. ${monto.toLocaleString('es-PE')}`;
    if (resCapital)
      resCapital.textContent = `S/. ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (resTasa) resTasa.textContent = `${tasaAnual}% anual simple`;
    if (resGanancia)
      resGanancia.textContent = `+ S/. ${ganancia.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (resPlazo) resPlazo.textContent = `${mesesPlazo} meses`;
    if (resTotal)
      resTotal.textContent = `S/. ${totalEstimado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (btnPostular) {
      const params = new URLSearchParams({
        rol: 'inversionista',
        monto: String(monto),
        cultivo: optSeleccionada.dataset.nombre || optSeleccionada.textContent,
        meses: String(mesesPlazo)
      });
      btnPostular.href = `page/contacto.html?${params}`;
    }
  }

  if (inputMonto && rangeMonto) {
    inputMonto.addEventListener('change', function () {
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

  actualizarSimulador();
});
