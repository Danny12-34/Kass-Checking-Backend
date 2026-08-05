import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './DisciplineSidebar'; // Import your Sidebar component

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5000/api/v1/students-list');
      setStudents(res.data || []);
    } catch (err) {
      console.error('Error fetching students list:', err);
      setError('Failed to load students directory from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/student/${id}`);
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student.');
    }
  };

  // Determine the display class dynamically from the first student record or fall back to default
  const displayClass = students.length > 0 ? (students[0].class_name || students[0].class || 'L4 ETE') : 'L4 ETE';

  // Filter students based on search input (checks registration number, full name, or class)
  const filteredStudents = students.filter(student => {
    const regNumber = (student.reg_number || '').toLowerCase();
    const fullName = (student.full_name || '').toLowerCase();
    const studentClass = (student.class_name || student.class || 'L4 ETE').toLowerCase();
    const query = searchTerm.toLowerCase();

    return regNumber.includes(query) || fullName.includes(query) || studentClass.includes(query);
  });

  // Reset to page 1 whenever search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return (
    <div className="layout-flex">
      <Sidebar />
      <div className="state-container" style={{ flex: 1 }}>
        <div className="spinner"></div>
        <p>Loading students directory...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="layout-flex">
      <Sidebar />
      <div className="state-container error-state" style={{ flex: 1 }}>
        <p>⚠️ {error}</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .layout-flex {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
          font-family: 'Inter', sans-serif;
        }

        .main-content {
          flex: 1;
          padding: 40px 20px;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .students-container {
          max-width: 1200px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }

        .header-title h2 {
          margin: 0;
          color: #0f172a;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        .header-title p {
          margin: 6px 0 0 0;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
        }

        .add-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 10px 18px;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
          transition: all 0.2s ease;
        }

        .add-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 6px 8px -1px rgba(16, 185, 129, 0.3);
          transform: translateY(-1px);
        }

        .search-section {
          padding: 20px 32px;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
        }

        .search-input {
          width: 100%;
          padding: 10px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          color: #0f172a;
          background-color: #f8fafc;
          box-sizing: border-box;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          background-color: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .table-responsive {
          overflow-x: auto;
        }

        .styled-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .styled-table thead tr {
          background-color: #f1f5f9;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .styled-table th, .styled-table td {
          padding: 16px 24px;
        }

        .styled-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
        }

        .styled-table tbody tr:hover {
          background-color: #f8fafc;
        }

        .badge-class {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.025em;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .action-btns {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .action-btn-delete {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          transition: all 0.2s;
        }

        .action-btn-delete:hover {
          background-color: #fee2e2;
        }

        .empty-state {
          text-align: center;
          color: #94a3b8;
          padding: 48px;
          font-style: italic;
          font-size: 14px;
        }

        .pagination-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
        }

        .pagination-info {
          font-size: 13px;
          color: #64748b;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .page-btn {
          background-color: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 13px;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background-color: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .page-btn.active {
          background-color: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .page-btn:disabled {
          background-color: #f8fafc;
          color: #cbd5e1;
          border-color: #e2e8f0;
          cursor: not-allowed;
        }

        .state-container {
          padding: 60px;
          text-align: center;
          font-size: 15px;
          color: #64748b;
          font-weight: 500;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #10b981;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="layout-flex">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content View */}
        <div className="main-content">
          <div className="students-container">
            <div className="header-flex">
              <div className="header-title">
                <h2>Registered Students Directory</h2>
                <p>Active Class Profile: <span style={{ color: '#0f172a', fontWeight: '600' }}>{displayClass}</span></p>
              </div>
              <button 
                onClick={() => navigate('/CreateStudent')} 
                className="add-btn"
              >
                + Add New Student
              </button>
            </div>

            {/* Search Bar Section */}
            <div className="search-section">
              <input
                type="text"
                placeholder="Search by student name, registration number, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="table-responsive">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>Registration Number</th>
                    <th>Full Name</th>
                    <th>Class</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">No students found matching your search criteria.</td>
                    </tr>
                  ) : (
                    currentStudents.map((student, index) => (
                      <tr key={student.id}>
                        <td style={{ color: '#64748b', fontWeight: '500' }}>{indexOfFirstItem + index + 1}</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{student.reg_number}</td>
                        <td>{student.full_name}</td>
                        <td>
                          <span className="badge-class">{student.class_name || student.class || 'L4 ETE'}</span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button 
                              onClick={() => handleDelete(student.id, student.full_name)} 
                              className="action-btn-delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredStudents.length > 0 && (
              <div className="pagination-footer">
                <div className="pagination-info">
                  Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredStudents.length)}</strong> of <strong>{filteredStudents.length}</strong> entries
                </div>
                
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="page-btn" 
                      onClick={() => paginate(currentPage - 1)} 
                      disabled={currentPage === 1}
                    >
                      &laquo; Prev
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => paginate(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button 
                      className="page-btn" 
                      onClick={() => paginate(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    >
                      Next &raquo;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}