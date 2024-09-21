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
      tipo: 'debito', // Valor por defecto
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

  // Función para eliminar una tarjeta
  function eliminarTarjeta(cardId) {
    // Filtrar las tarjetas para eliminar la tarjeta con el cardId especificado
    tarjetas = tarjetas.filter(t => t.cardId !== cardId);
    dataJson.tarjetas = tarjetas;
    
    // Filtrar los movimientos asociados a la tarjeta con el cardId especificado
    let movimientosCardId = movimientos.filter(movimiento => parseInt(movimiento.tarjeta) === parseInt(cardId));  
  
    // Si hay movimientos asociados a la tarjeta, pedir confirmación al usuario
    if (movimientosCardId.length > 0) {
      let confirmacion = confirm("Existen movimientos asociados a esta tarjeta. ¿Deseas continuar con la eliminación?");
      
      if (!confirmacion) {
        // Si el usuario cancela, no realizar ninguna acción y salir de la función
        return;
      }
    }
  
    // Filtrar los movimientos para eliminar los asociados a la tarjeta con el cardId especificado
    let movimientosFiltrados = movimientos.filter(movimiento => parseInt(movimiento.tarjeta) !== parseInt(cardId));
    movimientos = movimientosFiltrados;
  
    // Verificar si la tarjeta eliminada es la que estaba abierta
    if (lastOpenedCardId === cardId) {
      lastOpenedCardId = null; // Resetea el acordeón abierto
    }
  
    // Guardar el estado actualizado
    guardarEstado();
  
    // Volver a renderizar las tarjetas
    renderTarjetas();

    //tarjetaPivot = tarjetas[1].cardId
    cambiarTarjeta();

    
  }
  
  

// Función para guardar la información de la tarjeta
function guardarTarjeta(cardId) {
  const tarjeta = tarjetas.find(t => t.cardId === cardId);
  if (tarjeta) {
    // Obtener los valores del formulario
    nombre = document.getElementById(`nombre-${cardId}`);
    tarjeta.tipo = document.getElementById(`tipo-${cardId}`).value || 'credito';
    tarjeta.color = document.getElementById(`color-${cardId}`).value || 'black';
    tarjeta.balance = parseFloat(document.getElementById(`balance-${cardId}`).value) || 0; // Evitar NaN
    tarjeta.activo = document.getElementById(`activo-${cardId}`).checked; // Guardar estado de activo/inactivo
    tarjeta.nueva = false; // Si es nueva, ahora es tarjeta guardada
    isNewCard = false;
    
    if(nombre.value === ""){
      nombre.classList.add('is-invalid');
      return;
    }else{
      tarjeta.nombre = nombre.value.toUpperCase();;
      nombre.classList.remove('is-invalid');
    }

    // Variables para los campos de facturación y pago
    const facturaInput = document.getElementById(`factura-${cardId}`);
    const pagoInput = document.getElementById(`pago-${cardId}`);
    let hasError = false;

    // Validación de fechas obligatorias si el tipo es crédito
    if (tarjeta.tipo === 'credito') {
      tarjeta.factura = parseInt(facturaInput.value) || 0;
      tarjeta.pago = parseInt(pagoInput.value) || 0;

      // Resalta los campos si no están llenos
      if (tarjeta.factura === 0) {
        facturaInput.classList.add('is-invalid');
        hasError = true;
      } else {
        facturaInput.classList.remove('is-invalid');
      }

      if (tarjeta.pago === 0) {
        pagoInput.classList.add('is-invalid');
        hasError = true;
      } else {
        pagoInput.classList.remove('is-invalid');
      }

      if (hasError) {
        alert("Para tarjetas de crédito, las fechas de facturación y pago son obligatorias.");
        return; // Detener la ejecución si no se han ingresado las fechas obligatorias
      }
    } else {
      tarjeta.factura = 0;
      tarjeta.pago = 0;
      facturaInput.classList.remove('is-invalid');
      pagoInput.classList.remove('is-invalid');
    }

    console.log("Tarjeta  pivot: "+ tarjetaPivot);
    
    dataJson.tarjetas = tarjetas;
    guardarEstado();
    renderTarjetas();    
    
  }
}

