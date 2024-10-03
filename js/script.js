//TODO
//en fechas no se debe exceder el 31
//confirmar antes de guardarar/eliminmar  
//eliminacion logica 
//banner en nombres largos en el titulo

var dataJson = {
  "tarjetas": [
    /*{ "cardId": 1, "nombre": "Visa", "tipo": "credito", "color": "black", "factura": 12, "pago": 10, "control": 0, "parcial": 0, "balance": 2500, "activo": true },
    { "cardId": 2, "nombre": "Amex", "tipo": "credito", "color": "salmon", "factura": 16, "pago": 30, "control": 0, "parcial": 0, "balance": 2500, "activo": true },
    { "cardId": 3, "nombre": "Master", "tipo": "credito", "color": "blue", "factura": 16, "pago": 30, "control": 700, "parcial": 500, "balance": 2500, "activo": true },
    { "cardId": 4, "nombre": "BCP", "tipo": "debito", "color": "hotpink", "factura": 16, "pago": 10, "control": 0, "parcial": 0, "balance": 2500, "activo": true },
    { "cardId": 5, "nombre": "Prestamo", "tipo": "debito", "color": "blue", "factura": 16, "pago": 10, "control": 0, "parcial": 0, "balance": 2500, "activo": true },*/
    { "cardId": 6, "nombre": "Demo", "tipo": "debito", "color": "black", "factura": 16, "pago": 10, "control": 0, "parcial": 0, "balance": 0, "activo": true }
  ],
  "conceptos": [
    { "conceptId": 1, "nombre": "Pago", "tipo_movimiento": "ingreso", "color": "green", "activo": true },
    { "conceptId": 2, "nombre": "Sueldo", "tipo_movimiento": "ingreso", "color": "green", "activo": true },
    { "conceptId": 3, "nombre": "Basico", "tipo_movimiento": "egreso", "color": "blue", "activo": true },
    { "conceptId": 4, "nombre": "Gusto", "tipo_movimiento": "egreso", "color": "red", "activo": true },
    { "conceptId": 5, "nombre": "Ahorro", "tipo_movimiento": "egreso", "color": "gray", "activo": true }
  ],
  "presupuestos" : [
    {
      "movId": 0, "tarjeta": "6", "monto": "200.00", "detalle": "LUZ", "dia": "9", "autopago": false, "tipo": "egreso", "concepto": 4, "pptoId": 1, "activo": true
    }
  ]
}

//el color es para los botones y el class para las filas
const dataConf = {
  "tipoMovimiento": [
    { "tipo": "ingreso", "color": "green", "class": "ingreso", "alias": "Ingreso", "activo": true },
    { "tipo": "egreso", "color": "red", "class": "egreso", "alias": "Egreso", "activo": true },
    { "tipo": "factura", "class": "factura", "alias": "Factura", "activo": false },
    { "tipo": "pago", "class": "pago", "alias": "Fecha de pago", "activo": false }
  ]
};
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./service-worker.js').then(function(registration) {
      console.log('Service Worker registrado con éxito:', registration);
    }, function(err) {
      console.log('Error al registrar el Service Worker:', err);
    });
  });
}
*/

let tarjetaPivot = 0;
let movimientoPivot = 0;
let conceptoPivot = 0;
let presupuestos = [];
let movimientos = [];
let conceptos = [];
let tarjetas = [];
let idCounter = 1;

if(tarjetas.length == 0){
  tarjetas = dataJson.tarjetas;
}

if(conceptos.length == 0){
  conceptos = dataJson.conceptos;
}

if(presupuestos.length == 0){
  presupuestos = dataJson.presupuestos;
}

let tipoMovimientoActivos = dataConf.tipoMovimiento.filter(
  (tipoMov) => tipoMov.activo
);

//let conceptosActivos = dataJson.conceptos.filter( //ORIG
let conceptosActivos = conceptos.filter( 
  (conceptos) => conceptos.activo
);

