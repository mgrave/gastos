const CLIENT_ID = ''; // Coloca tu Client ID 
const API_KEY = ''; // Coloca tu API Key 
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar.events'; // Añade los scopes que necesites

function initGoogleAuth2() {
    gapi.load('auth2', function() {
        // Inicializa el cliente OAuth
        gapi.auth2.init({
            client_id: CLIENT_ID,
        }).then(function() {
            console.log('Google Auth initialized.');
        }).catch(function(error) {
            console.error('Error initializing Google Auth:', error);
        });
    });
}


function initGoogleAuth() {
    console.log('Google Auth Inicializando auth google.');
    gapi.load('client:auth2', async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest", "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            scope: SCOPES,
        });
    });
}



function signIn() {
    console.log("Iniciando sesión...");
    var authInstance = gapi.auth2.getAuthInstance();
    if (authInstance) {
        console.log("Instancia de autenticación encontrada.");
        authInstance.signIn().then(function(user) {
            console.log('Usuario autenticado:', user.getBasicProfile().getName());
            updateUIForUser(user);
        }).catch(function(error) {
            if (error.error === 'popup_closed_by_user') {
                console.warn('La ventana emergente fue cerrada por el usuario.');
                alert('La ventana de inicio de sesión fue cerrada. Por favor, intenta nuevamente.');
            } else {
                console.error('Error al iniciar sesión:', error);
            }
        });
    } else {
        console.error('La instancia de autenticación no está inicializada.');
    }
}


function signOutO() {
    console.log("Cerrando sesión...");
    gapi.auth2.getAuthInstance().signOut().then(() => {
        console.log("Usuario desconectado");
        updateUIForSignOut();
    }).catch(function(error) {
        console.error('Error al cerrar sesión:', error);
    });
}

function updateUIForUser(user) {
    console.log("Actualizando UI para el usuario:", user.getBasicProfile().getName());
    const userName = user.getBasicProfile().getName();
    document.getElementById('user-name').innerText = userName;
    document.getElementById('signin-button').style.display = 'none';
    document.getElementById('signout-button').style.display = 'block';
}

function updateUIForSignOut() {
    console.log("Actualizando UI para el cierre de sesión.");
    document.getElementById('user-name').innerText = 'Cuenta';
    document.getElementById('signin-button').style.display = 'block';
    document.getElementById('signout-button').style.display = 'none';
}

function loadClient() {
    console.log("Cargando cliente de Google API...");
    gapi.client.load('drive', 'v3', () => {
        console.log("Google Drive API cargada");
    }).catch(function(error) {
        console.error('Error al cargar Google Drive API:', error);
    });

    gapi.client.load('calendar', 'v3', () => {
        console.log("Google Calendar API cargada");
    }).catch(function(error) {
        console.error('Error al cargar Google Calendar API:', error);
    });
}

function createFileInDrive() {
    console.log("Creando archivo en Google Drive...");
    var fileMetadata = {
        'name': 'sampleFile',
        'mimeType': 'application/vnd.google-apps.document'
    };
    var media = {
        mimeType: 'text/plain',
        body: 'Hello, world!'
    };
    
    gapi.client.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }).then(function(response) {
        console.log('Archivo creado. ID:', response.result.id);
    }).catch(function(error) {
        console.error('Error al crear archivo en Drive:', error);
    });
}

function createEventInCalendar() {
    console.log("Creando evento en Google Calendar...");
    var event = {
        'summary': 'Evento de Prueba',
        'location': 'Dirección de Ejemplo',
        'description': 'Descripción del evento',
        'start': {
            'dateTime': '2024-09-26T09:00:00-07:00',
            'timeZone': 'America/Los_Angeles'
        },
        'end': {
            'dateTime': '2024-09-26T17:00:00-07:00',
            'timeZone': 'America/Los_Angeles'
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10}
            ]
        }
    };

    gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
    }).then(function(response) {
        console.log('Evento creado:', response.result.htmlLink);
    }).catch(function(error) {
        console.error('Error al crear evento en Calendar:', error);
    });
}

function updateSigninStatus(isSignedIn) {
    console.log("Estado de inicio de sesión actualizado:", isSignedIn);
    if (isSignedIn) {
        console.log("Usuario autenticado");
        loadClient();
    } else {
        console.log("Usuario no autenticado");
        updateUIForSignOut(); // Actualiza la UI si el usuario no está autenticado
    }
}

function checkSigninStatus() {
    console.log("Verificando estado de inicio de sesión...");
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
}
