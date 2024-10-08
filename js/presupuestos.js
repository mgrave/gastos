
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
  .getElementById('agregar-presupuesto-btn')
  .addEventListener('click', () => {
    let idCounterPresupuestos = (presupuestos.length > 0)
      ? Math.max(...presupuestos.map(t => t.pptoId)) + 1
      : 1;

    const nuevoPresupuesto = {
      movId: 0,
      tarjeta: "",
      monto: "",
      detalle: "",
      dia: "",
      autopago: "", // Agregado el estado de autopago
      tipo: 'egreso', // Puede ajustarse según sea necesario
      concepto: 4, // Por defecto, ajustable
      pptoId: idCounterPresupuestos,
      activo: true,
      nuevo: true
    };

    presupuestos.unshift(nuevoPresupuesto); // Agregar la nueva tarjeta al inicio del array
    lastOpenedPptoId = nuevoPresupuesto.pptoId; // Abrir el acordeón de la nueva tarjeta
    isNewPpto = true;
    renderPresupuesto();
  });

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
    ${tarjetasActivas.map(tarjeta => {      
      return `
        <option value="${tarjeta.cardId}" ${parseInt(tarjeta.cardId) === parseInt(presupuesto.tarjeta) ? 'selected' : ''}>
          ${tarjeta.nombre.toUpperCase()}
        </option>
      `;
    }).join('')}
  `;

    const balanceFormatted = parseFloat(presupuesto.monto || 0).toFixed(2);

    const acordeonHTML = `
      <div class="accordion" id="estimadoAccordion-${pptoId}">
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center" id="header-estimado-${pptoId}"
      style="cursor: pointer; background-color: ${presupuesto.pagado ? 'honeydew' : 'cornsilk'};"
      data-bs-toggle="collapse" data-bs-target="#collapse-${pptoId}" aria-expanded="${isExpanded}"
      aria-controls="collapse-${pptoId}" data-bs-parent="#estimados-lista">

      <h5 class="mb-0" id="titulo-estimado-${pptoId}">
        ${presupuesto.detalle || nuevoPptoTexto} [${presupuesto.pagado || "Pendiente"}]
      </h5>

      <!-- Mostrar el balance a la derecha con "S/." en lugar del guion -->
      <div class="d-flex align-items-center">
        <span class="me-2" style="color: black;">S/. ${balanceFormatted}</span>
        <i class="fas fa-chevron-down" style="color: black;"></i>
      </div>
    </div>


    <div id="collapse-${pptoId}" class="collapse ${isExpanded ? 'show' : ''}"
      aria-labelledby="header-estimado-${pptoId}" data-bs-parent="#estimados-lista">
      <div class="card-body">
        <form id="estimadoForm-${pptoId}">
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

          <div class="d-flex justify-content-between align-items-center mt-2">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="autopago-estimado-${pptoId}" ${presupuesto.autopago ? 'checked' : ''}>
              <label class="form-check-label" for="autopago-estimado-${pptoId}">Autopago</label>
            </div>

            <div>
              <button class="btn btn-secondary" id="restaurar-presupuesto-${pptoId}" onclick="restaurarPresupuesto(${pptoId})" style="display: ${presupuesto.detalle && presupuesto.pagado ? 'inline-block' : 'none'};"><i class="fa-solid fa-clock-rotate-left"></i></button>  
              <button class="btn btn-primary" id="pagar-presupuesto-${pptoId}" onclick="pagarPresupuesto(${pptoId})" style="display: ${presupuesto.detalle && !presupuesto.pagado ? 'inline-block' : 'none'};"><i class="fa-solid fa-credit-card"></i></i></button>  
              <button class="btn btn-danger"  onclick="eliminarEstimado(${pptoId})"><i class="fa-solid fa-trash-can"></i></button>
              <button class="btn btn-success" onclick="guardarPresupuesto(${pptoId})"><i class="fa-solid fa-floppy-disk"></i></button>              
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
`;

    presupuestoLista.insertAdjacentHTML('beforeend', acordeonHTML);
  });
}

// Función para guardar una simulación
function guardarPresupuesto(pptoId) {
  const ppto = presupuestos.find(sim => sim.pptoId === pptoId);
  if (ppto) {

    const tarjetaSelect = document.getElementById(`tarjeta-estimado-${pptoId}`);
    const montoInput = document.getElementById(`monto-estimado-${pptoId}`);
    const detalleInput = document.getElementById(`detalle-estimado-${pptoId}`);
    const diaInput = document.getElementById(`dia-estimado-${pptoId}`);
    const autoPagoCheckbox = document.getElementById(`autopago-estimado-${pptoId}`);

    //completarFechaSimulacion(diaInput.value);

    ppto.tarjeta = tarjetaSelect.value;
    ppto.dia = diaInput.value;
    ppto.monto = montoInput.value;
    ppto.detalle = detalleInput.value.toUpperCase();
    ppto.autopago = autoPagoCheckbox.checked;
    ppto.nuevo = false; // Si es nueva, ahora es tarjeta guardada

    isNewPpto = false;
    let hasError = false;


    if (!tarjetaSelect.value || tarjetaSelect.value === '0') {
      tarjetaSelect.classList.add('is-invalid');
      //autoPagoCheckbox.checked = false;
      hasError = true;
    } else {
      tarjetaSelect.classList.remove('is-invalid');
    }

    if (!montoInput.value || montoInput.value <= 0) {
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

    if (!diaInput.value) {
      diaInput.classList.add('is-invalid');
      //autoPagoCheckbox.checked = false;
      hasError = true;
    } else {
      diaInput.classList.remove('is-invalid');
    }

    if (!diaInput.value || diaInput.value < 1 || diaInput.value > 31) {
      diaInput.classList.add('is-invalid');
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
    renderPresupuesto();
    alert("Se guardo el presupuesto con exito.");
    // Cerrar el acordeón después de guardar
    //$(`#collapse-${id}`).collapse('hide');
  }
}