// Renderizar las tarjetas en el acordeón
function renderTarjetas() {
  const tarjetasLista = document.getElementById('tarjetas-lista');
  tarjetasLista.innerHTML = '';

  tarjetas.forEach((tarjeta, index) => {
    const cardId = tarjeta.cardId;
    const isExpanded = cardId === lastOpenedCardId; // Solo el acordeón abierto estará expandido
    const nuevaTarjetaTexto = tarjeta.nueva ? ' (Nueva Tarjeta)' : '';
    const iconoTipoTarjeta = tarjeta.tipo === 'debito' ? 'fas fa-piggy-bank' : 'fas fa-credit-card';
    
    const tarjetaHtml = `
        <div class="accordion" id="tarjetaAccordion-${cardId}">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center" id="heading-${cardId}">
              <h5 class="mb-0 text-uppercase" style="cursor: pointer; text-decoration: none;" onclick="toggleAccordion(${cardId})">
                <i class="${iconoTipoTarjeta}"></i> ${tarjeta.nombre || 'NOMBRE TARJETA'} ${nuevaTarjetaTexto} - ${tarjeta.balance}
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
                    <div class="invalid-feedback">El nombre es obligatorio.</div>
                  </div>
                  <div class="form-group">
                    <label for="tipo-${cardId}">Tipo de Tarjeta</label>
                    <select class="form-control" id="tipo-${cardId}" onchange="toggleFechas(${cardId})">
                      <option value="credito" ${tarjeta.tipo === 'credito' ? 'selected' : ''}>Crédito</option>
                      <option value="debito" ${tarjeta.tipo === 'debito' ? 'selected' : ''}>Débito</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="color-${cardId}">Color</label>
                    <input type="text" class="form-control" id="color-${cardId}" value="${tarjeta.color || ''}">
                  </div>

                  <!-- Mostrar fechas solo si es crédito -->
                  <div class="form-group" id="fechas-${cardId}" style="display: ${tarjeta.tipo === 'credito' ? 'block' : 'none'};">
                    <div class="form-group">
                      <label for="factura-${cardId}">Fecha de Facturación (Día)</label>
                      <input type="number" class="form-control" id="factura-${cardId}" value="${tarjeta.factura || ''}" min="1" max="31">
                      <div class="invalid-feedback">La fecha de facturación es obligatoria.</div>
                    </div>
                    <div class="form-group">
                      <label for="pago-${cardId}">Fecha de Pago (Día)</label>
                      <input type="number" class="form-control" id="pago-${cardId}" value="${tarjeta.pago || ''}" min="1" max="31">
                      <div class="invalid-feedback">La fecha de pago es obligatoria.</div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="balance-${cardId}">Balance</label>
                    <input type="number" class="form-control" id="balance-${cardId}" value="${tarjeta.balance}">
                  </div>

                  <div class="d-flex justify-content-between align-items-center">
                    <!-- Switch para activar/desactivar tarjeta -->
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="activo-${cardId}" ${tarjeta.activo ? 'checked' : ''}>
                      <label class="form-check-label" for="activo-${cardId}">Activada</label>
                    </div>

                    <!-- Botones -->
                    <div>
                      <button type="button" class="btn btn-danger" onclick="eliminarTarjeta(${cardId})">Eliminar</button>
                      <button type="button" class="btn btn-primary" onclick="guardarTarjeta(${cardId})">Guardar</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>`;
    
    tarjetasLista.insertAdjacentHTML('beforeend', tarjetaHtml);
  });
}

// Función para mostrar u ocultar las fechas según el tipo de tarjeta
function toggleFechas(cardId) {
  const tipoTarjeta = document.getElementById(`tipo-${cardId}`).value;
  const fechasDiv = document.getElementById(`fechas-${cardId}`);
  fechasDiv.style.display = tipoTarjeta === 'credito' ? 'block' : 'none';
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
