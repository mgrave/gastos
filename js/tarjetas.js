//TODO: agregar combo de tipo tarjeta, agregar control de colores, cambiar contreoles friendly movil
// Agrega evento click al menú de lista
document
  .querySelector("#tarjetas-menu")
  .addEventListener("click", function () {
    $("#tarjetasModal").modal("show");

    //tarjetas = dataJson.tarjetas;    //ORIG
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
    //dataJson.tarjetas = tarjetas; // Sincroniza el array principal ORIG
    lastOpenedCardId = nuevaTarjeta.cardId; // Abrir el acordeón de la nueva tarjeta
    isNewCard = true;
    renderTarjetas();
  });

  // Función para eliminar una tarjeta
  function eliminarTarjeta(cardId) {
    // Filtrar las tarjetas para eliminar la tarjeta con el cardId especificado
    tarjetas = tarjetas.filter(t => t.cardId !== cardId);
    //dataJson.tarjetas = tarjetas; //ORIG
    
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
	
	alert("Se eliminó la tarjeta con exito.");
    
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

    //dataJson.tarjetas = tarjetas; //ORIG
    guardarEstado();
    renderTarjetas();    
    alert("Se guardo la tarjeta " + nombre.value + " con exito.");
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

    // Construir las opciones del select de colores
    const colorOptions = colors.map(color => `
      <option value="${color.name}" style="background-color: white; color: ${color.hex};" ${tarjeta.color === color.name ? 'selected' : ''}>
        ${color.name}
      </option>
    `).join('');

    // Formatear el balance a dos decimales
    const balanceFormatted = parseFloat(tarjeta.balance).toFixed(2);

    const tarjetaHtml = `
      <div class="accordion" id="tarjetaAccordion-${cardId}">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center" id="heading-${cardId}"
			 style="background-color: ${tarjeta.color}; cursor: pointer;" 
			 data-bs-toggle="collapse" data-bs-target="#collapse-${cardId}" 
			 aria-expanded="${isExpanded}" aria-controls="collapse-${cardId}" data-bs-parent="#tarjetas-lista">
		  
		  <h5 class="mb-0 text-uppercase text-white" style="text-decoration: none;">
			<i class="${iconoTipoTarjeta}"></i> ${tarjeta.nombre || 'NOMBRE TARJETA'} ${nuevaTarjetaTexto}
		  </h5>

		  <!-- Mostrar el balance a la derecha con "S/." en lugar del guion -->
		  <div class="d-flex align-items-center">
			<span class="text-white me-2">S/. ${balanceFormatted}</span>
			<i class="fas fa-chevron-down text-white"></i>
		  </div>
		</div>

          <div id="collapse-${cardId}" class="collapse ${isExpanded ? 'show' : ''}" 
               aria-labelledby="heading-${cardId}" data-bs-parent="#tarjetas-lista">
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

                <!-- Desplegable de colores -->
                <div class="form-group">
                  <label for="color-${cardId}">Color</label>
                  <select class="form-control" id="color-${cardId}">
                    ${colorOptions}
                  </select>
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

                <div class="d-flex justify-content-between align-items-center  mt-2">
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

// Generate a Random Color from this list
/*const randomColor = ()=> {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}
const newColor = randomColor();
result = `${newColor.name} : ${newColor.hex}`;
console.log(result); // Beige : #F5F5DC

// Determine Hex Value of a known color
const getHex = (targetColor)=> {
  return colors
    .find(color => color.name.toLowerCase() === targetColor.toLowerCase())
    .hex;
}*/

const colors = [
  {hex: "#F0F8FF", name: "AliceBlue"},
  {hex: "#FAEBD7", name: "AntiqueWhite"},
  {hex: "#00FFFF", name: "Aqua"},
  {hex: "#7FFFD4", name: "Aquamarine"},
  {hex: "#F0FFFF", name: "Azure"},
  {hex: "#F5F5DC", name: "Beige"},
  {hex: "#FFE4C4", name: "Bisque"},
  {hex: "#000000", name: "Black"},
  {hex: "#FFEBCD", name: "BlanchedAlmond"},
  {hex: "#0000FF", name: "Blue"},
  {hex: "#8A2BE2", name: "BlueViolet"},
  {hex: "#A52A2A", name: "Brown"},
  {hex: "#DEB887", name: "BurlyWood"},
  {hex: "#5F9EA0", name: "CadetBlue"},
  {hex: "#7FFF00", name: "Chartreuse"},
  {hex: "#D2691E", name: "Chocolate"},
  {hex: "#FF7F50", name: "Coral"},
  {hex: "#6495ED", name: "CornflowerBlue"},
  {hex: "#FFF8DC", name: "Cornsilk"},
  {hex: "#DC143C", name: "Crimson"},
  {hex: "#00FFFF", name: "Cyan"},
  {hex: "#00008B", name: "DarkBlue"},
  {hex: "#008B8B", name: "DarkCyan"},
  {hex: "#B8860B", name: "DarkGoldenRod"},
  {hex: "#A9A9A9", name: "DarkGray"},
  {hex: "#A9A9A9", name: "DarkGrey"},
  {hex: "#006400", name: "DarkGreen"},
  {hex: "#BDB76B", name: "DarkKhaki"},
  {hex: "#8B008B", name: "DarkMagenta"},
  {hex: "#556B2F", name: "DarkOliveGreen"},
  {hex: "#FF8C00", name: "DarkOrange"},
  {hex: "#9932CC", name: "DarkOrchid"},
  {hex: "#8B0000", name: "DarkRed"},
  {hex: "#E9967A", name: "DarkSalmon"},
  {hex: "#8FBC8F", name: "DarkSeaGreen"},
  {hex: "#483D8B", name: "DarkSlateBlue"},
  {hex: "#2F4F4F", name: "DarkSlateGray"},
  {hex: "#2F4F4F", name: "DarkSlateGrey"},
  {hex: "#00CED1", name: "DarkTurquoise"},
  {hex: "#9400D3", name: "DarkViolet"},
  {hex: "#FF1493", name: "DeepPink"},
  {hex: "#00BFFF", name: "DeepSkyBlue"},
  {hex: "#696969", name: "DimGray"},
  {hex: "#696969", name: "DimGrey"},
  {hex: "#1E90FF", name: "DodgerBlue"},
  {hex: "#B22222", name: "FireBrick"},
  {hex: "#FFFAF0", name: "FloralWhite"},
  {hex: "#228B22", name: "ForestGreen"},
  {hex: "#FF00FF", name: "Fuchsia"},
  {hex: "#DCDCDC", name: "Gainsboro"},
  {hex: "#F8F8FF", name: "GhostWhite"},
  {hex: "#FFD700", name: "Gold"},
  {hex: "#DAA520", name: "GoldenRod"},
  {hex: "#808080", name: "Gray"},
  {hex: "#808080", name: "Grey"},
  {hex: "#008000", name: "Green"},
  {hex: "#ADFF2F", name: "GreenYellow"},
  {hex: "#F0FFF0", name: "HoneyDew"},
  {hex: "#FF69B4", name: "HotPink"},
  {hex: "#CD5C5C", name: "IndianRed"},
  {hex: "#4B0082", name: "Indigo"},
  {hex: "#FFFFF0", name: "Ivory"},
  {hex: "#F0E68C", name: "Khaki"},
  {hex: "#E6E6FA", name: "Lavender"},
  {hex: "#FFF0F5", name: "LavenderBlush"},
  {hex: "#7CFC00", name: "LawnGreen"},
  {hex: "#FFFACD", name: "LemonChiffon"},
  {hex: "#ADD8E6", name: "LightBlue"},
  {hex: "#F08080", name: "LightCoral"},
  {hex: "#E0FFFF", name: "LightCyan"},
  {hex: "#FAFAD2", name: "LightGoldenRodYellow"},
  {hex: "#D3D3D3", name: "LightGray"},
  {hex: "#D3D3D3", name: "LightGrey"},
  {hex: "#90EE90", name: "LightGreen"},
  {hex: "#FFB6C1", name: "LightPink"},
  {hex: "#FFA07A", name: "LightSalmon"},
  {hex: "#20B2AA", name: "LightSeaGreen"},
  {hex: "#87CEFA", name: "LightSkyBlue"},
  {hex: "#778899", name: "LightSlateGray"},
  {hex: "#778899", name: "LightSlateGrey"},
  {hex: "#B0C4DE", name: "LightSteelBlue"},
  {hex: "#FFFFE0", name: "LightYellow"},
  {hex: "#00FF00", name: "Lime"},
  {hex: "#32CD32", name: "LimeGreen"},
  {hex: "#FAF0E6", name: "Linen"},
  {hex: "#FF00FF", name: "Magenta"},
  {hex: "#800000", name: "Maroon"},
  {hex: "#66CDAA", name: "MediumAquaMarine"},
  {hex: "#0000CD", name: "MediumBlue"},
  {hex: "#BA55D3", name: "MediumOrchid"},
  {hex: "#9370DB", name: "MediumPurple"},
  {hex: "#3CB371", name: "MediumSeaGreen"},
  {hex: "#7B68EE", name: "MediumSlateBlue"},
  {hex: "#00FA9A", name: "MediumSpringGreen"},
  {hex: "#48D1CC", name: "MediumTurquoise"},
  {hex: "#C71585", name: "MediumVioletRed"},
  {hex: "#191970", name: "MidnightBlue"},
  {hex: "#F5FFFA", name: "MintCream"},
  {hex: "#FFE4E1", name: "MistyRose"},
  {hex: "#FFE4B5", name: "Moccasin"},
  {hex: "#FFDEAD", name: "NavajoWhite"},
  {hex: "#000080", name: "Navy"},
  {hex: "#FDF5E6", name: "OldLace"},
  {hex: "#808000", name: "Olive"},
  {hex: "#6B8E23", name: "OliveDrab"},
  {hex: "#FFA500", name: "Orange"},
  {hex: "#FF4500", name: "OrangeRed"},
  {hex: "#DA70D6", name: "Orchid"},
  {hex: "#EEE8AA", name: "PaleGoldenRod"},
  {hex: "#98FB98", name: "PaleGreen"},
  {hex: "#AFEEEE", name: "PaleTurquoise"},
  {hex: "#DB7093", name: "PaleVioletRed"},
  {hex: "#FFEFD5", name: "PapayaWhip"},
  {hex: "#FFDAB9", name: "PeachPuff"},
  {hex: "#CD853F", name: "Peru"},
  {hex: "#FFC0CB", name: "Pink"},
  {hex: "#DDA0DD", name: "Plum"},
  {hex: "#B0E0E6", name: "PowderBlue"},
  {hex: "#800080", name: "Purple"},
  {hex: "#663399", name: "RebeccaPurple"},
  {hex: "#FF0000", name: "Red"},
  {hex: "#BC8F8F", name: "RosyBrown"},
  {hex: "#4169E1", name: "RoyalBlue"},
  {hex: "#8B4513", name: "SaddleBrown"},
  {hex: "#FA8072", name: "Salmon"},
  {hex: "#F4A460", name: "SandyBrown"},
  {hex: "#2E8B57", name: "SeaGreen"},
  {hex: "#FFF5EE", name: "SeaShell"},
  {hex: "#A0522D", name: "Sienna"},
  {hex: "#C0C0C0", name: "Silver"},
  {hex: "#87CEEB", name: "SkyBlue"},
  {hex: "#6A5ACD", name: "SlateBlue"},
  {hex: "#708090", name: "SlateGray"},
  {hex: "#708090", name: "SlateGrey"},
  {hex: "#FFFAFA", name: "Snow"},
  {hex: "#00FF7F", name: "SpringGreen"},
  {hex: "#4682B4", name: "SteelBlue"},
  {hex: "#D2B48C", name: "Tan"},
  {hex: "#008080", name: "Teal"},
  {hex: "#D8BFD8", name: "Thistle"},
  {hex: "#FF6347", name: "Tomato"},
  {hex: "#40E0D0", name: "Turquoise"},
  {hex: "#EE82EE", name: "Violet"},
  {hex: "#F5DEB3", name: "Wheat"},
  {hex: "#FFFFFF", name: "White"},
  {hex: "#F5F5F5", name: "WhiteSmoke"},
  {hex: "#FFFF00", name: "Yellow"},
  {hex: "#9ACD32", name: "YellowGreen"}
];