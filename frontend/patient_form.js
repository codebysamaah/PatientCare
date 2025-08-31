const myForm = document.querySelector('#patient-form');
const firstname = document.querySelector('#firstName');
const lastname = document.querySelector('#lastName');
const dob = document.querySelector('#dob');
const healthNum = document.querySelector('#healthNum');
const emailInput = document.querySelector('#email');
const ageInput = document.querySelector('#age');
const genderInput = document.querySelector('#gender');
const contactInput = document.querySelector('#contact');
const addressInput = document.querySelector('#address');
const msg = document.querySelector('.msg');

myForm.addEventListener('submit', onSubmit);

function onSubmit(e){
    e.preventDefault();

    // Build patient object
    const patient = {
        firstName: firstname.value,
        lastName: lastname.value,
        dob: dob.value,
        healthCard: healthNum.value,
        email: emailInput.value,
        age: ageInput.value,
        gender: genderInput.value,
        contact: contactInput.value,
        address: addressInput.value
    };

    fetch('/api/patients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(patient)
    })
    .then(res => res.json())
    .then(data => {
        msg.textContent = 'Successfully Registered Patient!';
        msg.classList.add('success');
        myForm.reset();
    })
    .catch(err => {
        console.log(err);
        msg.textContent = 'Failed to register patient.';
        msg.classList.add('error');
    });

    setTimeout(() => {
    msg.textContent = '';
    msg.classList.remove('success');
     msg.classList.add('error');
    }, 5000);
}