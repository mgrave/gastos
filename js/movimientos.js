


// Función para agregar movimiento
function agregarMovimiento() {

  const fechaLocal = new Date(); // Aplicar la zona horaria UTC-5 (Lima, Perú)
  const utcOffset = -5 * 60; // Diferencia horaria en minutos (-5 horas)
  const fechaLocalOffset = new Date(fechaLocal.getTime() + (fechaLocal.getTimezoneOffset() * 60000) + (utcOffset * 60000));
  const año = fechaLocalOffset.getFullYear();
  const mes = String(fechaLocalOffset.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaLocalOffset.getDate()).padStart(2, '0');
  let fechaActual = `${año}-${mes}-${dia}`;

  //let tarjetas = dataJson.tarjetas; //ORIG
  const monto = parseFloat(document.getElementById("monto").value); // Convertir monto a número
  const cuotas = parseInt(document.getElementById("cuotas-selector").value) || 1; // Obtener el valor de cuotas, por defecto 1
  const montoPorCuota = parseFloat(monto / cuotas).toFixed(2); // Monto dividido entre cuotas (o total si es 1)
  const fechaSeleccionada = document.getElementById("fecha-selector").value; // debe obtener la fecha de opciones
  console.log("agregarMovimiento fecha " + fechaSeleccionada)
  const detalleMov = document.getElementById("detalle").value;
  const tarjetaTransferencia = document.getElementById('transferencia-selector');
  
  if (monto && monto > 0) { // Validar que el monto sea válido
    const fechaCuota = new Date(fechaSeleccionada); // Crear una nueva fecha basada en la fecha seleccionada o actual

    const tarjetasActivas = tarjetas.filter(tarjeta0 => tarjeta0.activo);

    const tarjetaOrigen = tarjetasActivas.find(tarjeta1 => tarjeta1.cardId === parseInt(tarjetaPivot));
    const tarjetaDestino = tarjetasActivas.find(tarjeta2 => tarjeta2.cardId === parseInt(tarjetaTransferencia.value));

    let idCounterMov = (movimientos.length > 0)
    ? Math.max(...movimientos.map(t => t.movId)) + 1
    : 1;

    // Iterar por cada cuota y generar un movimiento para cada una
    for (let i = 0; i < cuotas; i++) {
      const fechaMovimiento = new Date(fechaCuota);
      fechaMovimiento.setMonth(fechaCuota.getMonth() + i); // Aumentar la fecha en meses según la cuota
      const nuevoMovimiento = {
        movId: idCounterMov, // Incrementar el identificador único
        fecha: fechaMovimiento.toISOString().split('T')[0], // Formato de fecha en YYYY-MM-DD
        tipo: tipoMovimientoActivos[movimientoPivot].tipo, // Tipo de movimiento actual
        monto: parseFloat(montoPorCuota), // Monto numérico
        concepto: conceptos[conceptoPivot].conceptId, // Concepto seleccionado
        tarjeta: parseInt(tarjetaOrigen.cardId), // Tarjeta seleccionada como número
        detalle: tarjetaTransferencia && tarjetaTransferencia.value !== "" ? `[${tarjetaDestino.nombre}]` : detalleMov, // Detalle
        transferira: tarjetaTransferencia && tarjetaTransferencia.value !== "" ? parseInt(tarjetaTransferencia.value) : null, // Convertir valor de transferencia a número
        transferidode: null, // Se llena luego si es una transferencia
        cuota: cuotas > 1 ? `${i + 1}/${cuotas}` : ""
      };

      movimientos.push(nuevoMovimiento); // Agregar el nuevo movimiento
    }

    // Verificar si la transferencia fue seleccionada y es válida
    if (tarjetaTransferencia && tarjetaTransferencia.value !== "") {
      const transferencia = {
        movId: idCounter++, // Incrementar el identificador único para la transferencia
        fecha: fechaCuota.toISOString().split('T')[0], // Formato de fecha en YYYY-MM-DD
        tipo: "ingreso", // Tipo de movimiento
        monto: parseFloat(montoPorCuota), // Monto como número
        concepto: conceptos[conceptoPivot].conceptId, // Concepto seleccionado
        tarjeta: parseInt(tarjetaTransferencia.value), // Convertir valor de la tarjeta a número
        detalle: `[${tarjetaOrigen.nombre}]`, // Detalle
        transferira: null, // No se transfiere a otra tarjeta
        transferidode: parseInt(tarjetaOrigen.cardId), // Tarjeta de origen, convertida a número
        cuota: ""
      };

      movimientos.push(transferencia); // Agregar el movimiento de transferencia
      //console.log("MOVIMIENTOS... " + JSON.stringify(movimientos, null, 2));
    }

    actualizarMovimientos(); // Actualizar los movimientos y el balance

    // Limpiar campos después de la operación
    document.getElementById("monto").value = ""; // Limpiar el input de monto
    document.getElementById("detalle").value = ""; // Limpiar el input de texto        
    document.getElementById('transferencia-selector').value = "";
    document.getElementById("cuotas-selector").value = 1; // Limpiar el selector de cuotas

    $("#opcionesModal").modal("hide"); // Cerrar el modal de selección de fecha
    actualizarOpciones();
  } else {
    alert("Por favor, ingrese un monto válido.");
  }
}

