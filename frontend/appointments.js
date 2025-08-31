const myAppt = document.querySelector('#patient-form');
const fullName = document.querySelector('#patientName');
const apptDate = document.querySelector('#apptDate');
const healthNum = document.querySelector('#healthNum');
const apptType = document.querySelector('#apptType');
const doctorName = document.querySelector('#doctorName');
const searchInput = document.getElementById('search-patients');
const msg = document.querySelector('.msg');

let allAppts = [];

myAppt.addEventListener('submit', onSubmit);

async function onSubmit(e) {
    e.preventDefault();

    // Build appointment object
    const newAppt = {
        date: apptDate.value,
        doctor: doctorName.value,
        type: apptType.value,
        expected_time: new Date(apptDate.value).toLocaleTimeString()
    };

    // Store appointment in patient using healthcard num
    const hc = healthNum.value.trim();
    
    try {
        const res = await fetch(`/api/patients/healthCard/${hc}`);
        if (!res.ok) throw new Error('Patient not found');

        const patient = await res.json();

        const updateRes =  await fetch(`/api/patients/${patient._id}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newAppt)
        });

        if (!updateRes.ok) {
            const errorText = await updateRes.text();
            throw new Error(`Failed to update patient: ${errorText}`);
        }

        loadAllAppointments();

        // Clear form
        myAppt.reset();
        msg.textContent = 'Appointment Added!';
        msg.classList.add('success');

        setTimeout(() => {
            msg.textContent = '';
            msg.classList.remove('success');
        }, 5000);

    } catch (err) {
        console.log(err)
        msg.textContent = 'Error!'
        msg.classList.add('error');

        setTimeout(() => {
            msg.textContent = '';
            msg.classList.remove('error');
        }, 5000);
    }
}

// Search appts by patient name
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    if (query == ''){
        displayAppts(allAppts);
        return;
    }
    
    const filtered = allAppts.filter(appt => {
        const fullName = `${appt.firstName} ${appt.lastName}`.toLowerCase();
        return (
            appt.firstName.toLowerCase().includes(query) || 
            appt.lastName.toLowerCase().includes(query) ||
            fullName.includes(query)
        );
    })

    displayAppts(filtered);
})

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
        link.href = `view_appt.html?id=${appt.patientId}&apptIndex=${appt.appointmentIndex}`;
        link.textContent = `${appointmentDate.toLocaleDateString()} ${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${appt.firstName} ${appt.lastName} - ${appt.doctor} - ${appt.type}`;
        link.style.display = 'block';

        li.append(link);
        ul.appendChild(li);
    });
}

// Load all appointments
async function loadAllAppointments() {
    try {
        const res = await fetch('/api/patients');
        if (!res.ok) throw new Error('Failed to fetch patients');

        const patients = await res.json();
        allAppts = [];

        patients.forEach(patient => {
            if (patient.appointments && patient.appointments.length > 0) {
                patient.appointments.forEach((appt, index) => {
                    allAppts.push({
                        ...appt,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        patientId: patient._id,
                        healthCard: patient.healthCard,
                        appointmentIndex: index
                    });
                });
            }
        });

        displayAppts(allAppts);

    } catch (err) {
        console.error('Error loading appointments:', err);
        const ul = document.getElementById('apptUl');
        ul.innerHTML = "<li>Error loading appointments</li>";
    }
}

// Load all appointments on page load
loadAllAppointments();

