document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración de los horarios
    // Basado en tu nueva indicación: desde las 11:00 am (19 equipos en total)
    const startTime = { hours: 11, minutes: 0 };
    const endTime = { hours: 14, minutes: 10 }; // 2:10 PM para que calcen exactamente 19 slots de 10 min
    const intervalMinutes = 10;
    
    // 2. Elementos del DOM
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    const selectedTimeSlotInput = document.getElementById('selectedTimeSlot');
    const form = document.getElementById('reservationForm');
    
    // Generar la lista de horarios matemáticamente
    const timeSlots = generateTimeSlots(startTime, endTime, intervalMinutes);
    
    // Renderizar horarios iniciales en pantalla
    renderTimeSlots();

    // 3. Manejo del envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página recargue
        
        const selectedSlot = selectedTimeSlotInput.value;
        if (!selectedSlot) {
            alert('Por favor, selecciona un horario disponible.');
            return;
        }

        // Simular carga (en la vida real aquí harías un fetch a tu base de datos)
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        setTimeout(() => {
            const teamName = document.getElementById('teamName').value;
            // Guardar la reserva con el nombre del equipo
            bookTimeSlot(selectedSlot, teamName);
            
            // Ocultar carga
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Mostrar mensaje de éxito
            showSuccess(teamName, selectedSlot);
            
        }, 1200); // Simulamos 1.2 segundos de red
    });

    // 4. Botón para hacer otra reserva (resetear UI)
    document.getElementById('resetBtn').addEventListener('click', () => {
        form.reset();
        selectedTimeSlotInput.value = '';
        document.getElementById('successMessage').classList.add('hidden');
        form.classList.remove('hidden');
        form.style.display = 'block';
        // Volvemos a dibujar los horarios, ahora el recién reservado estará bloqueado
        renderTimeSlots();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- FUNCIONES CORE ---

    // Función para crear los bloques de texto de tiempo (ej. "11:20 - 11:30")
    function generateTimeSlots(start, end, interval) {
        let slots = [];
        let current = new Date(2024, 0, 1, start.hours, start.minutes);
        const endData = new Date(2024, 0, 1, end.hours, end.minutes);

        while (current < endData) {
            const next = new Date(current.getTime() + interval * 60000);
            
            const formatTime = (date) => {
                let h = date.getHours();
                let m = date.getMinutes();
                h = h % 12;
                h = h ? h : 12; // el 0 debe ser 12
                m = m < 10 ? '0' + m : m;
                return `${h}:${m}`;
            };

            const slotString = `${formatTime(current)} - ${formatTime(next)}`;
            slots.push(slotString);
            
            current = next;
        }
        return slots;
    }

    // Función para pintar los botones de horario en el HTML
    function renderTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        
        // Obtenemos los horarios que ya están reservados (ahora es un objeto)
        const bookedSlots = getBookedSlots();

        timeSlots.forEach(slot => {
            const teamReserved = bookedSlots[slot];
            const isBooked = !!teamReserved;
            const slotEl = document.createElement('div');
            
            // Asignar clases CSS dependiendo de si está reservado o libre
            slotEl.className = `time-slot ${isBooked ? 'booked' : 'available'}`;
            slotEl.textContent = slot;

            if (isBooked) {
                // Pasamos el nombre del equipo como atributo para el CSS
                slotEl.setAttribute('data-team', teamReserved);
            }

            // Solo los horarios disponibles se pueden clickear
            if (!isBooked) {
                slotEl.addEventListener('click', () => {
                    // Deseleccionar cualquier otro que estuviera seleccionado
                    document.querySelectorAll('.time-slot.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // Seleccionar el actual
                    slotEl.classList.add('selected');
                    
                    // Guardar el valor en el input oculto para que el formulario lo lea
                    selectedTimeSlotInput.value = slot;
                });
            }

            timeSlotsContainer.appendChild(slotEl);
        });
    }

    // --- SIMULACIÓN DE BASE DE DATOS (Backend Mock) ---
    // NOTA: Para producción (en tu Github Pages), si quieres que el bloqueo 
    // se sincronice entre los celulares de *diferentes* personas, necesitas 
    // una base de datos real en la nube como Firebase Firestore o Supabase.
    // Actualmente, esto usa localStorage (funciona perfecto en una sola PC / kiosko).

    function getBookedSlots() {
        const booked = localStorage.getItem('escapeRoomBookedSlots_v3'); // v3 para limpiar y usar nueva estructura
        return booked ? JSON.parse(booked) : {};
    }

    function bookTimeSlot(slot, teamName) {
        const booked = getBookedSlots();
        if (!booked[slot]) {
            booked[slot] = teamName;
            localStorage.setItem('escapeRoomBookedSlots_v3', JSON.stringify(booked));
        }
    }

    // --- UI ---
    function showSuccess(teamName, time) {
        form.style.display = 'none';
        
        const successEl = document.getElementById('successMessage');
        document.getElementById('successTeamName').textContent = teamName;
        document.getElementById('successTime').textContent = time;
        
        successEl.classList.remove('hidden');
    }
});