// Función para actualizar la tabla de movimientos
function actualizarMovimientos() {
  const tbody = document.getElementById("movimientos-tbody");
  tbody.innerHTML = "";
  document.getElementById("sin-movimientos").style.display = "none";

  //const tarjetaSeleccionada = tarjetasActivas[tarjetaPivot];
  const tarjetaSeleccionada = tarjetasActivas.find(tarjeta => tarjeta.cardId === tarjetaPivot);
  const movimientosFiltrados = movimientos.filter(
    (m) => m.tarjeta === tarjetaSeleccionada.cardId
  );

  if (movimientosFiltrados.length === 0) {
    document.getElementById("sin-movimientos").style.display = "block";
    document.getElementById("balance").textContent = "0.00";
    document.getElementById("balance").className = "balance-positive";
    tarjetaSeleccionada.balance = 0;
    tarjetaSeleccionada.parcial = 0; // No hay movimientos para sumar
  } else {
    let mesActual = "";

    // Ordenar movimientos por fecha
    const movimientosOrdenados = calcularEstadoCuenta(movimientosFiltrados);

    //dataJson.movimientos = movimientosOrdenados;

    movimientosOrdenados.forEach((movimiento) => {
      const fecha = new Date(movimiento.fecha + "T00:00:00");
      const dia = fecha.getDate(); // Obtener solo el día de la fecha
      const mes = fecha.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
      });

      // Agregar separador de mes si cambia
      if (mes !== mesActual) {
        const trMes = document.createElement("tr");
        const tdMes = document.createElement("td");
        tdMes.colSpan = 5; // Ajustar colspan si es necesario
        tdMes.className = "month-separator";
        tdMes.textContent = mes;
        trMes.appendChild(tdMes);
        tbody.appendChild(trMes);
        mesActual = mes;
      }

      // Crear la fila del movimiento
      const tipoMovimiento = dataConf.tipoMovimiento.find(
        (d) => d.tipo === movimiento.tipo
      );

      const concepto = conceptosActivos.find(
        (c) => c.conceptId === movimiento.concepto
      );

      const tr = document.createElement("tr");
      tr.className = tipoMovimiento.class;

      const tdFecha = document.createElement("td");
      tdFecha.textContent = dia; // Mostrar solo el día de la fecha
      tdFecha.className = tipoMovimiento.class;

      const tdDetalle = document.createElement("td");
      //tdConcepto.textContent = concepto ? concepto.nombre : tipoMovimiento.alias;
      let detalle = movimiento.detalle ? movimiento.detalle : concepto.nombre;
      let cuotas = movimiento.cuota ? `[${movimiento.cuota}]` : "";
      tdDetalle.textContent = `${detalle} ${cuotas}`
      tdDetalle.className = tipoMovimiento.class;

      //const tdDetalle = document.createElement("td");
      //tdDetalle.textContent = movimiento.detalle;

      const tdMonto = document.createElement("td");
      tdMonto.textContent = parseFloat(movimiento.monto).toFixed(2);
      tdMonto.className =
        movimiento.tipo === "ingreso"
          ? "text-success align-right " + tipoMovimiento.class
          : movimiento.tipo === "egreso"
            ? "text-danger align-right " + tipoMovimiento.class
            : "align-right " + tipoMovimiento.class;

      tr.appendChild(tdFecha);
      tr.appendChild(tdDetalle);
      //tr.appendChild(tdDetalle);
      tr.appendChild(tdMonto);

      // Agregar botón de eliminar

      const tdEliminar = document.createElement("td");
      tdEliminar.className = "align-right " + tipoMovimiento.class;
      if (concepto) {
        tdEliminar.innerHTML = `<button class="btn btn-danger btn-sm" onclick="eliminarMovimiento(${movimiento.movId})">
    <i class="fas fa-trash-alt"></i>
  </button>`;
      }


      tr.appendChild(tdEliminar);

      tbody.appendChild(tr);
    });

    // Actualizar el balance y parcial en pantalla
    const balanceElemento = document.getElementById("balance");
    balanceElemento.textContent = tarjetaSeleccionada.balance.toFixed(2);
    balanceElemento.className = tarjetaSeleccionada.balance >= 0 ? "balance-positive" : "balance-negative";
  }
  guardarEstado();
}


// Función para eliminar un movimiento
function eliminarMovimiento(movId) {
  if (confirm("¿Estás seguro de que quieres eliminar este movimiento?")) {
    // Encontrar y eliminar el movimiento correcto usando el ID
    movimientos = movimientos.filter(
      (movimiento) => movimiento.movId !== movId
    );
    actualizarMovimientos();
  }
}