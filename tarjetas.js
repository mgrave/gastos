//TODO: agregar combo de tipo tarjeta, agregar control de colores, cambiar contreoles friendly movil
// Agrega evento click al menú de lista
document
  .querySelector("#tarjetas-menu")
  .addEventListener("click", function () {
    $("#tarjetasModal").modal("show");
    tarjetas = dataJson.tarjetas;
    //console.log("Listando tarjetas... " + JSON.stringify(dataJson.tarjetas, null, 2));
    renderTarjetas(); // Renderizar las tarjetas al cargar el DOM
  });

// Contador de ID para nuevas tarjetas

let lastOpenedCardId = null; // Para controlar cuál acordeón está abierto
let isNewCard = false; // Para identificar si una tarjeta es nueva

// Función para agregar una nueva tarjeta
document
  .getElementById('agregar-tarjeta-btn')
  .addEventListener('click', () => {
	let idCounterTarjetas = Math.max(...tarjetas.map(t => t.cardId)) + 1 || 1;
	let seqCard = idCounterTarjetas++;
	console.log("Nueva tarjeta numero : "+seqCard);
    const nuevaTarjeta = {
      cardId: seqCard,
      nombre: '',
      tipo: 'credito', // Valor por defecto
      color: '',
      factura: 0,
      pago: 0,
      control: 0,
      parcial: 0,
      balance: 0,
      activo: true,
      nueva: true // Marca de que es una tarjeta nueva
    };
    tarjetas.unshift(nuevaTarjeta); // Agregar la nueva tarjeta al inicio del array
    dataJson.tarjetas = tarjetas; // Sincroniza el array principal
    lastOpenedCardId = nuevaTarjeta.cardId; // Abrir el acordeón de la nueva tarjeta
    isNewCard = true;
    renderTarjetas();
  });

// Función para guardar la información de la tarjeta
function guardarTarjeta(cardId) {
  const tarjeta = tarjetas.find(t => t.cardId === cardId);
  if (tarjeta) {
    tarjeta.nombre = document.getElementById(`nombre-${cardId}`).value || 'NOMBRE TARJETA';
    tarjeta.tipo = document.getElementById(`tipo-${cardId}`).value || 'credito';
    tarjeta.color = document.getElementById(`color-${cardId}`).value || 'COLOR';
    tarjeta.factura = parseInt(document.getElementById(`factura-${cardId}`).value) || 0;
    tarjeta.pago = parseInt(document.getElementById(`pago-${cardId}`).value) || 0;
    tarjeta.balance = parseFloat(document.getElementById(`balance-${cardId}`).value) || 0; // Evitar NaN
    tarjeta.activo = document.getElementById(`activo-${cardId}`).checked; // Guardar estado de activo/inactivo
    tarjeta.nueva = false; // Si es nueva, ahora es tarjeta guardada
    isNewCard = false;

    // Sincronizar con el JSON principal
    dataJson.tarjetas = tarjetas;
    guardarEstado();
    renderTarjetas();
  }
}

// Función para eliminar una tarjeta
function eliminarTarjeta(cardId) {
  tarjetas = tarjetas.filter(t => t.cardId !== cardId);
  dataJson.tarjetas = tarjetas;
  if (lastOpenedCardId === cardId) {
    lastOpenedCardId = null; // Resetea el acordeón abierto
  }
  guardarEstado();
  renderTarjetas();
}

// Función para renderizar las tarjetas en el acordeón
function renderTarjetas() {
  const tarjetasLista = document.getElementById('tarjetas-lista');
  tarjetasLista.innerHTML = '';

  tarjetas.forEach((tarjeta, index) => {
    const cardId = tarjeta.cardId;
    const isExpanded = cardId === lastOpenedCardId; // Solo el acordeón abierto estará expandido
    const nuevaTarjetaTexto = tarjeta.nueva ? ' (Nueva Tarjeta)' : '';
    const tarjetaHtml = `
        <div class="accordion" id="tarjetaAccordion-${cardId}">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center" id="heading-${cardId}">
              <h5 class="mb-0 text-uppercase" style="cursor: pointer; text-decoration: none;" onclick="toggleAccordion(${cardId})">
                ${tarjeta.nombre || 'NOMBRE TARJETA'} ${nuevaTarjetaTexto} (${tarjeta.tipo}) - ${tarjeta.color || 'COLOR'}
              </h5>
              <button class="btn btn-link p-0" type="button" data-toggle="collapse" data-target="#collapse-${cardId}" aria-expanded="${isExpanded}" aria-controls="collapse-${cardId}">
                <i class="fas fa-chevron-down"></i>
              </button>
            </div>
            <div id="collapse-${cardId}" class="collapse ${isExpanded ? 'show' : ''}" aria-labelledby="heading-${cardId}" data-parent="#tarjetas-lista">
              <div class="card-body">
                <form id="tarjetaForm-${cardId}">
                  <div class="form-group">
                    <label for="nombre-${cardId}">Nombre</label>
                    <input type="text" class="form-control" id="nombre-${cardId}" value="${tarjeta.nombre || ''}">
                  </div>
                  <div class="form-group">
                    <label for="tipo-${cardId}">Tipo</label>
                    <input type="text" class="form-control" id="tipo-${cardId}" value="${tarjeta.tipo}">
                  </div>
                  <div class="form-group">
                    <label for="color-${cardId}">Color</label>
                    <input type="text" class="form-control" id="color-${cardId}" value="${tarjeta.color || ''}">
                  </div>
                  <div class="form-group">
                    <label for="factura-${cardId}">Factura</label>
                    <input type="number" class="form-control" id="factura-${cardId}" value="${tarjeta.factura}">
                  </div>
                  <div class="form-group">
                    <label for="pago-${cardId}">Pago</label>
                    <input type="number" class="form-control" id="pago-${cardId}" value="${tarjeta.pago}">
                  </div>
                  <div class="form-group">
                    <label for="balance-${cardId}">Balance</label>
                    <input type="number" class="form-control" id="balance-${cardId}" value="${tarjeta.balance}">
                  </div>
                  <div class="form-group form-check">
                    <input type="checkbox" class="form-check-input" id="activo-${cardId}" ${tarjeta.activo ? 'checked' : ''}>
                    <label class="form-check-label" for="activo-${cardId}">Activada</label>
                  </div>
                  <button type="button" class="btn btn-primary" onclick="guardarTarjeta(${cardId})">Guardar</button>
                  <button type="button" class="btn btn-danger" onclick="eliminarTarjeta(${cardId})">Eliminar</button>                  
                </form>
              </div>
            </div>
          </div>
        </div>`;
    tarjetasLista.insertAdjacentHTML('beforeend', tarjetaHtml);
  });
}

// Función para abrir/cerrar acordeones
function toggleAccordion(cardId) {
  const collapseElement = document.getElementById(`collapse-${cardId}`);
  if (collapseElement) {
    const isExpanded = collapseElement.classList.contains('show');
    if (isExpanded) {
      collapseElement.classList.remove('show');
    } else {
      collapseElement.classList.add('show');
    }
  }
}
