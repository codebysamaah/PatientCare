const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const appointmentIndex = urlParams.get('apptIndex');

document.getElementById('homeLink').href = `home.html?id=${id}`;
document.getElementById('profLink').href = `profile.html?id=${id}`;
document.getElementById('apptLink').href = `appt_view.html?id=${id}`;
document.getElementById('presLink').href = `prescriptions.html?id=${id}`;


console.log('Patient ID:', id);
console.log('Appointment Index:', appointmentIndex);

document.addEventListener('DOMContentLoaded', function() {
    const timeDisplay = document.getElementById('time');

    // Load expected time
    if (id && appointmentIndex) {
        fetch(`/api/patients/${id}/appointments/${appointmentIndex}`)
            .then(response => response.json())
            .then(data => {
                timeDisplay.textContent = data.appointment.expected_time || 'Not specified';
            })
            .catch(error => {
                console.error('Error:', error);
                timeDisplay.textContent = 'Error';
                timeDisplay.style.color = 'red';
            });
    } else {
        timeDisplay.textContent = 'Missing appointment information';
        timeDisplay.style.color = 'red';
    } 
});

document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = `appt_view.html?id=${id}`; 
});