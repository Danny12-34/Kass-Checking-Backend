import React, { useState, useEffect } from 'react';
import Sidebar from './DisciplineSidebar';

function AllStudentsMaterialsView() {
    const [students, setStudents] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState('Term 1');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Track which student's details are opened in the full page view (null means showing student list)
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Pagination state for students list
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 8; // 4 columns x 2 rows

    useEffect(() => {
        fetchData();
    }, [selectedTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch master materials configuration list
            const matRes = await fetch('http://localhost:5000/api/v1/getall');
            if (!matRes.ok) throw new Error('Failed to fetch materials configuration');
            const matData = await matRes.json();
            setMaterials(matData);

            // 2. Fetch all students with their material checks for the given term
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

    // Filter students based on reg_number or Name matching the search input
    const filteredStudents = students.filter(student => {
        const studentName = (student.full_name || `${student.first_name || ''} ${student.last_name || ''}`).toLowerCase();
        const regNumber = String(student.reg_number || '').toLowerCase();
        const query = searchTerm.toLowerCase().trim();

        return studentName.includes(query) || regNumber.includes(query);
    });

    // Pagination calculations
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="loading-state">Loading all student material records...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;

    return (
        <>
        <Sidebar />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

                body {
                    margin: 0;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: #1e293b;
                }
                .portal-container {
                    padding: 35px;
                    max-width: 1320px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                }
                .header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 20px;
                }
                .header-flex h2 {
                    margin: 0;
                    color: #0f172a;
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }
                .controls-group {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .search-input {
                    padding: 11px 16px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    width: 270px;
                    font-size: 14px;
                    outline: none;
                    background: #ffffff;
                    color: #334155;
                    transition: all 0.25s ease;
                }
                .search-input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
                }
                .term-select-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #f8fafc;
                    padding: 4px 12px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                }
                .term-select-group label {
                    font-weight: 600;
                    color: #475569;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .term-select-group select {
                    padding: 7px 10px;
                    border-radius: 8px;
                    border: none;
                    font-size: 14px;
                    font-weight: 600;
                    background-color: transparent;
                    color: #0f172a;
                    outline: none;
                    cursor: pointer;
                }
                /* 4 Columns Grid System */
                .cards-grid, .details-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                @media (max-width: 1100px) {
                    .cards-grid, .details-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 650px) {
                    .cards-grid, .details-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .student-card {
                    background: linear-gradient(145deg, #ffffff 0%, #fbfcfe 100%);
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 22px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 18px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
                }
                .student-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px -4px rgba(99, 102, 241, 0.1);
                    border-color: #a5b4fc;
                }
                .student-card-info h4 {
                    margin: 0 0 6px 0;
                    color: #0f172a;
                    font-size: 17px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                }
                .student-card-info p {
                    margin: 0;
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 500;
                }
                .action-btn-primary {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13.5px;
                    text-align: center;
                    transition: all 0.2s ease;
                    width: 100%;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                }
                .action-btn-primary:hover {
                    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
                    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.35);
                    transform: translateY(-1px);
                }
                .back-btn {
                    background: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    color: #334155;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 25px;
                    padding: 8px 16px;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }
                .back-btn:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .student-info-banner {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    padding: 24px;
                    border-radius: 14px;
                    margin-bottom: 25px;
                    border: 1px solid #cbd5e1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                .student-info-banner h3 {
                    margin: 0 0 6px 0;
                    color: #0f172a;
                    font-size: 22px;
                    font-weight: 700;
                }
                .student-info-banner p {
                    margin: 0;
                    color: #475569;
                    font-size: 14px;
                    font-weight: 500;
                }
                /* Material Detail Card Style */
                .material-detail-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 14px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                    transition: all 0.2s ease;
                }
                .material-detail-card:hover {
                    border-color: #cbd5e1;
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.04);
                }
                .rating-badge {
                    display: inline-block;
                    padding: 5px 12px;
                    border-radius: 30px;
                    font-weight: 700;
                    font-size: 11.5px;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                }
                .rating-complete {
                    background-color: #ecfdf5;
                    color: #059669;
                    border: 1px solid #a7f3d0;
                }
                .rating-partial {
                    background-color: #fffbeb;
                    color: #d97706;
                    border: 1px solid #fde68a;
                }
                .rating-lacking {
                    background-color: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }
                /* Pagination styles */
                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    margin-top: 35px;
                }
                .page-btn {
                    background-color: #ffffff;
                    color: #475569;
                    border: 1px solid #cbd5e1;
                    padding: 8px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13.5px;
                    transition: all 0.2s ease;
                }
                .page-btn:hover {
                    background-color: #f8fafc;
                    border-color: #94a3b8;
                    color: #0f172a;
                }
                .page-btn.active {
                    background-color: #6366f1;
                    color: white;
                    border-color: #6366f1;
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
                }
                .page-btn:disabled {
                    background-color: #f8fafc;
                    color: #cbd5e1;
                    border-color: #e2e8f0;
                    cursor: not-allowed;
                }
                .empty-state {
                    text-align: center;
                    color: #94a3b8;
                    padding: 50px;
                    font-style: italic;
                    grid-column: 1 / -1;
                    font-size: 15px;
                    font-weight: 500;
                }
                .loading-state, .error-state {
                    padding: 50px;
                    text-align: center;
                    font-size: 17px;
                    font-weight: 600;
                }
                .error-state {
                    color: #dc2626;
                }
            `}</style>

            <div className="portal-container">
                {selectedStudent ? (
                    // Detail Page View for a Single Student (4-Column Layout)
                    <div>
                        <button onClick={() => setSelectedStudent(null)} className="back-btn">
                            &larr; Back to Students List
                        </button>

                        {/* Calculate Overall Summary for the selected student */}
                        {(() => {
                            let totalRequiredSum = 0;
                            let totalPresentSum = 0;
                            materials.forEach(mat => {
                                const record = selectedStudent.material_checks?.find(c => c.material_name === mat.material);
                                totalRequiredSum += Number(mat.minimum) || 0;
                                if (record && record.present_material !== undefined && record.present_material !== '') {
                                    totalPresentSum += Number(record.present_material) || 0;
                                }
                            });

                            let overallPercentage = totalRequiredSum > 0 ? Math.round((totalPresentSum / totalRequiredSum) * 100) : 0;
                            if (overallPercentage > 100) overallPercentage = 100;

                            let overallGrade = 'F';
                            let overallRating = 'Poor';
                            let overallBadgeClass = 'rating-lacking';

                            if (overallPercentage >= 90) {
                                overallGrade = 'A+'; overallRating = 'Outstanding'; overallBadgeClass = 'rating-complete';
                            } else if (overallPercentage >= 80) {
                                overallGrade = 'A'; overallRating = 'Excellent'; overallBadgeClass = 'rating-complete';
                            } else if (overallPercentage >= 70) {
                                overallGrade = 'B'; overallRating = 'Good'; overallBadgeClass = 'rating-complete';
                            } else if (overallPercentage >= 60) {
                                overallGrade = 'C'; overallRating = 'Fair'; overallBadgeClass = 'rating-partial';
                            } else if (overallPercentage >= 50) {
                                overallGrade = 'D'; overallRating = 'Pass'; overallBadgeClass = 'rating-partial';
                            } else {
                                overallGrade = 'F'; overallRating = 'Needs Improvement'; overallBadgeClass = 'rating-lacking';
                            }

                            return (
                                <div className="student-info-banner">
                                    <div>
                                        <h3>{selectedStudent.full_name || `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`}</h3>
                                        <p>Reg No: <strong style={{ color: '#0f172a' }}>{selectedStudent.reg_number || 'N/A'}</strong></p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div>
                                            <p style={{ fontSize: '13.5px' }}>Current Term: <strong style={{ color: '#6366f1' }}>{selectedTerm}</strong></p>
                                        </div>
                                        <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Overall Score</div>
                                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{totalPresentSum} / {totalRequiredSum} ({overallPercentage}%)</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Overall Grade</div>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#4f46e5' }}>{overallGrade}</span>
                                                    <span className={`rating-badge ${overallBadgeClass}`} style={{ padding: '2px 8px', fontSize: '10.5px' }}>{overallRating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <h3 style={{ color: '#0f172a', fontSize: '19px', fontWeight: '700', marginBottom: '20px' }}>Material Breakdown & Status</h3>

                        {materials.length === 0 ? (
                            <div className="empty-state">No materials configured.</div>
                        ) : (
                            <div className="details-grid">
                                {materials.map(mat => {
                                    const record = selectedStudent.material_checks?.find(c => c.material_name === mat.material);
                                    const presentVal = record && record.present_material !== undefined && record.present_material !== '' ? record.present_material : '-';
                                    
                                    const minRequired = Number(mat.minimum) || 1;
                                    const currentNum = presentVal !== '-' ? Number(presentVal) || 0 : 0;
                                    
                                    let percentage = Math.round((currentNum / minRequired) * 100);
                                    if (percentage > 100) percentage = 100;

                                    let grade = 'F';
                                    let ratingDesc = 'Poor';
                                    let badgeClass = 'rating-lacking';
                                    let statusText = 'Pending';

                                    if (presentVal !== '-') {
                                        if (percentage >= 100) {
                                            grade = 'A';
                                            ratingDesc = 'Excellent';
                                            badgeClass = 'rating-complete';
                                            statusText = 'Complete';
                                        } else if (percentage >= 75) {
                                            grade = 'B';
                                            ratingDesc = 'Good';
                                            badgeClass = 'rating-complete';
                                            statusText = 'Complete';
                                        } else if (percentage >= 50) {
                                            grade = 'C';
                                            ratingDesc = 'Fair';
                                            badgeClass = 'rating-partial';
                                            statusText = 'Partial';
                                        } else if (percentage >= 25) {
                                            grade = 'D';
                                            ratingDesc = 'Low';
                                            badgeClass = 'rating-partial';
                                            statusText = 'Partial';
                                        } else {
                                            grade = 'E';
                                            ratingDesc = 'Very Low';
                                            badgeClass = 'rating-lacking';
                                            statusText = 'Lacking';
                                        }
                                    }

                                    return (
                                        <div key={mat.id} className="material-detail-card">
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px', marginBottom: '6px' }}>{mat.material}</div>
                                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Min Required: <strong style={{ color: '#334155' }}>{mat.minimum}</strong></div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Present: {presentVal}</span>
                                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5' }}>{presentVal !== '-' ? `${percentage}%` : '0%'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Grade: <strong style={{ color: '#0f172a' }}>{presentVal !== '-' ? grade : '-'} ({ratingDesc})</strong></span>
                                                    <span className={`rating-badge ${badgeClass}`}>
                                                        {statusText}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div style={{ marginTop: '30px' }}>
                            <button 
                                onClick={() => setSelectedStudent(null)} 
                                className="action-btn-primary"
                                style={{ backgroundColor: '#475569', padding: '12px 24px', fontSize: '14px', width: 'auto' }}
                            >
                                Back to List
                            </button>
                        </div>
                    </div>
                ) : (
                    // Main Students List Page View (4-Column Grid)
                    <div>
                        <div className="header-flex">
                            <h2>All Students Material Status Records</h2>
                            
                            <div className="controls-group">
                                {/* Search Input Box */}
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="Search by Reg Number or Name..." 
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="search-input"
                                    />
                                </div>

                                {/* Term Selector */}
                                <div className="term-select-group">
                                    <label>Term:</label>
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

                        <div className="cards-grid">
                            {currentStudents.length === 0 ? (
                                <div className="empty-state">No matching student records found.</div>
                            ) : (
                                currentStudents.map(student => {
                                    const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Student';
                                    
                                    // Calculation for overall summary status preview & percentage
                                    let totalRequiredSum = 0;
                                    let totalPresentSum = 0;
                                    materials.forEach(mat => {
                                        const record = student.material_checks?.find(c => c.material_name === mat.material);
                                        totalRequiredSum += Number(mat.minimum) || 0;
                                        if (record && record.present_material !== undefined && record.present_material !== '') {
                                            totalPresentSum += Number(record.present_material) || 0;
                                        }
                                    });

                                    let overallPercentage = totalRequiredSum > 0 ? Math.round((totalPresentSum / totalRequiredSum) * 100) : 0;
                                    if (overallPercentage > 100) overallPercentage = 100;

                                    let overallGrade = 'F';
                                    let badgeClass = 'rating-lacking';
                                    let badgeText = 'Pending';
                                    
                                    if (materials.length > 0) {
                                        if (overallPercentage >= 80) {
                                            badgeClass = 'rating-complete';
                                            badgeText = `Overall: A (${overallPercentage}%)`;
                                        } else if (overallPercentage >= 60) {
                                            badgeClass = 'rating-complete';
                                            badgeText = `Overall: B (${overallPercentage}%)`;
                                        } else if (overallPercentage >= 40) {
                                            badgeClass = 'rating-partial';
                                            badgeText = `Overall: C (${overallPercentage}%)`;
                                        } else {
                                            badgeClass = 'rating-lacking';
                                            badgeText = `Overall: F (${overallPercentage}%)`;
                                        }
                                    }

                                    return (
                                        <div key={student.id || student.reg_number} className="student-card">
                                            <div className="student-card-info">
                                                <h4>{studentName}</h4>
                                                <p>Reg No: <span style={{ color: '#334155', fontWeight: '600' }}>{student.reg_number || 'N/A'}</span></p>
                                                <div style={{ marginTop: '12px' }}>
                                                    <span className={`rating-badge ${badgeClass}`}>
                                                        {badgeText}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedStudent(student)}
                                                className="action-btn-primary"
                                            >
                                                View Info Page
                                            </button>
                                        </div>
                                    );
                                })
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

export default AllStudentsMaterialsView;