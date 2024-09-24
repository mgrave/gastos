let formularioModificado = false;
let transferenciaSeleccionada = ''; // Variable para persistir el valor de la transferencia

// Llamar la función para llenar el selector al abrir el modal
$('#opcionesModal').on('show.bs.modal', loadOpciones);


// Marcar el formulario como modificado cuando se cambia cualquier campo
document.getElementById("fecha-selector").addEventListener("change", function () {
  formularioModificado = true;
});
document.getElementById("cuotas-selector").addEventListener("change", function () {
  formularioModificado = true;
  
  // Limpiar el selector de transferencia si se seleccionan cuotas
  document.getElementById("transferencia-selector").value = "";
});
document.getElementById("transferencia-selector").addEventListener("change", function () {
  formularioModificado = true;
  // Restablecer el selector de cuotas a 1 si se selecciona una transferencia
  document.getElementById("cuotas-selector").value = 1;
});


// Llenar el selector de tarjetas en el modal
function loadOpciones() {
  console.log("Llenar Selector Transferencia ejecutado");
  const transferenciaSelector = document.getElementById('transferencia-selector');
  transferenciaSelector.innerHTML = ''; // Limpiar opciones anteriores

  // Agregar opción en blanco
  const blankOption = document.createElement('option');
  blankOption.value = '';
  blankOption.textContent = 'Seleccione una tarjeta';
  transferenciaSelector.appendChild(blankOption);
  
  let tarjetas = dataJson.tarjetas;
  tarjetasActivas = tarjetas.filter(tarjeta => tarjeta.activo);
  let tarjetaOrigen = tarjetasActivas.find(tarjeta => tarjeta.cardId === tarjetaPivot);

  tarjetasActivas.forEach(tarjeta => {
    // Excluir la tarjeta seleccionada actualmente
    if (tarjeta.cardId !== tarjetaOrigen.cardId) {
      const option = document.createElement('option');
      option.value = tarjeta.cardId; // Usar el ID único de la tarjeta
      option.textContent = `${tarjeta.nombre} - Saldo: $${tarjeta.balance}`;
      transferenciaSelector.appendChild(option);
    }
  });

  // Restaurar el valor de transferencia previamente seleccionado si existe
  transferenciaSelector.value = transferenciaSeleccionada || '';
}

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

}

// Función para cambiar tarjeta
function cambiarTarjeta() {
  // Obtener la lista de tarjetas activas
  let tarjetas = dataJson.tarjetas;
  tarjetasActivas = tarjetas.filter(tarjeta => tarjeta.activo);

  // Encontrar el índice de la tarjeta activa actual
  const indexActual = tarjetasActivas.findIndex(tarjeta => tarjeta.cardId === tarjetaPivot);
  
  // Calcular el índice de la siguiente tarjeta
  const siguienteIndice = (indexActual + 1) % tarjetasActivas.length;

  // Obtener la siguiente tarjeta activa
  const tarjetaSeleccionada = tarjetasActivas[siguienteIndice];

  // Actualizar el cardId de la tarjeta actual
  tarjetaPivot = tarjetaSeleccionada.cardId;

  // Actualizar el texto del botón y el color de fondo
  document.getElementById("btn-tarjeta").innerText = tarjetaSeleccionada.nombre;
  document.getElementById("btn-tarjeta").style.backgroundColor = tarjetaSeleccionada.color;

  // Actualizar el tipo de tarjeta
  const tipoTarjeta = document.getElementById('tipoTarjeta');
  tipoTarjeta.textContent = tarjetaSeleccionada.tipo === 'credito' ? 'T. Crédito' : 'T. Débito';

  // Actualizar movimientos
  actualizarMovimientos();
}


function cambiarConcepto() {
  conceptoPivot = (conceptoPivot + 1) % conceptos.length;
  const conceptoSeleccionado = conceptos[conceptoPivot];
  document.getElementById("btn-concepto").innerText =
    conceptoSeleccionado.nombre;
  document.getElementById("btn-concepto").style.backgroundColor =
    conceptoSeleccionado.color;
}


// Función para confirmar la fecha seleccionada
function confirmarOpciones() {  
  const fechaInput = document.getElementById("fecha-selector").value;
  
  
  if (fechaInput) {
    const fechaLocal = new Date(fechaInput);
    
    // Aplicar la zona horaria UTC-5 (Lima, Perú)
    const utcOffset = -5 * 60; // Diferencia horaria en minutos (-5 horas)
    const fechaLocalOffset = new Date(fechaLocal.getTime() + (fechaLocal.getTimezoneOffset() * 60000) + (utcOffset * 60000));

    const año = fechaLocalOffset.getFullYear();
    const mes = String(fechaLocalOffset.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaLocalOffset.getDate()).padStart(2, '0');
    fechaSeleccionada = `${año}-${mes}-${dia}`;
    console.log("confirmarOpciones fecha "+fechaSeleccionada);
  }
  
  // Guardar la transferencia seleccionada
  transferenciaSeleccionada = document.getElementById('transferencia-selector').value;

  actualizarOpciones();
  $("#opcionesModal").modal("hide");
  formularioModificado = false;
}

// Resetear valores del formulario
function resetearOpciones() {

  const fechaLocal = new Date(); // Aplicar la zona horaria UTC-5 (Lima, Perú)
  const utcOffset = -5 * 60; // Diferencia horaria en minutos (-5 horas)
  const fechaLocalOffset = new Date(fechaLocal.getTime() + (fechaLocal.getTimezoneOffset() * 60000) + (utcOffset * 60000));
  const año = fechaLocalOffset.getFullYear();
  const mes = String(fechaLocalOffset.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaLocalOffset.getDate()).padStart(2, '0');
  let fechaSeleccionada = `${año}-${mes}-${dia}`;
  console.log("resetearOpciones fecha "+fechaSeleccionada);

  //const hoy = new Date();
  //const hoyString = hoy.toISOString().split("T")[0];
  document.getElementById("fecha-selector").value = fechaSeleccionada;
  document.getElementById("cuotas-selector").value = 1;
  document.getElementById("transferencia-selector").value = "";  
  transferenciaSeleccionada = ''; // Resetear la transferencia seleccionada

  actualizarOpciones();
  formularioModificado = false;
}

// Actualizar el estado del formulario
function actualizarOpciones() {
  const fechaActual = new Date().toISOString().split("T")[0];  
  const cuotasSelector = document.getElementById("cuotas-selector");
  const transferencia = document.getElementById("transferencia-selector");
  const iconoFecha = document.getElementById("fecha-icon");

  iconoFecha.style.color = ""; // Restaurar color por defecto

  if (fechaSeleccionada !== fechaActual || cuotasSelector.value !== "1" || transferencia.value !== "") {
    iconoFecha.style.color = "red";
    formularioModificado = true;
  }
}

// Detectar cambio en el selector de cuotas y transferencia
document.getElementById("cuotas-selector").addEventListener("change", function() {
  document.getElementById("transferencia-selector").value = "";
  transferenciaSeleccionada = ''; // Vaciar transferencia al seleccionar cuotas
  actualizarOpciones();
});

document.getElementById("transferencia-selector").addEventListener("change", function() {
  document.getElementById("cuotas-selector").value = 1;
  actualizarOpciones();
});