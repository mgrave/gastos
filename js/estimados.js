// Agrega evento click al menú de lista
document.querySelector("#estimados-menu").addEventListener("click", function () {
  $("#estimadosModal").modal("show");
});

let idCounterEstimados = 1; // Contador para los ID únicos de cada simulación
let simulaciones = []; // Array para almacenar las simulaciones
let totalEstimado = 0;

// Función para generar un nuevo acordeón de simulación
document.getElementById('agregar-estimado-btn').addEventListener('click', () => {
  const estimadosLista = document.getElementById('estimados-lista');
  const nuevoId = idCounterEstimados++;

  // Crear un nuevo acordeón con los controles para la simulación
  const tarjetas = dataJson.tarjetas;
  const tarjetasActivas = tarjetas.filter(tarjeta => tarjeta.activo);  

  // Generar opciones del combo de tarjetas
  const tarjetasOptions = tarjetasActivas.map(tarjeta => `
  <option value="${tarjeta.cardId}">${tarjeta.nombre || 'NOMBRE TARJETA'}</option>
`).join('');


  const acordeonHTML = `
    <div class="card mb-3" id="estimado-${nuevoId}">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0" id="titulo-estimado-${nuevoId}">NUEVO ESTIMADO</h5>
        <button class="btn btn-link" data-bs-toggle="collapse" data-bs-target="#collapse-${nuevoId}" aria-expanded="false" aria-controls="collapse-${nuevoId}">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
      <div id="collapse-${nuevoId}" class="collapse" data-bs-parent="#estimados-lista">
        <div class="card-body">
          <div class="form-group">
            <label for="tarjeta-estimado-${nuevoId}">Tarjeta</label>
            <select class="form-control" id="tarjeta-estimado-${nuevoId}">
              ${tarjetasOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="monto-estimado-${nuevoId}">Monto</label>
            <input type="number" class="form-control" id="monto-estimado-${nuevoId}" placeholder="Ingrese el monto">
          </div>
          <div class="form-group">
            <label for="detalle-estimado-${nuevoId}">Detalle</label>
            <input type="text" class="form-control" id="detalle-estimado-${nuevoId}" placeholder="Ingrese el detalle">
          </div>
          <div class="form-group">
            <label for="dia-estimado-${nuevoId}">Día del mes</label>
            <input type="number" class="form-control" id="dia-estimado-${nuevoId}" min="1" max="31" placeholder="Día">
          </div>
          <div class="form-group form-check">
            <input type="checkbox" class="form-check-input" id="autopago-estimado-${nuevoId}">
            <label class="form-check-label" for="autopago-estimado-${nuevoId}">Autopago</label>
          </div>
          <button class="btn btn-success" onclick="guardarEstimado(${nuevoId})">Guardar</button>
          <button class="btn btn-danger" onclick="eliminarEstimado(${nuevoId})">Eliminar</button>
          <button class="btn btn-secondary" onclick="cancelarEstimado(${nuevoId})">Cancelar</button>
          <button class="btn btn-primary" onclick="pagarEstimado(${nuevoId})">Pagar</button>
        </div>
      </div>
    </div>`;

  estimadosLista.insertAdjacentHTML('beforeend', acordeonHTML);

  // Desplegar el acordeón recién creado
  $(`#collapse-${nuevoId}`).collapse('show');
});

// Función para guardar una simulación
function guardarEstimado(id) {
  const tarjeta = document.getElementById(`tarjeta-estimado-${id}`).value;
  const monto = document.getElementById(`monto-estimado-${id}`).value;
  const detalle = document.getElementById(`detalle-estimado-${id}`).value;
  const fecha = document.getElementById(`dia-estimado-${id}`).value;
  const autopago = document.getElementById(`autopago-estimado-${id}`).checked;

  const fechaSimulacion = completarFechaSimulacion(fecha); // Completar la fecha de la simulación

  if (tarjeta && monto && detalle) {
    const nuevaSimulacion = {
      movId: id,
      tarjeta: tarjeta,
      monto: parseFloat(monto).toFixed(2),
      detalle: detalle,
      fecha: fechaSimulacion,
      autopago: autopago, // Agregado el estado de autopago
      tipo: 'egreso', // Puede ajustarse según sea necesario
      concepto: 4 // Por defecto, ajustable
    };

    // Buscar si ya existe para actualizar
    const index = simulaciones.findIndex(sim => sim.movId === id);
    if (index !== -1) {
      simulaciones[index] = nuevaSimulacion;
    } else {
      simulaciones.push(nuevaSimulacion);
    }

    // Actualizar el título con el detalle y monto
    document.getElementById(`titulo-estimado-${id}`).textContent = `${detalle.toUpperCase()} - S/.${nuevaSimulacion.monto}`;

    actualizarTotalEstimado();
    guardarEstado();
    // Cerrar el acordeón después de guardar
    $(`#collapse-${id}`).collapse('hide');
  } else {
    alert("Por favor, ingrese todos los campos.");
  }
}

