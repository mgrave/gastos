var dataJson = {
    "tarjetas": [
        {
            "cardId": 1,
            "nombre": "Visa",
            "tipo": "credito",
            "color": "black",
            "factura": 12,
            "pago": 10,
            "control": 0,
            "parcial": 0,
            "balance": 2500,
            "activo": true
        },
        {
            "cardId": 2,
            "nombre": "Amex",
            "tipo": "credito",
            "color": "red",
            "factura": 16,
            "pago": 30,
            "control": 0,
            "parcial": 0,
            "balance": 2500,
            "activo": true
        },
        {
            "cardId": 3,
            "nombre": "Master",
            "tipo": "credito",
            "color": "blue",
            "factura": 16,
            "pago": 30,
            "control": 700,
            "parcial": 500,
            "balance": 2500,
            "activo": true
        },
        {
            "cardId": 4,
            "nombre": "BCP",
            "tipo": "debito",
            "color": "red",
            "factura": 16,
            "pago": 10,
            "control": 0,
            "parcial": 0,
            "balance": 2500,
            "activo": true
        },
        {
            "cardId": 5,
            "nombre": "Prestamo",
            "tipo": "debito",
            "color": "blue",
            "factura": 16,
            "pago": 10,
            "control": 0,
            "parcial": 0,
            "balance": 2500,
            "activo": true
        }
    ],
    "conceptos": [
        {
            "conceptId": 1,
            "nombre": "Sueldo",
            "tipo_movimiento": "ingreso",
            "color": "green",
            "por_defecto": false,
            "activo": true
        },
        {
            "conceptId": 2,
            "nombre": "Basico",
            "tipo_movimiento": "egreso",
            "color": "blue",
            "por_defecto": true,
            "activo": true
        },
        {
            "conceptId": 3,
            "nombre": "Gusto",
            "tipo_movimiento": "egreso",
            "color": "red",
            "por_defecto": false,
            "activo": true
        },
        {
            "conceptId": 4,
            "nombre": "Ahorro",
            "tipo_movimiento": "egreso",
            "color": "gray",
            "por_defecto": false,
            "activo": true
        }
    ]
}

let tarjetas = dataJson.tarjetas.filter((tarjeta) => tarjeta.activo);
//const tarjetas = dataJson.tarjetas.map((tarjeta) => tarjeta);
const dataConf = {
    tipoMovimiento: [
        {
            tipo: "ingreso",
            color: "green", //usado para el boton
            class: "ingreso", //usado para las filas
            alias: "Ingreso",
            activo: true,
        },
        {
            tipo: "egreso",
            color: "red",
            class: "egreso",
            alias: "Egreso",
            activo: true,
        },
        {
            tipo: "factura",
            class: "factura",
            alias: "Factura",
            activo: false,
        },
        {
            tipo: "pago",
            class: "pago",
            alias: "Fecha de pago",
            activo: false,
        },
    ],
};

const tipoMovimientoActivos = dataConf.tipoMovimiento.filter(
    (tipoMov) => tipoMov.activo
);

let conceptosActivos = dataJson.conceptos.filter(
    (conceptos) => conceptos.activo
);

let tarjetaPivot = 4;
let movimientoPivot = 0;
let conceptoPivot = 0;
let movimientos = [];
let conceptos = [];
let idCounter = 1;
let fechaSeleccionada = new Date().toISOString().split("T")[0];

function actualizarIconoFecha() {
    const fechaActual = new Date().toISOString().split("T")[0];
    const iconoFecha = document.getElementById("fecha-icon");

    if (fechaSeleccionada !== fechaActual) {
        iconoFecha.style.color = "red";
    } else {
        iconoFecha.style.color = ""; // Restaurar color por defecto
    }
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
    actualizarIconoFecha();
    $("#fechaModal").modal("hide");
}

function resetearOpciones() {
    const hoy = new Date();
    const hoyString = hoy.toISOString().split("T")[0];
    document.getElementById("fecha-selector").value = hoyString;
    fechaSeleccionada = hoyString;
    const nroCuotas = document.getElementById("cuotas-selector");
    nroCuotas.value = 1;
    actualizarIconoFecha();
}