// Función para eliminar una simulación
function eliminarEstimado(pptoId) {
  // Eliminar el acordeón visualmente
  console.log("Presupuestosa: " + presupuestos.length);
  presupuestos = presupuestos.filter(sim => sim.pptoId !== pptoId);
  let confirmacion = confirm("¿Deseas eliminar el presupuesto " + pptoId + "?");

  if (!confirmacion) {
    // Si el usuario cancela, no realizar ninguna acción y salir de la función
    return;
  }
  console.log("Presupuestosb: " + presupuestos.length);
  // Verificar si la tarjeta eliminada es la que estaba abierta
  if (lastOpenedPptoId === pptoId) {
    lastOpenedPptoId = null; // Resetea el acordeón abierto
  }

  actualizarTotalEstimado();
  renderPresupuesto();
  guardarEstado();
}



// Función para generar un movimiento de pago para un estimado
function pagarPresupuesto(pptoId) {
  const presupuesto = presupuestos.find(sim => sim.pptoId === pptoId);
  if (presupuesto) {

    let idCounterMov = (movimientos.length > 0)
    ? Math.max(...movimientos.map(t => t.movId)) + 1
    : 1;

    const fechaActual = obtenerFechaSimulacion(presupuesto.dia); 

    const movimientoPago = {
      movId: idCounterMov,
      fecha: fechaActual,
      tipo: presupuesto.tipo,
      monto: parseInt(presupuesto.monto),
      concepto: presupuesto.concepto,
      tarjeta: parseInt(presupuesto.tarjeta),
      detalle: presupuesto.detalle,
      pptoId: presupuesto.pptoId
    };

    presupuesto.pagado = fechaActual;
    movimientos.push(movimientoPago);

    actualizarMovimientos();
        
    refrescarAcordeon(presupuesto);

    console.log(`Pago registrado para el estimado ${pptoId}:`, movimientoPago);

    //alert(`Pago realizado para: ${presupuesto.detalle} - S/.${presupuesto.monto}`);
  } 
}


document.querySelector("#restaurar-pptos-btn").addEventListener("click", function () {  
  presupuestos.forEach(presupuesto => {       
    restaurarPresupuesto(presupuesto.pptoId);
  });
});

