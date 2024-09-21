
// Agrega evento click al menú de lista
document
  .querySelector("#estimados-menu")
  .addEventListener("click", function () {
    $("#estimadosModal").modal("show");
    renderTarjetas(); // Renderizar las tarjetas al cargar el DOM
  });
  
let idCounterEstimados = 1; // Contador para los ID únicos de cada simulación
let simulaciones = []; // Array para almacenar las simulaciones
let totalEstimado = 0;

// Función para generar un nuevo acordeón de simulación
function agregarEstimado() {
  const estimadosLista = document.getElementById('estimados-lista');
  const nuevoId = idCounterEstimados++;

  // Crear un nuevo acordeón con los controles para la simulación
  const acordeonHTML = `
    <div class="card mb-3" id="estimado-${nuevoId}">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0" id="titulo-estimado-${nuevoId}">NUEVO ESTIMADO</h5>
        <button class="btn btn-link" data-toggle="collapse" data-target="#collapse-${nuevoId}" aria-expanded="false" aria-controls="collapse-${nuevoId}">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
      <div id="collapse-${nuevoId}" class="collapse" data-parent="#estimados-lista">
        <div class="card-body">
          <div class="form-group">
            <label for="monto-estimado-${nuevoId}">Monto</label>
            <input type="number" class="form-control" id="monto-estimado-${nuevoId}" placeholder="Ingrese el monto">
          </div>
          <div class="form-group">
            <label for="detalle-estimado-${nuevoId}">Detalle</label>
            <input type="text" class="form-control" id="detalle-estimado-${nuevoId}" placeholder="Ingrese el detalle">
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
}

// Función para guardar una simulación
function guardarEstimado(id) {
  const monto = document.getElementById(`monto-estimado-${id}`).value;
  const detalle = document.getElementById(`detalle-estimado-${id}`).value;

  if (monto && detalle) {
    const nuevaSimulacion = {
      movId: id,
      monto: parseFloat(monto).toFixed(2),
      detalle: detalle,
      fecha: new Date().toISOString().split('T')[0], // Fecha actual
      tipo: 'egreso', // Puede ajustarse según sea necesario
      concepto: 4, // Por defecto, ajustable
      tarjeta: tarjetaSeleccionada.cardId, // Tarjeta seleccionada
      cuota: "" // Puede ser ajustado
    };

    // Buscar si ya existe para actualizar
    const index = simulaciones.findIndex(sim => sim.movId === id);
    if (index !== -1) {
      simulaciones[index] = nuevaSimulacion;
    } else {
      simulaciones.push(nuevaSimulacion);
    }

    // Actualizar el título con el detalle y monto
    document.getElementById(`titulo-estimado-${id}`).textContent = `${detalle.toUpperCase()} - $${nuevaSimulacion.monto}`;

    actualizarTotalEstimado();
    guardarEstado();
    // Cerrar el acordeón después de guardar
    $(`#collapse-${id}`).collapse('hide');
  } else {
    alert("Por favor, ingrese todos los campos.");
  }
  guardarEstado();
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
  guardarEstado();
}

// Función para generar un movimiento de pago para un estimado
function pagarEstimado(id) {
  const simulacion = simulaciones.find(sim => sim.movId === id);
  if (simulacion) {
    const movimientoPago = {
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'pago',
      monto: simulacion.monto,
      concepto: 'Pago estimado',
      tarjeta: tarjetaSeleccionada.cardId,
      detalle: simulacion.detalle
    };

    // Aquí puedes agregar tu lógica para registrar el movimiento de pago
    console.log(`Pago registrado para el estimado ${id}:`, movimientoPago);

    alert(`Pago realizado para: ${simulacion.detalle} - $${simulacion.monto}`);
  } else {
    alert("Estimado no encontrado para realizar el pago.");
  }
}

// Función para pagar todos los estimados
function pagarTodosEstimados() {
  simulaciones.forEach(simulacion => {
    const movimientoPago = {
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'pago',
      monto: simulacion.monto,
      concepto: 'Pago estimado',
      tarjeta: tarjetaSeleccionada.cardId,
      detalle: simulacion.detalle
    };

    // Lógica para registrar el movimiento de pago de cada estimado
    console.log(`Pago registrado para el estimado ${simulacion.movId}:`, movimientoPago);
  });

  alert(`Se realizaron pagos por un total de $${totalEstimado.toFixed(2)}`);
}

// Función para actualizar la suma total de estimados
function actualizarTotalEstimado() {
  totalEstimado = simulaciones.reduce((total, simulacion) => total + parseFloat(simulacion.monto), 0);
  document.getElementById('total-estimado').textContent = totalEstimado.toFixed(2);
}

// Inicializar el botón de agregar estimado
document.getElementById('agregar-estimado-btn').addEventListener('click', agregarEstimado);

// Inicializar el botón de pagar todos
document.getElementById('pagar-todo-btn').addEventListener('click', pagarTodosEstimados);



