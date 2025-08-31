const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

document.getElementById('homeLink').href = `home.html?id=${id}`;
document.getElementById('profLink').href = `profile.html?id=${id}`;
document.getElementById('apptLink').href = `appt_view.html?id=${id}`;
document.getElementById('presLink').href = `prescriptions.html?id=${id}`;