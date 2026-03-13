let currentMode = 'time'; // 'time' o 'weather'

function updateTime() {
    if (currentMode !== 'time') return;
    
    const now = new Date();
    
    // Opzioni per l'ora di Roma
    const timeOptions = { 
        timeZone: 'Europe/Rome',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    };
    const timeString = new Intl.DateTimeFormat('it-IT', timeOptions).format(now);
    
    // Opzioni per la data
    const dateOptions = {
        timeZone: 'Europe/Rome',
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    let dateString = new Intl.DateTimeFormat('it-IT', dateOptions).format(now).toUpperCase();
    dateString = dateString.replace('.', ''); // Rimuove eventuali punti generati da alcune localizzazioni

    document.getElementById('timeDisplay').textContent = timeString;
    document.getElementById('dateDisplay').textContent = dateString;
}

// Aggiornamento principale orologio
setInterval(updateTime, 1000);
updateTime();

// Gestione manuale e automatica dell'illuminazione
const lightBulb = document.getElementById('lightBulb');
const watchScreen = document.getElementById('watchScreen');

function triggerLight() {
    lightBulb.classList.add('on');
    watchScreen.classList.add('illuminated');
    
    setTimeout(() => {
        lightBulb.classList.remove('on');
        watchScreen.classList.remove('illuminated');
    }, 2000);
}

// Luce ogni 10 secondi
setInterval(triggerLight, 10000);

// Azione Pulsante Luce (Top Left)
document.getElementById('lightBtn').addEventListener('click', triggerLight);

// Azione Pulsante Mode (Bottom Left) -> Torna all'orologio
document.getElementById('modeBtn').addEventListener('click', () => {
    currentMode = 'time';
    document.getElementById('weatherMode').classList.remove('active');
    document.getElementById('timeMode').classList.add('active');
    updateTime();
});

// Azione Pulsante Meteo (Top Right)
const weatherBtn = document.getElementById('weatherBtn');

function getWeatherIcon(code) {
    // Codici WMO di Open-Meteo
    if (code <= 1) return '☀'; // Sereno
    if (code <= 3) return '⛅'; // Parzialmente nuvoloso
    if (code <= 48) return '☁'; // Nuvoloso/Nebbia
    if (code <= 57) return '🌧'; // Pioviggine
    if (code <= 69) return '☔'; // Pioggia
    if (code <= 79) return '❄'; // Neve leggera
    if (code <= 82) return '🌧'; // Acquazzoni
    if (code <= 86) return '❄'; // Nevicate intense
    if (code <= 99) return '⚡'; // Temporale
    return '☀';
}

weatherBtn.addEventListener('click', () => {
    currentMode = 'weather';
    document.getElementById('timeMode').classList.remove('active');
    document.getElementById('weatherMode').classList.add('active');
    
    const loadingElem = document.getElementById('weatherLoading');
    loadingElem.textContent = ''; // Nessun testo iniziale
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                loadingElem.textContent = ''; // Nessun testo
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    // API Meteo gratuita che non richiede API key
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    const temp = Math.round(data.current_weather.temperature);
                    const code = data.current_weather.weathercode;
                    
                    document.getElementById('weatherTemp').textContent = `${temp}°C`;
                    document.getElementById('weatherIcon').textContent = getWeatherIcon(code);
                    document.getElementById('weatherLocation').textContent = 'GPS LOCAL';
                    loadingElem.textContent = ''; // Nasconde
                } catch (err) {
                    loadingElem.textContent = 'ERRORE CONNESSIONE';
                }
            },
            (err) => {
                loadingElem.textContent = 'PERMESSO GPS NEGATO';
            }
        );
    } else {
        loadingElem.textContent = 'GPS NON SUPPORTATO';
    }
});
