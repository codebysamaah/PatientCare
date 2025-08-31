const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

document.getElementById('homeLink').href = `home.html?id=${id}`;
document.getElementById('profLink').href = `profile.html?id=${id}`;
document.getElementById('apptLink').href = `appt_view.html?id=${id}`;
document.getElementById('presLink').href = `prescriptions.html?id=${id}`;

const searchInput = document.getElementById('search-patients');
const msg = document.querySelector('.msg');

let allAppts = [];
let currentPatient = null;

function showMessage(message, type) {
    msg.textContent = message;
    msg.classList.add(type);
    setTimeout(() => {
        msg.textContent = '';
        msg.classList.remove(type);
    }, 5000);
}

// First, load the specific patient data
async function loadPatientData() {
    try {
        const res = await fetch(`/api/patients/${id}`);
        if (!res.ok) throw new Error('Failed to fetch patient data');

        currentPatient = await res.json();
        loadPatientAppointments();

    } catch (err) {
        console.error('Error loading patient data:', err);
    }
}

// Search appts
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();

    if (query === ''){
        displayAppts(allAppts);
        return;
    }
    
    const filtered = allAppts.filter(appt => {
        return (
            appt.doctor.toLowerCase().includes(query) || 
            appt.type.toLowerCase().includes(query) ||
            appt.date.toLowerCase().includes(query)
        );
    });

    displayAppts(filtered);
});

// Display appointments
function displayAppts(appointments) {
    const ul = document.getElementById('apptUl');
    ul.innerHTML = "";

    if (appointments.length === 0) {
        ul.innerHTML = "<li>No appointments found matching your search.</li>";
        return;
    }

    appointments.forEach(appt => {
        const li = document.createElement('li');
        const link = document.createElement('a');

        const appointmentDate = new Date(appt.date);
        link.href = `appt_info.html?id=${appt.patientId}&apptIndex=${appt.appointmentIndex}`;
        link.textContent = `${appointmentDate.toLocaleDateString()} ${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${appt.doctor} - ${appt.type}`;
        link.style.display = 'block';
        link.className = 'appt-link';

        li.appendChild(link);
        ul.appendChild(li);
    });
}

// Load appointments for the specific patient
async function loadPatientAppointments() {
    try {
        if (!currentPatient) {
            throw new Error('Patient data not loaded');
        }

        allAppts = [];

        if (currentPatient.appointments && currentPatient.appointments.length > 0) {
            currentPatient.appointments.forEach((appt, index) => {
                allAppts.push({
                    date: appt.date,
                    doctor: appt.doctor,
                    type: appt.type,
                    expected_time: appt.expected_time,
                    firstName: currentPatient.firstName,
                    lastName: currentPatient.lastName,
                    patientId: currentPatient._id,
                    healthCard: currentPatient.healthCard,
                    appointmentIndex: index
                });
            });
        }

        displayAppts(allAppts);

    } catch (err) {
        console.error('Error loading appointments:', err);
        const ul = document.getElementById('apptUl');
        ul.innerHTML = "<li>Error loading appointments</li>";
    }
}

// Load patient data and appointments on page load
loadPatientData();
