const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

document.getElementById('homeLink').href = `home.html?id=${id}`;
document.getElementById('profLink').href = `profile.html?id=${id}`;
document.getElementById('apptLink').href = `appt_view.html?id=${id}`;
document.getElementById('presLink').href = `prescriptions.html?id=${id}`;

// Load prescriptions when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadPrescriptions();
});

// Function to load prescriptions
async function loadPrescriptions() {
    try {        
        const response = await fetch(`/api/patients/${id}/prescriptions`);
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        
        const prescriptions = await response.json();

        const container = document.getElementById('prescriptions');
        container.innerHTML = ''; // Clear previous content
        
        if (!prescriptions) {
            container.innerHTML = '<li class="no-prescriptions">No prescriptions found for this patient.</li>';
            return;
        }

        // Create list items for each prescription
        prescriptions.forEach(prescription => {
            const li = document.createElement('li');
            li.className = 'prescription-item';
            
            // Get filename - try different possible properties
            const filename = prescription.filename || prescription.originalname || 'prescription.pdf';
            
            const link = document.createElement('a');
            link.href = `/uploads/${filename}`;
            link.target = '_blank';
            link.textContent = filename;
            link.className = 'prescription-link';
            
            li.appendChild(link);
            container.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading prescriptions:', error);
        const container = document.getElementById('prescriptions');
        container.innerHTML = '<li class="error">Error loading prescriptions. Please try again later.</li>';
    }
}