// Función para cambiar tarjeta
function cambiarTarjeta() {
    // Get active cards by filtering tarjetas based on `activo` flag
    tarjetaPivot = (tarjetaPivot + 1) % tarjetas.length;
    const tarjetaSeleccionada = tarjetas[tarjetaPivot];
    document.getElementById("btn-tarjeta").innerText =
        tarjetaSeleccionada.nombre;
    document.getElementById("btn-tarjeta").style.backgroundColor =
        tarjetaSeleccionada.color;

    const tipoTarjeta = document.getElementById('tipoTarjeta');
    console.log("T SELECC " + tarjetaSeleccionada.tipo);
    tipoTarjeta.textContent = tarjetaSeleccionada.tipo === 'credito' ? 'T. Crédito' : 'T. Débito';

    actualizarMovimientos(); // Update grid and balance when changing the card
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
    resetearOpciones();

}

function cambiarConcepto(){
    conceptoPivot = (conceptoPivot + 1) % conceptos.length;
    const conceptoSeleccionado = conceptos[conceptoPivot];
    document.getElementById("btn-concepto").innerText =
        conceptoSeleccionado.nombre;
    document.getElementById("btn-concepto").style.backgroundColor =
        conceptoSeleccionado.color;
}

// Función para agregar movimiento

function agregarMovimiento() {
    const monto = document.getElementById("monto-input").value;
    const cuotas = document.getElementById("cuotas-selector").value || 1; // Obtener el valor de cuotas, por defecto 1
    const montoPorCuota = parseFloat(monto / cuotas).toFixed(2); // Monto dividido entre cuotas (o total si es 1)
    const fechaSeleccionada = document.getElementById("fecha-selector").value || new Date().toISOString().split('T')[0]; // Si no hay fecha seleccionada, usar la fecha actual

    if (monto && monto > 0) { // Validar que el monto sea válido
        // Iterar por cada cuota y generar un movimiento para cada una
        for (let i = 0; i < cuotas; i++) {
            const fechaCuota = new Date(fechaSeleccionada); // Crear una nueva fecha basada en la fecha seleccionada o actual
            fechaCuota.setMonth(fechaCuota.getMonth() + i); // Aumentar la fecha en meses según la cuota

            const nuevoMovimiento = {
                movId: idCounter++, // Identificador único
                fecha: fechaCuota.toISOString().split('T')[0], // Formato de fecha en YYYY-MM-DD
                tipo: tipoMovimientoActivos[movimientoPivot].tipo, // Tipo de movimiento actual
                monto: montoPorCuota, // Monto dividido entre cuotas (o monto total si cuotas es 1)
                concepto: conceptos[conceptoPivot].conceptId, // Concepto seleccionado
                tarjeta: tarjetas[tarjetaPivot].cardId, // Tarjeta seleccionada
                detalle: cuotas > 1 ? `Cuota ${i + 1}/${cuotas}` : "Pago único", // Detalle dependiendo si hay cuotas
            };

            movimientos.push(nuevoMovimiento); // Agregar el nuevo movimiento
        }

        actualizarMovimientos(); // Actualizar los movimientos y el balance
        document.getElementById("monto-input").value = ""; // Limpiar el input de monto
        $("#fechaModal").modal("hide"); // Cerrar el modal de selección de fecha
    } else {
        alert("Por favor, ingrese un monto válido.");
    }
}