const fechaLocal = new Date(); // Aplicar la zona horaria UTC-5 (Lima, Perú)
const utcOffset = -5 * 60; // Diferencia horaria en minutos (-5 horas)
const fechaLocalOffset = new Date(fechaLocal.getTime() + (fechaLocal.getTimezoneOffset() * 60000) + (utcOffset * 60000));
const año = fechaLocalOffset.getFullYear();
const mes = String(fechaLocalOffset.getMonth() + 1).padStart(2, '0');
const dia = String(fechaLocalOffset.getDate()).padStart(2, '0');
let fechaSeleccionada = `${año}-${mes}-${dia}`;
console.log("fecha actual "+fechaSeleccionada);


document.querySelectorAll('.navbar-nav .nav-item').forEach(function (item) {
  item.addEventListener('click', function () {
    // Ocultar el menú al hacer clic en un ítem
    const navbarCollapse = document.getElementById('navbarOptions');
    if (navbarCollapse.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
  });
});


const calcularEstadoCuenta = (movimientosInput) => {
  // Crear un objeto para almacenar la información de cada mes
  const estadoCuenta = {};
  //const tarjetas = dataJson.tarjetas; //ORIG
  const tarjetasActivas = tarjetas.filter(tarjeta => tarjeta.activo);
  //const tarjetaSeleccionada = tarjetasActivas[tarjetaPivot];
  const tarjetaSeleccionada = tarjetasActivas.find(tarjeta => tarjeta.cardId === tarjetaPivot);


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
    const fechaPago = `${tarjetaSeleccionada.pago}/${siguienteMes === 12 ? 1 : siguienteMes + 1}`;
    fechaCorte.setUTCHours(0, 0, 0, 0); // Establece la hora a medianoche (00:00:00) en UTC

    if (tarjetaSeleccionada.tipo === "credito") {
      const nuevaFactura = {
        movId: idCounter++, // Incrementar el identificador único para la transferencia
        fecha: `${fechaCorte.toISOString().split('T')[0]}`,
        tipo: "factura",
        monto: saldoPendienteMesAnterior, // Asignar el monto de parcial
        tarjeta: tarjetaSeleccionada.cardId, // Usar la tarjeta seleccionada
        detalle: "Vence " + fechaPago
      };

      movimientos.push(nuevaFactura); // Agregar la nueva factura al array de nuevas facturas    
    }

  });

  // Mostrar la información de la factura del siguiente mes y el monto a pagar
  const mostrarFactura = (mesAno) => {
    if (tarjetaSeleccionada.tipo === "credito") {
      const [año, mes] = mesAno.split('-').map(Number);
      const siguienteMes = mes === 12 ? 1 : mes + 1;
      const siguienteAno = siguienteMes === 1 ? año + 1 : año;

      const fechaCorte = new Date(`${siguienteAno}-${siguienteMes}-${diaCorte}`);
      const fechaPago = new Date(`${siguienteAno}-${siguienteMes}-${diaPago}`);

      console.log(`\nFactura del siguiente mes (${siguienteAno}-${siguienteMes}):`);
      console.log(`  Fecha de corte: ${fechaCorte.toISOString().split('T')[0]}`);
      console.log(`  Fecha de pago: ${fechaPago.toISOString().split('T')[0]}`);
      console.log(`  Saldo pendiente acumulado: ${saldoPendienteMesAnterior}`);
    }

    // Calcular el monto total a pagar (gastos - abonos + saldo pendiente)
    const totalGastos = Object.values(estadoCuenta).reduce((acc, curr) => acc + curr.gastos, 0);
    const totalAbonos = Object.values(estadoCuenta).reduce((acc, curr) => acc + curr.abonos, 0);
    const balance = totalAbonos - totalGastos; //+ saldoPendienteMesAnterior;

    console.log(`  Monto a pagar: ${balance}`);

    tarjetaSeleccionada.balance = balance;

  };

  // Mostrar la factura para el último mes en el estado de cuenta
  const ultimoMesAno = Object.keys(estadoCuenta).pop();
  mostrarFactura(ultimoMesAno);

  return movimientosOutput = movimientos.sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );
};

// Guarda información en el localStorage
function guardarEstado() {
  console.log("Guardando estado... " + JSON.stringify(presupuestos, null, 2))
  const data = {
    tarjetas: tarjetas, //tarjetas: dataJson.tarjetas, //ORIG
    conceptos: conceptos, //conceptos: dataJson.conceptos, //ORIG
    movimientos: movimientos,
    presupuestos: presupuestos
  };
  localStorage.setItem('data', JSON.stringify(data));
}

