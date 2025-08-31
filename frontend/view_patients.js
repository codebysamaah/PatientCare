document.addEventListener('DOMContentLoaded', () => {
    const patientList = document.getElementById('patient-list');
    const searchInput = document.getElementById('search-patients');
    let allPatients = [];

    // fetch
    fetch('/api/patients')
        .then(res => res.json())
        .then(patients => {
            allPatients = patients;
            displayPatients(allPatients);
        })
        .catch(err => console.log('Error fetching patients: ', err));

    // Display patients
    function displayPatients(patients){
        patientList.innerHTML = '';
        patients.forEach(patient => {
            const li = document.createElement('li');
            const link = document.createElement('a');

            link.href = `patient_details.html?id=${patient._id}`;
            link.textContent = `${patient.firstName} ${patient.lastName}`;
            link.style.display = 'block';
            patientList.appendChild(li);
            li.append(link);
        });
    }

    // Search patients
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();

        const filtered = allPatients.filter(patient => {
            return (
                patient.firstName.toLowerCase().includes(query) || 
                patient.lastName.toLowerCase().includes(query) || 
                patient.healthCard.includes(query)
            );
        })
        displayPatients(filtered);
    })
});