document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const minutesInput = document.getElementById('minutes');
    const countdownDisplay = document.getElementById('countdown');
    const coffeeLevel = document.getElementById('coffee-level');
    const statusMessage = document.getElementById('status-message');
    const focusGoalInput = document.getElementById('focus-goal-input');

    let totalTimeInSeconds = 0;
    let timeRemaining = 0;
    let timerInterval = null;
    let isRunning = false;
    
    // Stałe dla SVG - odczytane z HTML, aby były zgodne
    const MAX_COFFEE_HEIGHT = parseFloat(coffeeLevel.getAttribute('height'));
    const MAX_COFFEE_Y = parseFloat(coffeeLevel.getAttribute('y'));

    /**
     * Aktualizuje wyświetlanie czasu i poziom kawy.
     */
    function updateDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        
        countdownDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // --- Logika malejącej filiżanki (poziomu kawy) ---
        if (totalTimeInSeconds > 0) {
            const percentageRemaining = timeRemaining / totalTimeInSeconds;

            // Obliczamy nową wysokość kawy (od 0 do MAX_COFFEE_HEIGHT)
            const newHeight = MAX_COFFEE_HEIGHT * percentageRemaining;
            
            // Obliczamy nową pozycję Y.
            // Im mniej kawy, tym niższa jest jej wysokość i tym WYŻSZE jest 'y' (bo oś Y rośnie w dół w SVG).
            const newY = MAX_COFFEE_Y + (MAX_COFFEE_HEIGHT - newHeight);

            // Aktualizacja atrybutów SVG
            coffeeLevel.setAttribute('height', newHeight);
            coffeeLevel.setAttribute('y', newY);
        } else {
            // Jeśli totalTimeInSeconds jest 0 (np. przed pierwszym startem lub po resecie)
            // Ustawiamy kawę na pełny poziom.
            coffeeLevel.setAttribute('height', MAX_COFFEE_HEIGHT);
            coffeeLevel.setAttribute('y', MAX_COFFEE_Y);
        }
    }

    /**
     * Główna funkcja odliczania, wywoływana co sekundę.
     */
    function tick() {
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            statusMessage.textContent = "KONIEC! Świetna robota!";
            startButton.innerHTML = '<i class="fas fa-play"></i> Start';
            timeRemaining = 0; // Upewniamy się, że czas jest 0
            updateDisplay(); // Zapewnia, że poziom kawy jest na 0
            // Opcjonalnie: alert, dźwięk, etc.
            new Audio('alarm.mp3').play().catch(e => console.log("Błąd odtwarzania alarmu:", e)); // Załóżmy, że masz plik alarm.mp3
            return;
        }

        timeRemaining--;
        updateDisplay();
        
        if (timeRemaining > 0) {
             statusMessage.textContent = `Skupienie na: "${focusGoalInput.value || 'Twoim celu'}"`;
        }
    }

    /**
     * Rozpoczyna, wznawia lub pauzuje timer.
     */
    startButton.addEventListener('click', () => {
        if (isRunning) {
            // Zatrzymanie
            clearInterval(timerInterval);
            isRunning = false;
            startButton.innerHTML = '<i class="fas fa-play"></i> Wznów';
            statusMessage.textContent = "Pauza";
        } else {
            // Start / Wznowienie
            
            // Jeśli to nowy start (po resecie lub pierwszy raz) lub czas się skończył
            if (timeRemaining === 0) {
                const minutes = parseInt(minutesInput.value);
                if (isNaN(minutes) || minutes <= 0) {
                    alert("Wprowadź poprawną liczbę minut (powyżej 0).");
                    return;
                }
                totalTimeInSeconds = minutes * 60;
                timeRemaining = totalTimeInSeconds;
                // Ustawienie początkowego wyświetlania przed pierwszym tyknięciem
                updateDisplay(); 
            }
            
            isRunning = true;
            startButton.innerHTML = '<i class="fas fa-pause"></i> Pauza';
            statusMessage.textContent = `Skupienie na: "${focusGoalInput.value || 'Twoim celu'}"`;
            
            // Uruchomienie interwału co sekundę
            timerInterval = setInterval(tick, 1000);
        }
    });

    /**
     * Resetuje timer do początkowego stanu.
     */
    resetButton.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        startButton.innerHTML = '<i class="fas fa-play"></i> Start';
        
        const initialMinutes = parseInt(minutesInput.value);
        if (isNaN(initialMinutes) || initialMinutes <= 0) {
            totalTimeInSeconds = 0;
            timeRemaining = 0;
            countdownDisplay.textContent = "00:00";
        } else {
            totalTimeInSeconds = initialMinutes * 60;
            timeRemaining = initialMinutes * 60;
            countdownDisplay.textContent = 
                `${String(initialMinutes).padStart(2, '0')}:00`;
        }
        statusMessage.textContent = "Gotowy do rozpoczęcia sesji";
        updateDisplay(); // Ustawia kawę na pełno
    });

    // Aktualizacja wyświetlacza przy zmianie liczby minut
    minutesInput.addEventListener('change', () => {
        if (!isRunning) { // Zmieniamy wyświetlacz tylko jeśli timer nie działa
            resetButton.click(); // Resetujemy, aby zaktualizować czas i poziom kawy
        }
    });
    
    // Inicjalizacja wyświetlacza przy pierwszym załadowaniu strony
    // Symulujemy kliknięcie reset, aby ustawić początkowy czas i kawę
    resetButton.click(); 
});