// Función para cambiar movimiento
function cambiarMovimiento() {
  movimientoPivot = (movimientoPivot + 1) % tipoMovimientoActivos.length; // Alterna entre "ingreso" y "egreso"
  const btnMovimiento = document.getElementById("btn-movimiento");
  btnMovimiento.innerText = tipoMovimientoActivos[movimientoPivot].alias;
  btnMovimiento.style.backgroundColor =
    tipoMovimientoActivos[movimientoPivot].color;
  btnMovimiento.style.color = "white";
  conceptos = conceptosActivos.filter(
    (c) => c.tipo_movimiento === tipoMovimientoActivos[movimientoPivot].tipo
  );

  const btnGuardar = document.querySelector('button[onclick="agregarMovimiento()"]');
  if (tipoMovimientoActivos[movimientoPivot].tipo === 'egreso') {
    btnGuardar.classList.remove('btn-success');
    btnGuardar.classList.add('btn-danger');
  } else if (tipoMovimientoActivos[movimientoPivot].tipo === 'ingreso') {
    btnGuardar.classList.remove('btn-danger');
    btnGuardar.classList.add('btn-success');
  }

  cambiarConcepto();
  resetearOpciones();

}

// Función para cambiar tarjeta
function cambiarTarjeta() {
  // Get active cards by filtering tarjetas based on `activo` flag
  let tarjetas = dataJson.tarjetas;
  tarjetasActivas = tarjetas.filter(tarjeta => tarjeta.activo);
  tarjetaPivot = (tarjetaPivot + 1) % tarjetasActivas.length;
  const tarjetaSeleccionada = tarjetasActivas[tarjetaPivot];
  document.getElementById("btn-tarjeta").innerText =
    tarjetaSeleccionada.nombre;
  document.getElementById("btn-tarjeta").style.backgroundColor =
    tarjetaSeleccionada.color;

  const tipoTarjeta = document.getElementById('tipoTarjeta');

  tipoTarjeta.textContent = tarjetaSeleccionada.tipo === 'credito' ? 'T. Crédito' : 'T. Débito';

  actualizarMovimientos(); // Update grid and balance when changing the card
}

function cambiarConcepto() {
  conceptoPivot = (conceptoPivot + 1) % conceptos.length;
  const conceptoSeleccionado = conceptos[conceptoPivot];
  document.getElementById("btn-concepto").innerText =
    conceptoSeleccionado.nombre;
  document.getElementById("btn-concepto").style.backgroundColor =
    conceptoSeleccionado.color;
}



//Transferencia
// Llenar el selector de tarjetas en el modal
function llenarSelectorTransferencia() {
  const transferenciaSelector = document.getElementById('transferencia-selector');
  transferenciaSelector.innerHTML = ''; // Limpiar opciones anteriores

  // Agregar opción en blanco
  const blankOption = document.createElement('option');
  blankOption.value = '';
  blankOption.textContent = 'Seleccione una tarjeta';
  transferenciaSelector.appendChild(blankOption);
  
  let tarjetas = dataJson.tarjetas;
  tarjetasActivas = tarjetas.filter(tarjeta => tarjeta.activo);

  tarjetasActivas.forEach(tarjeta => {
    // Excluir la tarjeta que coincide con tarjetaPivot

    if (tarjeta.cardId !== tarjetaPivot + 1) {
      const option = document.createElement('option');
      option.value = tarjeta.cardId; // Usar el ID único de la tarjeta
      option.textContent = `${tarjeta.nombre} - Saldo: $${tarjeta.balance}`;
      transferenciaSelector.appendChild(option);
    }
  });
}


// Función para confirmar la fecha seleccionada
function confirmarOpciones() {
  const fechaSeleccionadaInput =
    document.getElementById("fecha-selector").value;
  if (fechaSeleccionadaInput) {
    // Crear la fecha en la zona horaria local
    const fechaLocal = new Date(fechaSeleccionadaInput + "T00:00:00");
    fechaSeleccionada = fechaLocal.toISOString().split("T")[0];
  } else {
    fechaSeleccionada = new Date().toISOString().split("T")[0];
  }
  actualizarOpciones();
  $("#fechaModal").modal("hide");
}

function resetearOpciones() {
  const hoy = new Date();
  const hoyString = hoy.toISOString().split("T")[0];
  document.getElementById("fecha-selector").value = hoyString;
  document.getElementById("cuotas-selector").value = 1;
  document.getElementById("transferencia-selector").value = "";
  fechaSeleccionada = hoyString;

  actualizarOpciones();
}

function actualizarOpciones() {
  const fechaActual = new Date().toISOString().split("T")[0];  
  const cuotasSelector = document.getElementById("cuotas-selector");
  const transferencia = document.getElementById("transferencia-selector");
  const iconoFecha = document.getElementById("fecha-icon");

  iconoFecha.style.color = ""; // Restaurar color por defecto

  // Verificar si los elementos existen y si tienen un valor seleccionado
  //const cuotasValida = cuotasSelector && cuotasSelector.value !== "";
  //const transferenciaValida = transferencia && transferencia.value !== "";
  if (fechaSeleccionada !== fechaActual || cuotasSelector.value !== "1" || transferencia.value !== "") {
    iconoFecha.style.color = "red";
  }
}