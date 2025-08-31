const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

document.getElementById('homeLink').href = `home.html?id=${id}`;
document.getElementById('profLink').href = `profile.html?id=${id}`;
document.getElementById('apptLink').href = `appt_view.html?id=${id}`;
document.getElementById('presLink').href = `prescriptions.html?id=${id}`;

document.addEventListener('DOMContentLoaded', () => {
    const medDiv = document.getElementById('medical-history');
    const basicDiv = document.getElementById('basic-info');

    let = existingPatient = {};

    fetch(`/api/patients/${id}`)
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
        })
        .catch(err => console.log('Error loading patient details:', err));
});