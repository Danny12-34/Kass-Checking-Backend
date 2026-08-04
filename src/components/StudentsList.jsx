import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/students-list');
      setStudents(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students list:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/v1/student/${id}`);
        alert('Student deleted successfully');
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student');
      }
    }
  };

  if (loading) return <p>Loading students directory...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Registered Students Directory</h2>
        <button 
          onClick={() => navigate('/CreateStudent')} 
          style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
        >
          Add New Student
        </button>
      </div>

      {students.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '8px' }}>
          No students found. Please add students manually or import via PDF.
        </p>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', borderColor: '#ddd' }}>
            <thead>
              <tr style={{ background: '#2c3e50', color: 'white' }}>
                <th>#</th>
                <th>Registration Number</th>
                <th>Full Name</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td align="center">{index + 1}</td>
                  <td style={{ fontWeight: 'bold' }}>{student.reg_number}</td>
                  <td>{student.full_name}</td>
                  <td align="center">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/MaterialsTable?student=${student.id}`)}
                        style={{ background: '#2980b9', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                      >
                        Check Material
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id, student.full_name)}
                        style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}