// Función para pagar todos los estimados
document.querySelector("#pagar-pptos-btn").addEventListener("click", function () {
  totalPresupuesto = 0;
  presupuestos.forEach(presupuesto => {   
    if (!presupuesto.autopago && !presupuesto.pagado) {
      pagarPresupuesto(presupuesto.pptoId);
      totalPresupuesto += parseFloat(presupuesto.monto);
    }    
  });

  if(totalPresupuesto === 0){
    alert("No hay presupuestos por pagar.");
    return;
  }else{
    alert(`Se realizaron pagos por un total de S/.${totalPresupuesto.toFixed(2)}`);
  }

});


// Función para obtener la fecha actual en formato año-mes-día
function obtenerFechaActual() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const dia = hoy.getDate().toString().padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// Función para completar la fecha de la simulación usando el mes y año actual
function obtenerFechaSimulacion(dia) {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
  return `${año}-${mes}-${dia.toString().padStart(2, '0')}`;
}

// Función que ejecuta el autopago para las simulaciones pendientes
function ejecutarAutopago() {
  presupuestos.forEach(presupuesto => {
    
    // Solo considerar simulaciones que tienen autopago activado    
    if (presupuesto.autopago && !presupuesto.pagado) {         
      const fechaActual = obtenerFechaActual(); // Obtener la fecha actual para las comparaciones
      const fechaSimulacion = obtenerFechaSimulacion(presupuesto.dia); // Completar la fecha de la simulación
      // Si la fecha de la simulación es anterior o igual a la fecha actual      
      if (fechaSimulacion <= fechaActual) {        
        pagarPresupuesto(presupuesto.pptoId);
      }
    }
  });

  console.log("Pagos automáticos ejecutados:", movimientos);
}

function restaurarPresupuesto(pptoId) {
  const presupuesto = presupuestos.find(sim => sim.pptoId === pptoId);  
  presupuesto.pagado = "";
  guardarEstado();
  refrescarAcordeon(presupuesto);
}

function refrescarAcordeon(presupuesto) {
  const pptoId = presupuesto.pptoId;
  if (presupuesto.pagado) {
    document.getElementById(`header-estimado-${pptoId}`).style.backgroundColor = 'honeydew';
    document.getElementById(`titulo-estimado-${pptoId}`).innerHTML = `${presupuesto.detalle.toUpperCase()} [${presupuesto.pagado}]`;
    document.getElementById(`restaurar-presupuesto-${pptoId}`).style.display = 'inline-block';
    document.getElementById(`pagar-presupuesto-${pptoId}`).style.display = 'none';
  } else {
    document.getElementById(`header-estimado-${pptoId}`).style.backgroundColor = 'cornsilk';
    document.getElementById(`titulo-estimado-${pptoId}`).innerHTML = `${presupuesto.detalle.toUpperCase()} [Pendiente]`;
    document.getElementById(`restaurar-presupuesto-${pptoId}`).style.display = 'none';
    document.getElementById(`pagar-presupuesto-${pptoId}`).style.display = 'inline-block';
  }
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

// Función para ocultar/mostrar presupuestos con autopago
function togglePresupuestosAutopago() {
  const switchAutopago = document.getElementById('presupuestosSwitch');
  const presupuestosAutopago = presupuestos.filter(p => p.autopago);
  
  presupuestosAutopago.forEach(presupuesto => {
    const acordeon = document.getElementById(`estimadoAccordion-${presupuesto.pptoId}`);
    if (acordeon) {
      acordeon.style.display = switchAutopago.checked ? 'none' : 'block';
    }
  });
  
  actualizarTotalEstimado();
}

// Modificar la función actualizarTotalEstimado
function actualizarTotalEstimado() {
  const switchAutopago = document.getElementById('presupuestosSwitch');
  totalPresupuesto = presupuestos.reduce((total, presupuesto) => {
    if (!switchAutopago.checked || !presupuesto.autopago) {
      return total + parseFloat(presupuesto.monto || 0);
    }
    return total;
  }, 0);
  
  document.getElementById('total-estimado').textContent = totalPresupuesto.toFixed(2);
}

// Agregar evento al switch
document.getElementById('presupuestosSwitch').addEventListener('change', togglePresupuestosAutopago);


// Programar el autopago para las 2:00 AM
const horaAutopago = new Date();
horaAutopago.setHours(2);
horaAutopago.setMinutes(0);
//programarAutopago(horaAutopago);
