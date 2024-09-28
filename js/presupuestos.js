//todo
/*


el fondo del encabezado del acordeon debe ser verde claro si se ha pagado
agregar un boton  restaurar 
al agregar un nuevo pppto se debe abrir un nuevo acordeon por encima de los demas


al eliminar debe confirmarse en un popup
al guardar debe confirmarse en un popup
el movId se genera al momento de pagar
obtener los items con flag autopago
si el dia del mes es igual o mayor a la fecha actual entonces agregar el movimiento*/
// Agrega evento click al menú de lista
document.querySelector("#estimados-menu").addEventListener("click", function () {
  $("#estimadosModal").modal("show");

  renderPresupuesto();
  actualizarTotalEstimado();
});

let totalPresupuesto = 0;
let lastOpenedPptoId = null; // Para controlar cuál acordeón está abierto
let isNewPpto = false; // Para identificar si una tarjeta es nueva

// Función para generar un nuevo acordeón de simulación
document
  .getElementById('agregar-estimado-btn')
  .addEventListener('click', () => {
    let idCounterPresupuestos = Math.max(...presupuestos.map(t => t.pptoId)) + 1 || 1;
    const nuevoId = idCounterPresupuestos++;
    console.log("NUEVO ID:" + nuevoId)

    const nuevoPresupuesto = {
      movId: 0,
      tarjeta: "",
      monto: "",
      detalle: "",
      fecha: "",
      autopago: "", // Agregado el estado de autopago
      tipo: 'egreso', // Puede ajustarse según sea necesario
      concepto: 4, // Por defecto, ajustable
      pptoId: nuevoId,
      activo: true,
      nuevo: true
    };

    presupuestos.unshift(nuevoPresupuesto); // Agregar la nueva tarjeta al inicio del array
    lastOpenedPptoId = nuevoPresupuesto.pptoId; // Abrir el acordeón de la nueva tarjeta
    isNewPpto = true;
    renderPresupuesto();
  });

// Función para guardar una simulación
function guardarPresupuesto(pptoId) {
  const ppto = presupuestos.find(sim => sim.pptoId === pptoId);
  if (ppto) {

    const tarjetaSelect = document.getElementById(`tarjeta-estimado-${pptoId}`);
    const montoInput = document.getElementById(`monto-estimado-${pptoId}`);
    const detalleInput = document.getElementById(`detalle-estimado-${pptoId}`);
    const diaInput = document.getElementById(`dia-estimado-${pptoId}`);
    const autoPagoCheckbox = document.getElementById(`autopago-estimado-${pptoId}`);

    completarFechaSimulacion(diaInput.value);

    ppto.tarjeta = tarjetaSelect.value;
    ppto.dia = diaInput.value;
    ppto.monto = montoInput.value;
    ppto.detalle = detalleInput.value.toUpperCase();
    ppto.nuevo = false; // Si es nueva, ahora es tarjeta guardada

    isNewPpto = false;
    let hasError = false;


    if (!tarjetaSelect.value) {
      tarjetaSelect.classList.add('is-invalid');
      autoPagoCheckbox.checked = false;
      hasError = true;
    } else {
      tarjetaSelect.classList.remove('is-invalid');
    }

    if (!montoInput.value) {
      montoInput.classList.add('is-invalid');
      hasError = true;
    } else {
      montoInput.classList.remove('is-invalid');
    }

    if (!detalleInput.value) {
      detalleInput.classList.add('is-invalid');
      hasError = true;
    } else {
      detalleInput.classList.remove('is-invalid');
    }

    if (autoPagoCheckbox.checked && !diaInput.value) {
      diaInput.classList.add('is-invalid');
      autoPagoCheckbox.checked = false;
      hasError = true;
    } else {
      diaInput.classList.remove('is-invalid');
    }


    if (hasError) {
      //alert("Para tarjetas de crédito, las fechas de facturación y pago son obligatorias.");
      return; // Detener la ejecución si no se han ingresado las fechas obligatorias
    }


    // Actualizar el título con el detalle y monto
    document.getElementById(`titulo-estimado-${pptoId}`).textContent = `${ppto.detalle.toUpperCase()} - S/.${ppto.monto}`;

    actualizarTotalEstimado();
    guardarEstado();
    renderPresupuesto()
    alert("Se guardo el presupuesto con exito.");
    // Cerrar el acordeón después de guardar
    //$(`#collapse-${id}`).collapse('hide');
  }
}