// Función para actualizar la tabla de movimientos
function actualizarMovimientos() {
    const tbody = document.getElementById("movimientos-tbody");
    tbody.innerHTML = "";
    document.getElementById("sin-movimientos").style.display = "none";

    const tarjetaSeleccionada = tarjetas[tarjetaPivot];
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

        dataJson.movimientos = movimientosOrdenados;

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

            const tdConcepto = document.createElement("td");
            tdConcepto.textContent = concepto ? concepto.nombre : tipoMovimiento.alias;

            const tdDetalle = document.createElement("td");
            tdDetalle.textContent = movimiento.detalle;

            const tdMonto = document.createElement("td");
            tdMonto.textContent = parseFloat(movimiento.monto).toFixed(2);
            tdMonto.className =
                movimiento.tipo === "ingreso"
                    ? "text-success"
                    : movimiento.tipo === "egreso"
                        ? "text-danger"
                        : "";

            tr.appendChild(tdFecha);
            tr.appendChild(tdConcepto);
            tr.appendChild(tdDetalle);
            tr.appendChild(tdMonto);

            // Agregar botón de eliminar

            const tdEliminar = document.createElement("td");
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


const calcularEstadoCuenta = (movimientosInput) => {
    // Crear un objeto para almacenar la información de cada mes
    const estadoCuenta = {};

    const tarjetaSeleccionada = tarjetas[tarjetaPivot];

    const diaCorte = tarjetaSeleccionada.factura;
    const diaPago = tarjetaSeleccionada.pago;

    const movimientos = movimientosInput.sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );

    // Iterar sobre los movimientos para llenar el estado de cuenta
    movimientos.forEach(m => {
        const fecha = new Date(m.fecha + 'T00:00:00'); // Añadir 'T00:00:00' para especificar la medianoche en UTC
        const dia = fecha.getDate();
        const mes = fecha.getMonth();
        const año = fecha.getFullYear();
        let mesAno = `${año}-${mes}`; // YYYY-MM 

        if (dia >= diaCorte) {
            mesAno = `${año}-${mes + 1}`; // YYYY-MM 
        }

        // Inicializar el mes en el objeto estadoCuenta
        if (!estadoCuenta[mesAno]) {
            estadoCuenta[mesAno] = { gastos: 0, abonos: 0, detallesGastos: [], saldoMesAnterior: 0 };
        }

        // Agregar los gastos y abonos a los totales y acumular detalles
        if (m.tipo === "egreso") {
            estadoCuenta[mesAno].gastos += parseFloat(m.monto);
            estadoCuenta[mesAno].detallesGastos.push(m);
        } else if (m.tipo === "ingreso") {
            estadoCuenta[mesAno].abonos += parseFloat(m.monto);
        }
    });

    // Mostrar los gastos y abonos por mes, además de los detalles de los gastos
    let saldoPendienteMesAnterior = 0; // Saldo acumulado de meses anteriores

    Object.keys(estadoCuenta).forEach(mesAno => {
        const mesInfo = estadoCuenta[mesAno];
        console.log(`Mes ${mesAno}:`);
        console.log(`  Gastos: ${mesInfo.gastos}`);
        console.log(`  Abonos: ${mesInfo.abonos}`);

        // Mostrar los detalles de los gastos que comprenden la deuda
        console.log('  Detalles de los gastos:');
        mesInfo.detallesGastos.forEach(gasto => {
            console.log(`    Fecha: ${gasto.fecha}, Monto: ${gasto.monto}`);
        });

        // Calcular el saldo pendiente para este mes, sumando el saldo pendiente del mes anterior
        const deudaMes = mesInfo.gastos - mesInfo.abonos + saldoPendienteMesAnterior;
        saldoPendienteMesAnterior = deudaMes > 0 ? deudaMes : 0;

        if (saldoPendienteMesAnterior > 0) {
            console.log(`  Saldo pendiente trasladado al siguiente mes: ${saldoPendienteMesAnterior}`);
        } else {
            console.log('  No hay saldo pendiente para este mes.');
        }

        // Almacenar el saldo pendiente para el siguiente mes
        mesInfo.saldoMesAnterior = saldoPendienteMesAnterior;

        const [año, mes] = mesAno.split('-').map(Number);
        const siguienteMes = mes === 12 ? 1 : mes + 1;
        const siguienteAno = siguienteMes === 1 ? año + 1 : año;
        const fechaCorte = new Date(`${siguienteAno}-${siguienteMes}-${diaCorte}`);
        const fechaPago = `${tarjetaSeleccionada.pago}/${siguienteMes + 1}`;
        fechaCorte.setUTCHours(0, 0, 0, 0); // Establece la hora a medianoche (00:00:00) en UTC

        const nuevaFactura = {
            fecha: `${fechaCorte.toISOString().split('T')[0]}`,
            tipo: "factura",
            monto: saldoPendienteMesAnterior, // Asignar el monto de parcial
            tarjeta: tarjetaSeleccionada.cardId, // Usar la tarjeta seleccionada
            detalle: "Vence " + fechaPago
        };

        if (tarjetaSeleccionada.tipo === "credito") {
            movimientos.push(nuevaFactura); // Agregar la nueva factura al array de nuevas facturas    
        }


    });

    // Mostrar la información de la factura del siguiente mes y el monto a pagar
    const mostrarFactura = (mesAno) => {
        const [año, mes] = mesAno.split('-').map(Number);
        const siguienteMes = mes === 12 ? 1 : mes + 1;
        const siguienteAno = siguienteMes === 1 ? año + 1 : año;

        const fechaCorte = new Date(`${siguienteAno}-${siguienteMes}-${diaCorte}`);
        const fechaPago = new Date(`${siguienteAno}-${siguienteMes}-${diaPago}`);

        console.log(`\nFactura del siguiente mes (${siguienteAno}-${siguienteMes}):`);
        console.log(`  Fecha de corte: ${fechaCorte.toISOString().split('T')[0]}`);
        console.log(`  Fecha de pago: ${fechaPago.toISOString().split('T')[0]}`);

        // Calcular el monto total a pagar (gastos - abonos + saldo pendiente)
        const totalGastos = Object.values(estadoCuenta).reduce((acc, curr) => acc + curr.gastos, 0);
        const totalAbonos = Object.values(estadoCuenta).reduce((acc, curr) => acc + curr.abonos, 0);
        const balance = totalAbonos - totalGastos; //+ saldoPendienteMesAnterior;

        console.log(`  Saldo pendiente acumulado: ${saldoPendienteMesAnterior}`);
        console.log(`  Monto a pagar: ${balance}`);


        tarjetaSeleccionada.balance = balance;

    };

    // Mostrar la factura para el último mes en el estado de cuenta
    const ultimoMesAno = Object.keys(estadoCuenta).pop();
    mostrarFactura(ultimoMesAno);
    console.log("JSON ORDER " + JSON.stringify(movimientos, null, 2));
    return movimientosOutput = movimientos.sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
};

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

