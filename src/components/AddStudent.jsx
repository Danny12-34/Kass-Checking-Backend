import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddStudent({ onStudentAdded }) {
  const [regNumber, setRegNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  // Handle manual submission
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/v1/student', { 
        reg_number: regNumber, 
        full_name: fullName,
        class: studentClass 
      });
      alert('Student added successfully!');
      setRegNumber('');
      setFullName('');
      setStudentClass('');
      if (onStudentAdded) onStudentAdded();
      navigate('/Studentlist');
    } catch (err) {
      alert('Error adding student: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handle Excel file upload submission
  const handleExcelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post('http://localhost:5000/api/v1/students/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Excel File Imported and Students Registered Successfully!');
      setSelectedFile(null);
      if (onStudentAdded) onStudentAdded();
      navigate('/Studentlist');
    } catch (err) {
      alert('Error importing Excel: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Register New Students</h2>

      {/* Option 1: Manual Registration Form */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h4 style={{ marginTop: 0, color: '#2c3e50' }}>Option 1: Add Student Manually</h4>
        <form onSubmit={handleManualSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Registration Number:</label>
            <input 
              type="text" 
              placeholder="e.g., 262-020" 
              value={regNumber} 
              onChange={e => setRegNumber(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name:</label>
            <input 
              type="text" 
              placeholder="Student's Full Name" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Class:</label>
            <input 
              type="text" 
              placeholder="e.g., L3 SOD" 
              value={studentClass} 
              onChange={e => setStudentClass(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
            Save Student
          </button>
        </form>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #ddd', margin: '25px 0' }} />

      {/* Option 2: Excel File Upload Form */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h4 style={{ marginTop: 0, color: '#2c3e50' }}>Option 2: Import Students via Excel/CSV Sheet</h4>
        <form onSubmit={handleExcelSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Excel/CSV File:</label>
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={e => setSelectedFile(e.target.files[0])} 
              required 
              style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
            Import Excel List
          </button>
        </form>
      </div>

    </div>
  );
}