function renderPresupuesto() {
  const presupuestoLista = document.getElementById('estimados-lista');
  presupuestoLista.innerHTML = ''; // Asegúrate de que este contenedor tenga id 'estimados-lista'

  presupuestos.forEach((presupuesto, index) => {
    const pptoId = presupuesto.pptoId;
    const isExpanded = pptoId === lastOpenedPptoId; // Solo el acordeón abierto estará expandido
    const nuevoPptoTexto = presupuesto.nuevo ? ' (Nuevo Ppto)' : '';
    const tarjetasActivas = tarjetas.filter(tarjeta => tarjeta.activo);

    // Generar opciones del combo de tarjetas con un valor vacío por defecto
    const tarjetasOptions = `
      <option value="">Seleccione una tarjeta</option>
      ${tarjetasActivas.map(tarjeta => `
        <option value="${tarjeta.cardId}">${tarjeta.nombre || 'NOMBRE TARJETA'}</option>
      `).join('')}
    `;

    const acordeonHTML = `
      <div class="card mb-3" id="estimado-${pptoId}">
        <div class="card-header d-flex justify-content-between align-items-center" 
             id="header-estimado-${pptoId}" 
             style="cursor: pointer; background-color: ${isPagado(pptoId) ? 'lightgreen' : 'inherit'};"
             data-bs-toggle="collapse" data-bs-target="#collapse-${pptoId}" 
             aria-expanded="${isExpanded}" aria-controls="collapse-${pptoId}" data-bs-parent="#estimados-lista">
          
          <h5 class="mb-0" id="titulo-estimado-${pptoId}">${presupuesto.detalle || nuevoPptoTexto}</h5>
          <button class="btn btn-link" aria-expanded="false" aria-controls="collapse-${pptoId}">
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>
        <div id="collapse-${pptoId}" class="collapse ${isExpanded ? 'show' : ''}" 
         aria-labelledby="header-estimado-${pptoId}" data-bs-parent="#estimados-lista">
          <div class="card-body">
            <div class="form-group">
              <label for="tarjeta-estimado-${pptoId}">Tarjeta</label>
              <select class="form-control" id="tarjeta-estimado-${pptoId}">
                ${tarjetasOptions}
              </select>
              <div class="invalid-feedback">La tarjeta es obligatoria.</div>
            </div>
            <div class="form-group">
              <label for="monto-estimado-${pptoId}">Monto</label>
              <input type="number" class="form-control" id="monto-estimado-${pptoId}" value="${presupuesto.monto}" placeholder="Ingrese el monto">
              <div class="invalid-feedback">El monto es obligatorio.</div>
            </div>
            <div class="form-group">
              <label for="detalle-estimado-${pptoId}">Detalle</label>
              <input type="text" class="form-control" id="detalle-estimado-${pptoId}" value="${presupuesto.detalle}" placeholder="Ingrese el detalle">
              <div class="invalid-feedback">El detalle es obligatorio.</div>
            </div>
            <div class="form-group">
              <label for="dia-estimado-${pptoId}">Fecha de pago</label>
              <input type="number" class="form-control" id="dia-estimado-${pptoId}" value="${presupuesto.dia}" min="1" max="31" placeholder="Día">
              <div class="invalid-feedback">La fecha de pago es obligatoria.</div>
            </div>
            <div class="form-group form-check">
              <input type="checkbox" class="form-check-input" id="autopago-estimado-${pptoId}">
              <label class="form-check-label" for="autopago-estimado-${pptoId}">Autopago</label>
            </div>
            <button class="btn btn-success" onclick="guardarPresupuesto(${pptoId})">Guardar</button>
            <button class="btn btn-danger" onclick="eliminarEstimado(${pptoId})">Eliminar</button>
            <button class="btn btn-primary" onclick="pagarEstimado(${pptoId})">Pagar</button>          
          </div>
        </div>
      </div>`;

    presupuestoLista.insertAdjacentHTML('beforeend', acordeonHTML);
  });
}




// Desplegar el acordeón recién creado
//$(`#collapse-${nuevoId}`).collapse('show');

// Elementos para validar






function validarCamposYAutopago(nuevoId) {


}



// Función para verificar si el estimado ha sido pagado (esto es un ejemplo, implementa según tu lógica)
function isPagado(id) {
  // Aquí implementa la lógica para determinar si el estimado ha sido pagado
  // Por ejemplo, puedes usar un array de IDs pagados o una propiedad en los datos
  return false; // Cambia esto por tu lógica real
}






// Función para eliminar una simulación
function eliminarEstimado(pptoId) {
  // Eliminar el acordeón visualmente
  document.getElementById(`estimado-${id}`).remove();

  // Eliminar del array de simulaciones
  presupuestos = presupuestos.filter(sim => sim.pptoId !== pptoId);

  // Verificar si la tarjeta eliminada es la que estaba abierta
  if (lastOpenedPptoId === pptoId) {
    lastOpenedPptoId = null; // Resetea el acordeón abierto
  }

  actualizarTotalEstimado();
  guardarEstado();
}