// Carga la información del localStorage
function cargarEstado() {
  const estadoGuardado = localStorage.getItem('data');
  //console.log("Recuperando estado..." + JSON.stringify(estadoGuardado, null, 2));
  if (estadoGuardado) {
    const estado = JSON.parse(estadoGuardado);
    // Asignar los datos recuperados de manera correcta
    tarjetas = estado.tarjetas || [];//dataJson.tarjetas = estado.tarjetas || []; //ORIG
    conceptos = estado.conceptos || [];//dataJson.conceptos = estado.conceptos || []; //ORIG
    movimientos = estado.movimientos || [];
    presupuestos = estado.presupuestos || [];
  }
}

document
  .querySelector("#descargar_backup")
  .addEventListener("click", function () {
    console.log("Descargar backup... " + JSON.stringify(dataJson, null, 2))
    const datos = {
      tarjetas: tarjetas, //tarjetas: dataJson.tarjetas, //ORIG
      conceptos: conceptos, //conceptos: dataJson.conceptos, //ORIG
      movimientos: movimientos,
      presupuestos: presupuestos
    };

    const json = JSON.stringify(datos, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json";
    a.click();
  });


// Iniciar el proceso de selección del archivo
document.querySelector("#cargar_backup").addEventListener("click", function () {
  // Simula el clic en el input de archivo
  const backupFileInput = document.getElementById('backup-file-input');
  backupFileInput.click();
});

// Manejar el cambio en el input de archivo
document.getElementById('backup-file-input').addEventListener('change', function () {
  const file = this.files[0];

  if (file) {
    // Mostrar el mensaje de confirmación solo después de que se ha seleccionado el archivo
    const confirmarReemplazo = confirm("¿Estás seguro de que deseas reemplazar la información actual con los datos del archivo? Esta acción no se puede deshacer.");

    if (!confirmarReemplazo) {
      console.log("El usuario canceló la carga del archivo.");
      return; // Salir si el usuario cancela la operación
    }

    // Mostrar el spinner de procesamiento
    const processingIndicator = document.getElementById('processing-indicator');
    processingIndicator.classList.remove('d-none');

    const reader = new FileReader();

    // Manejar el evento onload cuando se termine de leer el archivo
    reader.onload = function (event) {
      const fileContent = event.target.result;

      // Si el archivo es un JSON, parsearlo y asignarlo a las variables correspondientes
      try {
        const data = JSON.parse(fileContent); // Parsear el contenido del archivo JSON
        console.log('Contenido del archivo cargado:', data);

        // Asignar los datos a las variables correspondientes
        tarjetas = data.tarjetas || [];
        conceptos = data.conceptos || [];
        movimientos = data.movimientos || [];
        presupuestos = data.presupuestos || [];
        // Otros datos que se deseen cargar del archivo pueden ser añadidos aquí

        console.log('Datos cargados:', JSON.stringify({ tarjetas, movimientos }, null, 2));

        // Guardar el estado actualizado en el localStorage o donde se necesite
        guardarEstado();
      } catch (e) {
        console.error('Error al analizar el archivo JSON:', e);
        alert('El archivo proporcionado no es un JSON válido. Por favor, verifica el archivo.');
      } finally {
        // Ocultar el spinner de procesamiento
        processingIndicator.classList.add('d-none');
      }
    };

    // Manejar errores al leer el archivo
    reader.onerror = function () {
      console.error('Error al leer el archivo');
      alert('Ocurrió un error al leer el archivo. Por favor, inténtalo de nuevo.');
      // Ocultar el spinner en caso de error
      processingIndicator.classList.add('d-none');
    };

    // Iniciar la lectura del archivo como texto
    reader.readAsText(file);
  }
});

  
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  updateUIForUser(profile);
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  
}





function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    updateUIForSignOut()
    console.log('User signed out.');
  });
}


// Agregar esto al final del script, justo antes de cerrar la etiqueta
document.addEventListener("DOMContentLoaded", function () {  
  cargarEstado();
  cancelarOpciones();
  cambiarMovimiento();
  cambiarTarjeta();
  ejecutarAutopago();
  guardarEstado(); // Guardar el estado después de inicializar la página
});



