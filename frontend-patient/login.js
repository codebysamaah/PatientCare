const msg = document.querySelector('.msg');

function showMessage(message, type) {
    msg.textContent = message;
    msg.classList.add(type);
    setTimeout(() => {
        msg.textContent = '';
        msg.classList.remove(type);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const healthNumInput = document.getElementById('healthNum');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const hc = healthNumInput.value.trim();

        try {
            // Fetch patient by health card number
            const res = await fetch(`/api/patients/healthCard/${hc}`);
            
            if (!res.ok) {
                throw new Error('Patient not found');
            }

            const patient = await res.json();

            // Redirect to patient details page with ID in URL
            window.location.href = `home.html?id=${patient._id}`;
        } catch (err) {
            console.error(err);
            showMessage('Invalid health card number', 'error');
        }
    });
});