// Función para cancelar la creación de una simulación (solo si es nueva)
/*function cancelarEstimado(id) {
  const simulacionExiste = simulaciones.find(sim => sim.movId === id);

  if (!simulacionExiste) {
    eliminarEstimado(id); // Si es nueva, simplemente se elimina
  } else {
    // Si ya estaba guardada, se colapsa el acordeón
    $(`#collapse-${id}`).collapse('hide');
  }
}*/

// Función para generar un movimiento de pago para un estimado
function pagarEstimado(id) {
  const presupuesto = presupuestos.find(sim => sim.pptoId === id);
  if (presupuesto) {
    const movimientoPago = {
      fecha: new Date().toISOString().split('T')[0],
      tipo: presupuesto.tipo,
      monto: presupuesto.monto,
      concepto: presupuesto.concepto,
      tarjeta: presupuesto.tarjeta,
      detalle: presupuesto.detalle
    };

    // Aquí puedes agregar tu lógica para registrar el movimiento de pago
    console.log(`Pago registrado para el estimado ${id}:`, movimientoPago);

    alert(`Pago realizado para: ${presupuesto.detalle} - S/.${presupuesto.monto}`);
  } else {
    alert("Estimado no encontrado para realizar el pago.");
  }
}

// Función para pagar todos los estimados
function pagarTodosEstimados() {
  presupuestos.forEach(presupuesto => {
    const movimientoPago = {
      fecha: new Date().toISOString().split('T')[0],
      tipo: presupuesto.tipo,
      monto: presupuesto.monto,
      concepto: presupuesto.concepto,
      tarjeta: presupuesto.tarjeta,
      detalle: presupuesto.detalle
    };

    // Lógica para registrar el movimiento de pago de cada estimado
    console.log(`Pago registrado para el estimado ${presupuesto.pptoId}:`, movimientoPago);
  });

  alert(`Se realizaron pagos por un total de S/.${totalPresupuesto.toFixed(2)}`);
}

// Función para actualizar la suma total de estimados
function actualizarTotalEstimado() {
  totalPresupuesto = presupuestos.reduce((total, presupuesto) => total + parseFloat(presupuesto.monto), 0);
  document.getElementById('total-estimado').textContent = totalPresupuesto.toFixed(2);
}


// Función para obtener la fecha actual en formato año-mes-día
function obtenerFechaActual() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const dia = hoy.getDate().toString().padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// Función para completar la fecha de la simulación usando el mes y año actual
function completarFechaSimulacion(dia) {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
  return `${año}-${mes}-${dia.toString().padStart(2, '0')}`;
}



// Función que ejecuta el autopago para las simulaciones pendientes
function ejecutarAutopago() {
  presupuestos.forEach(presupuesto => {
    // Solo considerar simulaciones que tienen autopago activado
    if (presupuesto.autopago) {
      const fechaActual = obtenerFechaActual(); // Obtener la fecha actual para las comparaciones
      const fechaSimulacion = completarFechaSimulacion(presupuesto.dia); // Completar la fecha de la simulación

      // Si la fecha de la simulación es anterior o igual a la fecha actual
      if (fechaSimulacion <= fechaActual) {
        // Crear un nuevo movimiento para registrar el pago automático
        const movimientoPago = {
          fecha: fechaSimulacion,
          tipo: presupuesto.tipo,
          monto: presupuesto.monto,
          tarjeta: presupuesto.tarjeta,
          concepto: presupuesto.concepto,
          detalle: presupuesto.detalle
        };

        // Agregar el movimiento al array de movimientos
        movimientos.push(movimientoPago);
        console.log(`Pago automático realizado para la simulación ${presupuesto.pptoId}:`, movimientoPago);
      }
    }
  });

  console.log("Pagos automáticos ejecutados:", movimientos);
}

// Función para programar la ejecución diaria
function programarAutopago(horaObjetivo) {
  const ahora = new Date();
  const horaEjecucion = new Date();
  horaEjecucion.setHours(horaObjetivo.getHours());
  horaEjecucion.setMinutes(horaObjetivo.getMinutes());
  horaEjecucion.setSeconds(0);

  const tiempoRestante = horaEjecucion - ahora;
  if (tiempoRestante > 0) {
    setTimeout(() => {
      ejecutarAutopago();
      setInterval(ejecutarAutopago, 24 * 60 * 60 * 1000); // Ejecutar cada 24 horas
    }, tiempoRestante);
  } else {
    console.log("La hora de autopago ya pasó hoy. Programando para mañana.");
    setTimeout(() => {
      ejecutarAutopago();
      setInterval(ejecutarAutopago, 24 * 60 * 60 * 1000); // Ejecutar cada 24 horas
    }, 24 * 60 * 60 * 1000 - Math.abs(tiempoRestante));
  }
}

// Programar el autopago para las 2:00 AM
const horaAutopago = new Date();
horaAutopago.setHours(2);
horaAutopago.setMinutes(0);
//programarAutopago(horaAutopago);
