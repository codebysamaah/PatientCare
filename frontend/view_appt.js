const msg = document.querySelector('.msg');

function showMessage(message, type) {
    msg.textContent = message;
    msg.classList.add(type);
    setTimeout(() => {
        msg.textContent = '';
        msg.classList.remove(type);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');
    const appointmentIndex = urlParams.get('apptIndex');
    
    const expectedTimeInput = document.getElementById('expectedTime');
    const updateTimeBtn = document.getElementById('updateTimeBtn');
    const deleteBtn = document.querySelector('.del-btn');
    const backBtn = document.querySelector('.back-btn');
    const patientDetailsBtn = document.querySelector('.patient-det');

    let currPatientId = patientId;

    // Update expected time
    updateTimeBtn.addEventListener('click', async function() {
        const newTime = expectedTimeInput.value;
        
        if (!newTime) {
            showMessage('Please enter a time.', 'error');
            return;
        }

        try {
            // Send PATCH request to update the expected_time
            const response = await fetch(`/api/patients/${patientId}/appointments/${appointmentIndex}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    expected_time: newTime
                })
            });

            if (response.ok) {                
                showMessage('Appointment time updated!', 'success');
                expectedTimeInput.value = '';
            } else {
                showMessage('Failed to update time.', 'error');
            }
        
        } catch (error) {
            console.error('Error updating time:', error);
            showMessage('Failed to update time.', 'error');
        }
    });

    // Delete appointment
    deleteBtn.addEventListener('click', async function() {
        try {
            const response = await fetch(`/api/patients/${patientId}/appointments/${appointmentIndex}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                window.location.href = 'appointments.html';
            } else {
                showMessage('Failed to delete appointment.', 'error');;
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            showMessage('Failed to delete appointment.', 'error');
        }
    });

    // Back button
    backBtn.addEventListener('click', function() {
        window.location.href = 'appointments.html';
    });

    // Patient details button
    patientDetailsBtn.addEventListener('click', function() {
        if (currPatientId){
            window.location.href = `patient_details.html?id=${currPatientId}`;
        }
        else {
            showMessage('Patient information not available', 'error');
        }
    });

});
