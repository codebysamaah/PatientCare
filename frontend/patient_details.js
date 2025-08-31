const urlParams = new URLSearchParams(window.location.search);
const patientId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', () => {
    const mhform = document.getElementById('medical-history-form');
    const medDiv = document.getElementById('medical-history');
    const basicForm = document.getElementById('basic-form');
    const basicDiv = document.getElementById('patient-details');
    const apptList = document.getElementById('appt-list');

    existingPatient = {};

    fetch(`/api/patients/${patientId}`)
        .then(res => res.json())
        .then(patient => {
            existingPatient = patient;

            const dateObj = new Date(patient.dob);
            const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
            const date = dateObj.toLocaleDateString('en-US', options);

            basicDiv.innerHTML = `
                <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
                <p><strong>Health Card:</strong> ${patient.healthCard}</p>
                <p><strong>Date of Birth:</strong> ${date}</p>
                <p><strong>Email:</strong> ${patient.email}</p>
                <p><strong>Age:</strong> ${patient.age}</p>
                <p><strong>Gender:</strong> ${patient.gender}</p>
                <p><strong>Contact:</strong> ${patient.contact}</p>
                <p><strong>Address:</strong> ${patient.address}</p>
            `;

            const mh = patient.medicalHistory || {};
            medDiv.innerHTML = `
                <p><strong>Past Illnesses:</strong> ${mh.pastIllnesses || 'None Reported'}</p>
                <p><strong>Surgeries:</strong> ${mh.surgeries || 'None Reported'}</p>
                <p><strong>Allergies:</strong> ${mh.allergies || 'None Reported'}</p>
                <p><strong>Ongoing Medications:</strong> ${mh.ongoingMedications || 'None Reported'}</p>
            `;

            // Display appointments
            const appointments = patient.appointments || [];
            apptList.innerHTML = '';
            if (appointments.length === 0) {
                apptList.innerHTML = '<li>No appointments found.</li>';
            } else {
                appointments.forEach(appt => {
                    const dateStr = new Date(appt.date).toLocaleString();
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>${appt.type}</strong> with ${appt.doctor}<br>
                        <em>${dateStr}</em><br>
                    `;
                    apptList.appendChild(li);
                });
            }
        })
        .catch(err => console.log('Error loading patient details:', err));

    // Show forms on edit click
    document.getElementById('edit-mh-btn').addEventListener('click', () => {
        mhform.style.display = 'block';
    });

    document.getElementById('edit-basic-btn').addEventListener('click', () => {
        basicForm.style.display = 'block';
    });

    // Clear functions
    function clearMHForm() {
        document.getElementById('pastIllnesses').value = '';
        document.getElementById('surgeries').value = '';
        document.getElementById('allergies').value = '';
        document.getElementById('ongoingMedications').value = '';
    }

    function clearBasicForm() {
        document.getElementById('editFirst').value = '';
        document.getElementById('editLast').value = '';
        document.getElementById('editEmail').value = '';
        document.getElementById('editContact').value = '';
        document.getElementById('editAdd').value = '';
        document.getElementById('editGender').value = '';
        document.getElementById('editAge').value = '';
        document.getElementById('editHC').value = '';
    }

    // Cancel buttons
    document.getElementById('cancel-mh-btn').addEventListener('click', () => {
        mhform.style.display = 'none';
        clearMHForm();
    });

    document.getElementById('cancel-basic-btn').addEventListener('click', () => {
        basicForm.style.display = 'none';
        clearBasicForm();
    });

    // Save medical history
    mhform.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updated = {
            medicalHistory: {
                pastIllnesses: document.getElementById('pastIllnesses').value,
                surgeries: document.getElementById('surgeries').value,
                allergies: document.getElementById('allergies').value,
                ongoingMedications: document.getElementById('ongoingMedications').value
            }
        };

        try {
            const res = await fetch(`/api/patients/${patientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });

            if (!res.ok) throw new Error('Failed to update medical history');

            const updatedPatient = await res.json();
            const mh = updatedPatient.medicalHistory || {};

            medDiv.innerHTML = `
                <p><strong>Past Illnesses:</strong> ${mh.pastIllnesses || 'None Reported'}</p>
                <p><strong>Surgeries:</strong> ${mh.surgeries || 'None Reported'}</p>
                <p><strong>Allergies:</strong> ${mh.allergies || 'None Reported'}</p>
                <p><strong>Ongoing Medications:</strong> ${mh.ongoingMedications || 'None Reported'}</p>
            `;

            clearMHForm();
            mhform.style.display = 'none';

        } catch (error) {
            console.log('Error updating medical history:', error);
        }
    });

    // Save basic info
    basicForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('id');

        const updated = {
            firstName: document.getElementById('editFirst').value || existingPatient.firstName,
            lastName: document.getElementById('editLast').value || existingPatient.lastName,
            healthCard: document.getElementById('editHC').value || existingPatient.healthCard,
            email: document.getElementById('editEmail').value || existingPatient.email,
            age: parseInt(document.getElementById('editAge').value) || existingPatient.age,
            gender: document.getElementById('editGender').value || existingPatient.gender,
            contact: document.getElementById('editContact').value || existingPatient.contact,
            address: document.getElementById('editAdd').value || existingPatient.address,
        };

        try {
            const res = await fetch(`/api/patients/${patientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });

            if (!res.ok) throw new Error('Failed to update basic info');

            const updatedPatient = await res.json();

            const dateObj = new Date(updatedPatient.dob);
            const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
            const date = dateObj.toLocaleDateString('en-US', options);

            basicDiv.innerHTML = `
                <p><strong>Name:</strong> ${updatedPatient.firstName} ${updatedPatient.lastName}</p>
                <p><strong>Health Card:</strong> ${updatedPatient.healthCard}</p>
                <p><strong>Date of Birth:</strong> ${date}</p>
                <p><strong>Email:</strong> ${updatedPatient.email}</p>
                <p><strong>Age:</strong> ${updatedPatient.age}</p>
                <p><strong>Gender:</strong> ${updatedPatient.gender}</p>
                <p><strong>Contact:</strong> ${updatedPatient.contact}</p>
                <p><strong>Address:</strong> ${updatedPatient.address}</p>
            `;

            clearBasicForm();
            basicForm.style.display = 'none';

        } catch (error) {
            console.log('Error updating basic info:', error);
        }
    });

    // Prescriptions functionality
    async function uploadPrescription() {
        const fileInput = document.getElementById('prescriptionFile');
        if (!fileInput.files[0]) {
            return;
        }

        const formData = new FormData();
        formData.append('prescription', fileInput.files[0]);

        try {
            const response = await fetch(`/api/patients/${patientId}/prescriptions`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                fileInput.value = ''; // Clear file input
                loadPrescriptions(); // Reload the list
            } else {
                console.error('Upload error:', error);
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    }

    async function loadPrescriptions() {
        try {
            const response = await fetch(`/api/patients/${patientId}/prescriptions`);
            const prescriptions = await response.json();

            const container = document.getElementById('prescriptions');
            
            container.innerHTML = '';

            if (prescriptions.length === 0) {
                container.innerHTML = '<p>No prescriptions found.</p>';
                return;
            }

            prescriptions.forEach(pres => {
                const filename = pres.originalname;

                const li = document.createElement('li');
                li.className = 'prescription-item';
                
                link = document.createElement('a');
                link.href = `/uploads/${filename}`;
                link.target = '_blank';
                link.textContent = filename;

                const button = document.createElement('button');
                button.textContent = 'Delete';
                button.addEventListener('click', () => deletePrescription(filename));
            
                li.appendChild(link);
                li.appendChild(button);
                container.appendChild(li);
            });

        } catch (error) {
            console.error('Error loading prescriptions:', error);
        }
    }

    async function deletePrescription(filename) {
        try {
            const response = await fetch(`/api/patients/${patientId}/prescriptions/${filename}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadPrescriptions(); // Reload the list
            } else {
                console.error('Delete error:', error);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    }

    document.getElementById('upload-file-btn').addEventListener('click', () => {
        uploadPrescription(); 
    });

    document.getElementById('button').addEventListener('click', () => {
        window.location.href = 'view_patients.html'; 
    });

    // Load prescriptions when page loads
    loadPrescriptions();
});

// Load prescriptions when page loads
loadPrescriptions();