function descargarBackup() {
    const datos = {
        tarjetas: tarjetas,
        conceptos: conceptos,
        movimientos: movimientos,
    };

    const json = JSON.stringify(datos, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json";
    a.click();
}

// Guarda información en el localStorage
function guardarEstado() {
    console.log("Guardando estado...")
    console.log("MOVIM EN DATAJSON " + JSON.stringify(dataJson, null, 2))
    const data = {
        //tarjetas: tarjetas,
        //conceptos: conceptos,
        movimientos: movimientos
    };
    localStorage.setItem('data', JSON.stringify(data));



}

// Carga la información del localStorage
function cargarEstado() {
    console.log("Recuperando estado...")

    estadoGuardado = localStorage.getItem('data');
    if (estadoGuardado) {
        estado = JSON.parse(estadoGuardado);
        //tarjetas = estado.tarjetas;
        //conceptos = estado.conceptos;
        movimientos = estado.movimientos;
        //dataJson = estado.dataJson;
        // Agrega aquí cualquier otra información que necesites restaurar
    }
}


// Agrega evento click al menú de lista
document
    .querySelector("#tarjetas-menu")
    .addEventListener("click", function () {
        $("#tarjetasModal").modal("show");
    });

// Función para renderizar la lista de tarjetas
function renderizarTarjetas() {
    const tarjetasLista = document.getElementById("tarjetas-lista");
    tarjetasLista.innerHTML = "";

    // Obtén la lista de tarjetas desde tu base de datos o API
    //const tarjetas = obtenerTarjetas();

    tarjetas.forEach((tarjeta) => {
        const desplegable = document.createElement("div");
        desplegable.classList.add("accordion");

        const titulo = document.createElement("div");
        titulo.classList.add("accordion-title");
        titulo.textContent = tarjeta.nombre;

        const contenido = document.createElement("div");
        contenido.classList.add("accordion-content");
        contenido.innerHTML = `
    <p>ID: ${tarjeta.id}</p>
    <p>Nombre: ${tarjeta.nombre}</p>
    <button class="btn btn-danger" onclick="eliminarTarjeta(${tarjeta.id})">Eliminar</button>
    <button class="btn btn-primary" onclick="modificarTarjeta(${tarjeta.id})">Modificar</button>
    `;

        desplegable.appendChild(titulo);
        desplegable.appendChild(contenido);

        tarjetasLista.appendChild(desplegable);
    });
}

// Función para agregar tarjeta
function agregarTarjeta() {
    const nombre = prompt("Ingrese el nombre de la tarjeta");
    const tarjeta = { nombre };

    // Agrega la tarjeta a tu base de datos o API
    agregarTarjetaAPI(tarjeta);

    renderizarTarjetas();
}

// Función para eliminar tarjeta
function eliminarTarjeta(id) {
    // Elimina la tarjeta de tu base de datos o API
    eliminarTarjetaAPI(id);

    renderizarTarjetas();
}

// Función para modificar tarjeta
function modificarTarjeta(id) {
    const nombre = prompt("Ingrese el nuevo nombre de la tarjeta");
    const tarjeta = { id, nombre };

    // Modifica la tarjeta en tu base de datos o API
    modificarTarjetaAPI(tarjeta);

    renderizarTarjetas();
}

// Agregar esto al final del script, justo antes de cerrar la etiqueta
document.addEventListener("DOMContentLoaded", function () {
    cargarEstado();

    resetearOpciones(); // Esto inicializará correctamente la fecha y actualizará el icono
    actualizarIconoFecha();
    cambiarMovimiento();
    cambiarTarjeta();

});
