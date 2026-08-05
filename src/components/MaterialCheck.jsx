import React, { useState, useEffect } from 'react';
import Sidebar from './DisciplineSidebar';

function StudentMaterialsCheck() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('Term 1');
    const [students, setStudents] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeStudent, setActiveStudent] = useState(null);
    const [saving, setSaving] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchStudentsAndMaterials();
        }
    }, [selectedClass, selectedTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedClass]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const matRes = await fetch('http://localhost:5000/api/v1/getall');
            if (!matRes.ok) throw new Error('Failed to fetch materials configuration');
            const matData = await matRes.json();
            setMaterials(matData);

            const classRes = await fetch('http://localhost:5000/api/v1/classes');
            if (!classRes.ok) throw new Error('Failed to fetch classes list');
            const classData = await classRes.json();

            const uniqueClasses = classData.map(c => typeof c === 'object' ? (c.class_name || c.name || c.id) : c).filter(Boolean);
            setClasses(uniqueClasses);

            if (uniqueClasses.length > 0) {
                setSelectedClass(uniqueClasses[0]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentsAndMaterials = async () => {
        try {
            setLoading(true);
            const studRes = await fetch(`http://localhost:5000/api/v1/get-students-materials?class=${encodeURIComponent(selectedClass)}&term=${selectedTerm}`);
            if (!studRes.ok) throw new Error('Failed to fetch student material records');
            const studData = await studRes.json();
            setStudents(studData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSaveAll = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            
            const promises = materials.map(mat => {
                const record = activeStudent.material_checks?.find(c => c.material_name === mat.material) || {};
                const presentValue = record.present_material !== undefined && record.present_material !== '' ? Number(record.present_material) : 0;

                return fetch('http://localhost:5000/api/v1/check-materials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_id: activeStudent.id,
                        term: selectedTerm,
                        class_id: selectedClass,
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

            setActiveStudent(null);
            fetchStudentsAndMaterials();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const studentClass = student.class_name || student.class || student.class_id || '';
        if (selectedClass && studentClass && String(studentClass).trim().toLowerCase() !== String(selectedClass).trim().toLowerCase()) {
            return false;
        }

        const fullName = (student.full_name || `${student.first_name || ''} ${student.last_name || ''}`).toLowerCase();
        const regNumber = (student.reg_number || '').toLowerCase();
        const query = searchTerm.toLowerCase();

        return fullName.includes(query) || regNumber.includes(query);
    });

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading && students.length === 0 && classes.length === 0) {
        return (
            <div className="portal-layout">
                <Sidebar />
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Initializing enterprise modules...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="portal-layout">
                <Sidebar />
                <div className="error-screen">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>System Error: {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="portal-layout">
            <Sidebar />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

                * {
                    box-sizing: border-box;
                }
                body {
                    margin: 0;
                    background-color: #f1f5f9;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: #0f172a;
                }
                .portal-layout {
                    display: flex;
                    min-height: 100vh;
                }
                .portal-main {
                    flex: 1;
                    padding: 40px;
                    width: 100%;
                    max-width: none;
                    margin: 0;
                }
                .enterprise-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #ffffff;
                    padding: 24px 32px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
                    margin-bottom: 28px;
                    border: 1px solid #e2e8f0;
                }
                .header-title-wrapper h2 {
                    margin: 0 0 4px 0;
                    font-size: 24px;
                    font-weight: 700;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }
                .header-title-wrapper p {
                    margin: 0;
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 500;
                }
                .controls-toolbar {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }
                .control-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .control-group label {
                    font-size: 11px;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .control-group select {
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .control-group select:hover {
                    border-color: #94a3b8;
                    background: #fff;
                }
                .control-group select:focus {
                    border-color: #0284c7;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.1);
                }
                .workspace-card {
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                    padding: 32px;
                    width: 100%;
                }
                .search-filter-box {
                    position: relative;
                    margin-bottom: 24px;
                }
                .search-filter-box input {
                    width: 100%;
                    padding: 14px 16px 14px 48px;
                    border-radius: 12px;
                    border: 1px solid #cbd5e1;
                    font-size: 14px;
                    font-weight: 500;
                    outline: none;
                    background: #f8fafc;
                    transition: all 0.2s;
                }
                .search-filter-box input:focus {
                    border-color: #0284c7;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.1);
                }
                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }
                .students-data-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                .student-node-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 20px;
                    transition: all 0.25s ease;
                }
                .student-node-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                    border-color: #cbd5e1;
                }
                .student-meta-top {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .student-name {
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 16px;
                }
                .student-regno {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 600;
                }
                .metric-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    width: fit-content;
                }
                .metric-pill.complete {
                    background: #f0fdf4;
                    color: #166534;
                    border: 1px solid #bbf7d0;
                }
                .metric-pill.pending {
                    background: #f8fafc;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                }
                .btn-primary {
                    background: #0f172a;
                    color: #ffffff;
                    border: none;
                    padding: 12px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .btn-primary:hover {
                    background: #1e293b;
                }
                .btn-secondary {
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #cbd5e1;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background: #e2e8f0;
                }
                .btn-success {
                    background: #10b981;
                    color: #ffffff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-success:hover {
                    background: #059669;
                }
                .btn-success:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                }
                .back-nav-btn {
                    background: none;
                    border: none;
                    color: #0284c7;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0;
                    margin-bottom: 24px;
                }
                .back-nav-btn:hover {
                    color: #0369a1;
                }
                .active-student-profile {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 24px;
                    margin-bottom: 28px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .profile-details h2 {
                    margin: 0 0 6px 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .profile-details p {
                    margin: 0;
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 500;
                }
                .checklist-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .checklist-item-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .checklist-item-card label {
                    font-weight: 700;
                    font-size: 15px;
                    color: #1e293b;
                }
                .item-requirement {
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                }
                .checklist-item-card input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    font-size: 14px;
                    font-weight: 600;
                    background: #fff;
                    outline: none;
                    transition: all 0.2s;
                }
                .checklist-item-card input:focus {
                    border-color: #0284c7;
                    box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.1);
                }
                .form-action-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 24px;
                }
                .pagination-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 32px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                }
                .pagination-controls {
                    display: flex;
                    gap: 6px;
                }
                .page-number-btn {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    color: #334155;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .page-number-btn:hover {
                    background: #f1f5f9;
                }
                .page-number-btn.active {
                    background: #0f172a;
                    color: #fff;
                    border-color: #0f172a;
                }
                .page-number-btn:disabled {
                    background: #f8fafc;
                    color: #cbd5e1;
                    border-color: #e2e8f0;
                    cursor: not-allowed;
                }
                .empty-block {
                    text-align: center;
                    padding: 64px 0;
                    color: #94a3b8;
                    font-weight: 500;
                    grid-column: 1 / -1;
                }
                .loading-screen, .error-screen {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    font-weight: 600;
                    color: #475569;
                }
                .error-screen {
                    color: #ef4444;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e2e8f0;
                    border-top-color: #0f172a;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <main className="portal-main">
                {activeStudent ? (
                    <div className="workspace-card">
                        <button onClick={() => setActiveStudent(null)} className="back-nav-btn">
                            &larr; Back to Students List
                        </button>

                        <div className="active-student-profile">
                            <div className="profile-details">
                                <h2>{activeStudent.full_name || `${activeStudent.first_name} ${activeStudent.last_name}`}</h2>
                                <p>Reg No: <strong>{activeStudent.reg_number || 'N/A'}</strong> &bull; Class: <strong>{selectedClass}</strong> &bull; Term: <strong>{selectedTerm}</strong></p>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>Materials Verification Checklist</h3>
                        
                        <form onSubmit={handleSaveAll}>
                            <div className="checklist-grid">
                                {materials.length === 0 ? (
                                    <div className="empty-block">No materials configured in system inventory.</div>
                                ) : (
                                    materials.map(mat => {
                                        const record = activeStudent.material_checks?.find(c => c.material_name === mat.material) || {};
                                        const presentValue = record.present_material !== undefined ? record.present_material : '';

                                        return (
                                            <div key={mat.id} className="checklist-item-card">
                                                <label>{mat.material}</label>
                                                <div className="item-requirement">Minimum Required: {mat.minimum}</div>
                                                <input 
                                                    type="number" 
                                                    value={presentValue}
                                                    onChange={(e) => handlePresentChange(mat.material, e.target.value)}
                                                    placeholder="Count present..."
                                                    required
                                                />
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="form-action-footer">
                                <button type="button" onClick={() => setActiveStudent(null)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="btn-success">
                                    {saving ? 'Saving Records...' : 'Save All Records'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <div className="enterprise-header">
                            <div className="header-title-wrapper">
                               <h2>Student Materials Check</h2>
                               <p>Manage and track physical resource distribution per academic term.</p>
                            </div>
                            <div className="controls-toolbar">
                                <div className="control-group">
                                    <label>Academic Class</label>
                                    <select 
                                        value={selectedClass} 
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                    >
                                        {classes.length === 0 ? (
                                            <option value="">No classes loaded</option>
                                        ) : (
                                            classes.map((cls, idx) => (
                                                <option key={idx} value={cls}>{cls}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div className="control-group">
                                    <label>Active Term</label>
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
                        </div>

                        <div className="workspace-card">
                            <div className="search-filter-box">
                                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                <input 
                                    type="text"
                                    placeholder="Filter by student full name or registration identifier..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="students-data-grid">
                                {loading ? (
                                    <div className="empty-block">Loading academic records...</div>
                                ) : currentStudents.length === 0 ? (
                                    <div className="empty-block">No students match current class and search criteria.</div>
                                ) : (
                                    currentStudents.map(student => {
                                        const checkedCount = student.material_checks?.filter(c => c.present_material !== undefined && c.present_material !== '').length || 0;
                                        const totalMaterials = materials.length;
                                        const isComplete = totalMaterials > 0 && checkedCount >= totalMaterials;

                                        return (
                                            <div key={student.id} className="student-node-card">
                                                <div className="student-meta-top">
                                                    <div className="student-name">
                                                        {student.full_name || `${student.first_name} ${student.last_name}`}
                                                    </div>
                                                    <div className="student-regno">
                                                        Reg: {student.reg_number || 'N/A'}
                                                    </div>
                                                    <div style={{ marginTop: '8px' }}>
                                                        <span className={`metric-pill ${isComplete ? 'complete' : 'pending'}`}>
                                                            {isComplete ? 'Verified' : `${checkedCount}/${totalMaterials} Checked`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setActiveStudent(student)}
                                                    className="btn-primary"
                                                >
                                                    Click to Check
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination-container">
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                                        Showing page {currentPage} of {totalPages}
                                    </div>
                                    <div className="pagination-controls">
                                        <button 
                                            className="page-number-btn" 
                                            onClick={() => paginate(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                        >
                                            Prev
                                        </button>

                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNum = index + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                    onClick={() => paginate(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button 
                                            className="page-number-btn" 
                                            onClick={() => paginate(currentPage + 1)} 
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default StudentMaterialsCheck;