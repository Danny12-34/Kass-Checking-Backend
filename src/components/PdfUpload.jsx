import React, { useState } from 'react';
import axios from 'axios';

export default function PdfUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post('http://localhost:5000/api/v1/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('PDF Imported and Students Registered Successfully!');
      setSelectedFile(null);
      onUploadSuccess();
    } catch (err) {
      alert('Error importing PDF');
    }
  };

  return (
    <form onSubmit={handlePdfUpload} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
      <h4>Upload Students List PDF</h4>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={e => setSelectedFile(e.target.files[0])} 
        required 
      /><br/><br/>
      <button type="submit">Import PDF</button>
    </form>
  );
}