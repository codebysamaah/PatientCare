const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const app = express();

// Middleware
app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, '../frontend')));
app.use('/patient', express.static(path.join(__dirname, '../frontend-patient')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend-patient/index.html'));
});

// Store files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/patientsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch((err) => console.log(err));

// Appointment schema
const appointmentSchema = new mongoose.Schema({
    date: Date,
    doctor: String,
    type: String,
    expected_time: String
});

// Prescription schema
const prescriptionSchema = new mongoose.Schema({
    originalname: String
});

// Define Patient Schema
const patientSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    dob: Date,
    healthCard: String,
    email: String,
    age: Number,
    gender: String,
    contact: String,
    address: String,
    medicalHistory: {
        pastIllnesses: String,
        surgeries: String,
        allergies: String,
        ongoingMedications: String,
    },
    appointments: [appointmentSchema],
    prescriptions: [prescriptionSchema]
});

const Patient = mongoose.model('Patient', patientSchema);

// API endpoint to save patient
app.post('/api/patients', async (req, res) => {
    try {
        const newPatient = new Patient(req.body);
        await newPatient.save();
        res.status(201).json({ message: 'Patient saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving patient', error });
    }
});

// API endpoint to update patient appointments
app.post('/api/patients/:id/appointments', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        patient.appointments.push(req.body);
        await patient.save();
        
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error adding appointment', error });
    }
});

// Upload prescription
app.post('/api/patients/:id/prescriptions', upload.single('prescription'), async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient.prescriptions){
            patient.prescriptions = [];
            
        }
        patient.prescriptions.push({
            originalname: req.file.originalname
        });
        await patient.save();
        res.json({ message: 'Prescription uploaded' });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Get all patients
app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients', error });
    }
});

// Get a patient by ID
app.get('/api/patients/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient', error });
    }
});

// Get appointment given index into appt array
app.get('/api/patients/:id/appointments/:apptIndex', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const appointmentIndex = parseInt(req.params.apptIndex); 
        if (appointmentIndex < 0 || appointmentIndex >= patient.appointments.length) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const appointment = patient.appointments[appointmentIndex];
        res.status(200).json({
            appointment,
            patient: {
                firstName: patient.firstName,
                lastName: patient.lastName,
                healthCard: patient.healthCard
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointment', error });
    }
});

// Get patient by health card number
app.get('/api/patients/healthCard/:hc', async (req, res) => {
    try {
        const hC = req.params.hc;
        const patient = await Patient.findOne({ healthCard: hC });
        if (!patient) return res.status(404).send('Patient not found!!');
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error', error });
    }
});

// Get prescriptions of patient
app.get('/api/patients/:id/prescriptions', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        res.json(patient.prescriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load prescriptions' });
    }
});

// Update a patient
app.put('/api/patients/:id', async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(updatedPatient);
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient', error });
    }
});

// Update appointment expected_time
app.patch('/api/patients/:id/appointments/:apptIndex', async (req, res) => {
    try {
        const { id, apptIndex } = req.params;
        
        // Find the patient
        const patient = await Patient.findById(id);
        if (!patient) {
            return;
        }

        // Convert index to number and validate
        const index = parseInt(apptIndex);
        if (isNaN(index) || index < 0 || index >= patient.appointments.length) {
            return;
        }

        // Update the expected_time field
        patient.appointments[index].expected_time = req.body.expected_time;

        // Save the updated patient
        await patient.save();
        
        // Return success response with updated appointment
        res.status(200).json({ message: 'Expected time updated successfully'});

    } catch (error) {
        res.status(500).json({ message: 'Error updating expected appt time', error });
    }
});

// Delete a patient
app.delete('/api/patients/:id', async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        if (!deletedPatient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting patient', error });
    }
});

// Delete a specific appointment from a patient
app.delete('/api/patients/:id/appointments/:apptIndex', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const appointmentIndex = parseInt(req.params.apptIndex);
        if (appointmentIndex < 0 || appointmentIndex >= patient.appointments.length) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Remove the appointment
        patient.appointments.splice(appointmentIndex, 1);
        await patient.save();
        
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting appointment', error });
    }
});

// Delete prescription
app.delete('/api/patients/:id/prescriptions/:filename', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        
        // Find and remove the prescription
        patient.prescriptions.forEach(pres => {
            if (pres.originalname == req.params.filename){
                patient.prescriptions.remove(pres);
            }
        });
        
        await patient.save();
        res.json({ message: 'Prescription deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Start server
const PORT = process.env.PORT || 4400;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