// Función para eliminar una simulación
function eliminarEstimado(id) {
  // Eliminar el acordeón visualmente
  document.getElementById(`estimado-${id}`).remove();

  // Eliminar del array de simulaciones
  simulaciones = simulaciones.filter(sim => sim.movId !== id);

  actualizarTotalEstimado();
}

// Función para cancelar la creación de una simulación (solo si es nueva)
function cancelarEstimado(id) {
  const simulacionExiste = simulaciones.find(sim => sim.movId === id);

  if (!simulacionExiste) {
    eliminarEstimado(id); // Si es nueva, simplemente se elimina
  } else {
    // Si ya estaba guardada, se colapsa el acordeón
    $(`#collapse-${id}`).collapse('hide');
  }
}

// Función para generar un movimiento de pago para un estimado
function pagarEstimado(id) {
  const simulacion = simulaciones.find(sim => sim.movId === id);
  if (simulacion) {
    const movimientoPago = {
      fecha: new Date().toISOString().split('T')[0],
      tipo: simulacion.tipo,
      monto: simulacion.monto,
      concepto: simulacion.concepto,
      tarjeta: simulacion.tarjeta,
      detalle: simulacion.detalle
    };

    // Aquí puedes agregar tu lógica para registrar el movimiento de pago
    console.log(`Pago registrado para el estimado ${id}:`, movimientoPago);

    alert(`Pago realizado para: ${simulacion.detalle} - S/.${simulacion.monto}`);
  } else {
    alert("Estimado no encontrado para realizar el pago.");
  }
}

// Función para pagar todos los estimados
function pagarTodosEstimados() {
  simulaciones.forEach(simulacion => {
    const movimientoPago = {
      fecha: new Date().toISOString().split('T')[0],
      tipo: simulacion.tipo,
      monto: simulacion.monto,
      concepto: simulacion.concepto,
      tarjeta: simulacion.tarjeta,
      detalle: simulacion.detalle
    };

    // Lógica para registrar el movimiento de pago de cada estimado
    console.log(`Pago registrado para el estimado ${simulacion.movId}:`, movimientoPago);
  });

  alert(`Se realizaron pagos por un total de S/.${totalEstimado.toFixed(2)}`);
}

// Función para actualizar la suma total de estimados
function actualizarTotalEstimado() {
  totalEstimado = simulaciones.reduce((total, simulacion) => total + parseFloat(simulacion.monto), 0);
  document.getElementById('total-estimado').textContent = totalEstimado.toFixed(2);
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
  simulaciones.forEach(simulacion => {
    // Solo considerar simulaciones que tienen autopago activado
    if (simulacion.autopago) {
      const fechaActual = obtenerFechaActual(); // Obtener la fecha actual para las comparaciones
      const fechaSimulacion = completarFechaSimulacion(simulacion.dia); // Completar la fecha de la simulación
      
      // Si la fecha de la simulación es anterior o igual a la fecha actual
      if (fechaSimulacion <= fechaActual) {
        // Crear un nuevo movimiento para registrar el pago automático
        const movimientoPago = {
          fecha: fechaSimulacion,
          tipo: simulacion.tipo,
          monto: simulacion.monto,
          tarjeta: simulacion.tarjeta,
          concepto: simulacion.concepto,
          detalle: simulacion.detalle
        };

        // Agregar el movimiento al array de movimientos
        movimientos.push(movimientoPago);
        console.log(`Pago automático realizado para la simulación ${simulacion.movId}:`, movimientoPago);
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
