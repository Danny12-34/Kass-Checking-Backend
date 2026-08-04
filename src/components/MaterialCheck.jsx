import React, { useState, useEffect } from 'react';

function StudentMaterialsCheck() {
    const [students, setStudents] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState('Term 1');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Track which student is currently being checked (null means showing the student list)
    const [activeStudent, setActiveStudent] = useState(null);
    const [saving, setSaving] = useState(false);

    // Pagination for student list
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 5;

    useEffect(() => {
        fetchData();
    }, [selectedTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Fetch master materials list
            const matRes = await fetch('http://localhost:5000/api/v1/getall');
            if (!matRes.ok) throw new Error('Failed to fetch materials configuration');
            const matData = await matRes.json();
            setMaterials(matData);

            // 2. Fetch students with their material checks for the selected term
            const studRes = await fetch(`http://localhost:5000/api/v1/get-students-materials?term=${selectedTerm}`);
            if (!studRes.ok) throw new Error('Failed to fetch student material records');
            const studData = await studRes.json();
            setStudents(studData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle input change for a specific material on the active student
    const handlePresentChange = (materialName, value) => {
        setActiveStudent(prev => {
            const existingChecks = prev.material_checks || [];
            const checkIndex = existingChecks.findIndex(c => c.material_name === materialName);

            let updatedChecks = [...existingChecks];
            if (checkIndex > -1) {
                updatedChecks[checkIndex] = { ...updatedChecks[checkIndex], present_material: value === '' ? '' : Number(value) };
            } else {
                updatedChecks.push({ material_name: materialName, present_material: value === '' ? '' : Number(value) });
            }

            return { ...prev, material_checks: updatedChecks };
        });
    };

    // Save ALL material checks for the active student at once
    const handleSaveAll = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            
            // Loop through all master materials and send their current inputs to the backend
            const promises = materials.map(mat => {
                const record = activeStudent.material_checks?.find(c => c.material_name === mat.material) || {};
                const presentValue = record.present_material !== undefined && record.present_material !== '' ? Number(record.present_material) : 0;

                return fetch('http://localhost:5000/api/v1/check-materials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_id: activeStudent.id,
                        term: selectedTerm,
                        material_name: mat.material,
                        minimum: Number(mat.minimum),
                        present_material: presentValue
                    })
                });
            });

            const responses = await Promise.all(promises);
            for (let res of responses) {
                if (!res.ok) throw new Error('Failed to update some material checks');
            }

            alert('All materials saved successfully!');
            setActiveStudent(null);
            fetchData(); // Refresh main list data
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Pagination calculations for students list
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(students.length / studentsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="loading-state">Loading student materials...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;

    return (
        <>
            <style>{`
                body {
                    margin: 0;
                    background-color: #f4f6f9;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .portal-container {
                    padding: 30px;
                    max-width: 900px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }
                .header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                    border-bottom: 2px solid #edf2f7;
                    padding-bottom: 15px;
                }
                .header-flex h2 {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 22px;
                }
                .term-select-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .term-select-group label {
                    font-weight: 600;
                    color: #4a5568;
                    font-size: 14px;
                }
                .term-select-group select {
                    padding: 8px 12px;
                    border-radius: 6px;
                    border: 1px solid #cbd5e1;
                    font-size: 14px;
                    background-color: white;
                    color: #334155;
                    outline: none;
                }
                .term-select-group select:focus {
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
                }
                .back-btn {
                    background: none;
                    border: none;
                    color: #3498db;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    margin-bottom: 20px;
                    padding: 0;
                }
                .back-btn:hover {
                    color: #2980b9;
                    text-decoration: underline;
                }
                .student-info-card {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                    border: 1px solid #e2e8f0;
                }
                .student-info-card h2 {
                    margin: 0 0 5px 0;
                    color: #1e293b;
                    font-size: 20px;
                }
                .student-info-card p {
                    margin: 0;
                    color: #64748b;
                    font-size: 14px;
                }
                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 20px;
                    margin-bottom: 25px;
                }
                .student-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .student-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.05);
                    border-color: #cbd5e1;
                }
                .student-card-name {
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 16px;
                    margin-bottom: 15px;
                }
                .action-btn-green {
                    background-color: #2ecc71;
                    color: white;
                    border: none;
                    padding: 8px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13px;
                    text-align: center;
                    transition: background 0.2s;
                }
                .action-btn-green:hover {
                    background-color: #27ae60;
                }
                /* Material Fields Grid Layout */
                .materials-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 15px;
                    margin-bottom: 25px;
                }
                .material-field-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .material-field-card label {
                    font-weight: 600;
                    color: #334155;
                    font-size: 13px;
                }
                .material-meta {
                    font-size: 12px;
                    color: #64748b;
                }
                .material-field-card input {
                    width: 100%;
                    padding: 9px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    box-sizing: border-box;
                    font-size: 14px;
                    background: #ffffff;
                }
                .material-field-card input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
                }
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    border-top: 1px solid #edf2f7;
                    padding-top: 20px;
                }
                .btn-cancel {
                    background-color: #e2e8f0;
                    color: #475569;
                    border: none;
                    padding: 9px 18px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                }
                .btn-cancel:hover {
                    background-color: #cbd5e1;
                }
                /* Pagination styles */
                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                    margin-top: 25px;
                }
                .page-btn {
                    background-color: #ffffff;
                    color: #334155;
                    border: 1px solid #cbd5e1;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                .page-btn:hover {
                    background-color: #f1f5f9;
                    border-color: #94a3b8;
                }
                .page-btn.active {
                    background-color: #34495e;
                    color: white;
                    border-color: #34495e;
                }
                .page-btn:disabled {
                    background-color: #f8fafc;
                    color: #cbd5e1;
                    border-color: #e2e8f0;
                    cursor: not-allowed;
                }
                .empty-state {
                    text-align: center;
                    color: #7f8c8d;
                    padding: 40px;
                    font-style: italic;
                    grid-column: 1 / -1;
                }
                .loading-state, .error-state {
                    padding: 40px;
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                }
                .error-state {
                    color: #e74c3c;
                }
            `}</style>

            <div className="portal-container">
                {activeStudent ? (
                    // View 2: Detailed Material Check Form for a Single Student (Card/Field Grid layout)
                    <div>
                        <button onClick={() => setActiveStudent(null)} className="back-btn">
                            &larr; Back to Students List
                        </button>

                        <div className="student-info-card">
                            <h2>
                                {activeStudent.full_name || `${activeStudent.first_name} ${activeStudent.last_name}`}
                            </h2>
                            <p>Term: <strong>{selectedTerm}</strong></p>
                        </div>

                        <h3 style={{ color: '#2c3e50', fontSize: '18px', marginBottom: '15px' }}>Materials Checklist</h3>
                        
                        <form onSubmit={handleSaveAll}>
                            <div className="materials-grid">
                                {materials.length === 0 ? (
                                    <div className="empty-state">No materials found in configuration.</div>
                                ) : (
                                    materials.map(mat => {
                                        const record = activeStudent.material_checks?.find(c => c.material_name === mat.material) || {};
                                        const presentValue = record.present_material !== undefined ? record.present_material : '';

                                        return (
                                            <div key={mat.id} className="material-field-card">
                                                <label>{mat.material}</label>
                                                <div className="material-meta">Minimum Required: {mat.minimum}</div>
                                                <input 
                                                    type="number" 
                                                    value={presentValue}
                                                    onChange={(e) => handlePresentChange(mat.material, e.target.value)}
                                                    placeholder="Enter present count"
                                                    required
                                                />
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setActiveStudent(null)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="action-btn-green" style={{ padding: '9px 20px', fontSize: '14px' }}>
                                    {saving ? 'Saving...' : 'Save All Materials'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // View 1: Main Grid of Students Cards with Term Selector
                    <div>
                        <div className="header-flex">
                            <h2>Students List</h2>
                            <div className="term-select-group">
                                <label>Select Term:</label>
                                <select 
                                    value={selectedTerm} 
                                    onChange={(e) => setSelectedTerm(e.target.value)}
                                >
                                    <option value="Term 1">Term 1</option>
                                    <option value="Term 2">Term 2</option>
                                    <option value="Term 3">Term 3</option>
                                </select>
                            </div>
                        </div>

                        <div className="cards-grid">
                            {currentStudents.length === 0 ? (
                                <div className="empty-state">No students found.</div>
                            ) : (
                                currentStudents.map(student => (
                                    <div key={student.id} className="student-card">
                                        <div className="student-card-name">
                                            {student.full_name || `${student.first_name} ${student.last_name}`}
                                        </div>
                                        <button 
                                            onClick={() => setActiveStudent(student)}
                                            className="action-btn-green"
                                        >
                                            Check Material
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Controls */}
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
        </>
    );
}

export default StudentMaterialsCheck;