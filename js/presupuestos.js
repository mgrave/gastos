//todo
/*todo la barra de titulo del acordeon debe permitir desplegar/cerrar el acordeon
elimina el boton cancelar
el check de autopago tiene como requisito el dia de mes y la tarjeta
el fondo del encabezado del acordeon debe ser verde claro si se ha pagado
agregar un boton al costado de poagar todo que se llamara restaurar
al agregar un nuevo pppto se debe abrir un nuevo acordeon por encima de los demas
solo debe haber un acordeon

al eliminar debe confirmarse en un popup
al guardar debe confirmarse en un popup
el movId se genera al momento de pagar
obtener los items con flag autopago
si el dia del mes es igual o mayor a la fecha actual entonces agregar el movimiento*/
// Agrega evento click al menú de lista
document.querySelector("#estimados-menu").addEventListener("click", function () {
  $("#estimadosModal").modal("show");
});

let totalPresupuesto = 0;

// Función para generar un nuevo acordeón de simulación
document.getElementById('agregar-estimado-btn').addEventListener('click', () => {
  const presupuestoLista = document.getElementById('estimados-lista');
  let idCounterPresupuestos = Math.max(...presupuestos.map(t => t.pptoId)) + 1 || 1;
  const nuevoId = idCounterPresupuestos++;

  // Crear un nuevo acordeón con los controles para la simulación
  //const tarjetas = dataJson.tarjetas; //ORIG
  const tarjetasActivas = tarjetas.filter(tarjeta => tarjeta.activo);  

  // Generar opciones del combo de tarjetas
  const tarjetasOptions = tarjetasActivas.map(tarjeta => `
    <option value="${tarjeta.cardId}">${tarjeta.nombre || 'NOMBRE TARJETA'}</option>
  `).join('');

  const acordeonHTML = `
    <div class="card mb-3" id="estimado-${nuevoId}">
      <div class="card-header d-flex justify-content-between align-items-center" 
           id="header-estimado-${nuevoId}" 
           style="cursor: pointer; background-color: ${isPagado(nuevoId) ? 'lightgreen' : 'inherit'};"
           data-bs-toggle="collapse" data-bs-target="#collapse-${nuevoId}" 
           aria-expanded="false" aria-controls="collapse-${nuevoId}">
        <h5 class="mb-0" id="titulo-estimado-${nuevoId}">NUEVO ESTIMADO</h5>
        <button class="btn btn-link" aria-expanded="false" aria-controls="collapse-${nuevoId}">
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
            <div id="autopago-warning-${nuevoId}" class="text-danger" style="display: none;">
              El autopago requiere seleccionar una tarjeta y un día del mes.
            </div>
          </div>
          <button class="btn btn-success" onclick="guardarEstimado(${nuevoId})">Guardar</button>
          <button class="btn btn-danger" onclick="eliminarEstimado(${nuevoId})">Eliminar</button>
          <button class="btn btn-primary" onclick="pagarEstimado(${nuevoId})">Pagar</button>
          <button class="btn btn-secondary" onclick="restaurarEstimado(${nuevoId})">Restaurar</button>
        </div>
      </div>
    </div>`;

    presupuestoLista.insertAdjacentHTML('beforeend', acordeonHTML);

  // Desplegar el acordeón recién creado
  $(`#collapse-${nuevoId}`).collapse('show');

  // Actualizar el estado del mensaje de advertencia del autopago
  document.getElementById(`autopago-estimado-${nuevoId}`).addEventListener('change', function() {
    const tarjeta = document.getElementById(`tarjeta-estimado-${nuevoId}`).value;
    const dia = document.getElementById(`dia-estimado-${nuevoId}`).value;
    const warning = document.getElementById(`autopago-warning-${nuevoId}`);
    if (this.checked && (!tarjeta || !dia)) {
      warning.style.display = 'block';
    } else {
      warning.style.display = 'none';
    }
  });
});

// Función para verificar si el estimado ha sido pagado (esto es un ejemplo, implementa según tu lógica)
function isPagado(id) {
  // Aquí implementa la lógica para determinar si el estimado ha sido pagado
  // Por ejemplo, puedes usar un array de IDs pagados o una propiedad en los datos
  return false; // Cambia esto por tu lógica real
}

// Función de restaurar estimado (debes implementarla)
function restaurarEstimado(id) {
  console.log(`Restaurar estimado ${id}`);
  // Implementa la funcionalidad de restauración aquí
}


// Función para guardar una simulación
function guardarEstimado(id) {
  console.log(id)
  const tarjeta = document.getElementById(`tarjeta-estimado-${id}`).value;
  const monto = document.getElementById(`monto-estimado-${id}`).value;
  const detalle = document.getElementById(`detalle-estimado-${id}`).value;
  const fecha = document.getElementById(`dia-estimado-${id}`).value;
  const autopago = document.getElementById(`autopago-estimado-${id}`).checked;

  const fechaPresupuesto = completarFechaSimulacion(fecha); // Completar la fecha de la simulación

  if (tarjeta && monto && detalle) {
    const nuevoPresupuesto = {
      movId: 0,
      tarjeta: tarjeta,
      monto: parseFloat(monto).toFixed(2),
      detalle: detalle,
      fecha: fechaPresupuesto,
      autopago: autopago, // Agregado el estado de autopago
      tipo: 'egreso', // Puede ajustarse según sea necesario
      concepto: 4, // Por defecto, ajustable
      pptoId: id 
    };

    // Buscar si ya existe para actualizar
    const index = presupuestos.findIndex(sim => sim.pptoId === id);
    if (index !== -1) {
      presupuestos[index] = nuevoPresupuesto;
    } else {
      presupuestos.push(nuevoPresupuesto);
    }

    // Actualizar el título con el detalle y monto
    document.getElementById(`titulo-estimado-${id}`).textContent = `${detalle.toUpperCase()} - S/.${nuevoPresupuesto.monto}`;

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
  presupuestos = presupuestos.filter(sim => sim.movId !== id);

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
