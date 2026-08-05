import React, { useState, useEffect } from 'react';
import Sidebar from './DisciplineSidebar';

function MaterialsList() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state for adding/editing a material
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [materialName, setMaterialName] = useState('');
    const [minimum, setMinimum] = useState('');
    
    // Exception Rules State
    const [targetGroup, setTargetGroup] = useState('All'); 
    const [levelType, setLevelType] = useState('General'); 
    const [levelSpecificMins, setLevelSpecificMins] = useState({ oLevel: '', aLevel: '' });
    const [frequency, setFrequency] = useState('Per Term'); 

    // Pagination state (Updated to 10 items per page)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch materials on component mount
    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/v1/getall');
            if (!response.ok) throw new Error('Failed to fetch materials');
            const data = await response.json();
            setMaterials(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (material = null) => {
        if (material) {
            setEditId(material.id);
            setMaterialName(material.material || material.materialName || '');
            setMinimum(material.minimum ?? '');
            setTargetGroup(material.targetGroup || 'All');
            setLevelType(material.levelType || 'General');
            setLevelSpecificMins(material.levelSpecificMins || { oLevel: '', aLevel: '' });
            setFrequency(material.frequency || 'Per Term');
        } else {
            setEditId(null);
            setMaterialName('');
            setMinimum('');
            setTargetGroup('All');
            setLevelType('General');
            setLevelSpecificMins({ oLevel: '', aLevel: '' });
            setFrequency('Per Term');
        }
        setShowModal(true);
    };

    const handleSaveMaterial = async (e) => {
        e.preventDefault();
        try {
            const url = editId ? `http://localhost:5000/api/v1/update/${editId}` : 'http://localhost:5000/api/v1/create';
            const method = editId ? 'PUT' : 'POST';

            const payload = {
                material: materialName,
                minimum: levelType === 'Level Dependent' ? 0 : Number(minimum),
                targetGroup,
                levelType,
                levelSpecificMins: levelType === 'Level Dependent' ? levelSpecificMins : null,
                frequency
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to save material');

            setShowModal(false);
            fetchMaterials();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteMaterial = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material configuration?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/v1/delete/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete material');
            fetchMaterials();
        } catch (err) {
            alert(err.message);
        }
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMaterials = materials.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(materials.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return (
        <div className="layout-flex-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar />
            <div className="state-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner"></div>
                <p>Loading materials inventory...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="layout-flex-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar />
            <div className="state-container error-state" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p>⚠️ Error: {error}</p>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar />
            
            <div style={{ flex: 1, padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                    .materials-container {
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
                        margin: 4px 0 0 0;
                        color: #64748b;
                        font-size: 13px;
                    }

                    .add-btn {
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        color: white;
                        padding: 10px 18px;
                        border: none;
                        cursor: pointer;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 14px;
                        box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                        transition: all 0.2s ease;
                    }

                    .add-btn:hover {
                        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                        box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3);
                        transform: translateY(-1px);
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

                    .badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 4px 10px;
                        border-radius: 9999px;
                        font-size: 11px;
                        font-weight: 600;
                        letter-spacing: 0.025em;
                    }

                    .badge-target { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
                    .badge-level { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
                    .badge-freq { background: #fdf4ff; color: #701a75; border: 1px solid #f5d0fe; }

                    .action-btns {
                        display: flex;
                        gap: 8px;
                        justify-content: flex-end;
                    }

                    .action-btn-edit {
                        background-color: #eff6ff;
                        color: #2563eb;
                        border: 1px solid #bfdbfe;
                        padding: 6px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 12px;
                        transition: all 0.2s;
                    }

                    .action-btn-edit:hover {
                        background-color: #dbeafe;
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

                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(15, 23, 42, 0.6);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                        backdrop-filter: blur(4px);
                        animation: fadeIn 0.2s ease-out;
                    }

                    .modal-card {
                        background: white;
                        padding: 32px;
                        border-radius: 16px;
                        width: 100%;
                        max-width: 500px;
                        max-height: 90vh;
                        overflow-y: auto;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        animation: slideUp 0.2s ease-out;
                    }

                    .modal-card h3 {
                        margin-top: 0;
                        color: #0f172a;
                        font-size: 18px;
                        font-weight: 700;
                        margin-bottom: 24px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid #f1f5f9;
                    }

                    .form-group {
                        margin-bottom: 20px;
                    }

                    .form-group label {
                        display: block;
                        margin-bottom: 8px;
                        color: #334155;
                        font-weight: 600;
                        font-size: 13px;
                    }

                    .form-group input, .form-group select {
                        width: 100%;
                        padding: 10px 14px;
                        border: 1px solid #cbd5e1;
                        border-radius: 8px;
                        box-sizing: border-box;
                        font-size: 14px;
                        color: #0f172a;
                        background-color: #f8fafc;
                        transition: all 0.2s;
                    }

                    .form-group input:focus, .form-group select:focus {
                        outline: none;
                        background-color: #ffffff;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                    }

                    .row-group {
                        display: flex;
                        gap: 16px;
                    }

                    .modal-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 12px;
                        margin-top: 32px;
                        padding-top: 16px;
                        border-top: 1px solid #f1f5f9;
                    }

                    .btn-cancel {
                        background-color: #f1f5f9;
                        color: #475569;
                        border: none;
                        padding: 10px 18px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        transition: background 0.2s;
                    }

                    .btn-cancel:hover {
                        background-color: #e2e8f0;
                    }

                    .btn-save {
                        background-color: #2563eb;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                        transition: background 0.2s;
                    }

                    .btn-save:hover {
                        background-color: #1d4ed8;
                    }

                    .spinner {
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #3b82f6;
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

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideUp {
                        from { transform: translateY(10px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}</style>

                <div className="materials-container">
                    <div className="header-flex">
                        <div className="header-title">
                            <h2>Materials Management Portal</h2>
                            <p>Configure requirements, gender criteria, level dependencies, and frequency rules.</p>
                        </div>
                        <button onClick={() => handleOpenModal()} className="add-btn">
                            + Add New Material
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Material Name</th>
                                    <th>Minimum Required</th>
                                    <th>Target Group</th>
                                    <th>Level & Frequency Rules</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentMaterials.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">No materials found in system configuration.</td>
                                    </tr>
                                ) : (
                                    currentMaterials.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: '600', color: '#0f172a' }}>{item.material}</td>
                                            <td>
                                                {item.levelType === 'Level Dependent' ? (
                                                    <span style={{ fontSize: '13px', color: '#334155' }}>
                                                        O-L: <strong>{item.levelSpecificMins?.oLevel || 0}</strong> &nbsp;|&nbsp; A-L: <strong>{item.levelSpecificMins?.aLevel || 0}</strong>
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#334155', fontWeight: '500' }}>{item.minimum}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge badge-target">{item.targetGroup || 'All'}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <span className="badge badge-level">{item.levelType || 'General'}</span>
                                                    <span className="badge badge-freq">{item.frequency || 'Per Term'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button onClick={() => handleOpenModal(item)} className="action-btn-edit">Edit</button>
                                                    <button onClick={() => handleDeleteMaterial(item.id)} className="action-btn-delete">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {materials.length > 0 && (
                        <div className="pagination-footer">
                            <div className="pagination-info">
                                Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, materials.length)}</strong> of <strong>{materials.length}</strong> entries
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

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <h3>{editId ? 'Edit Material Configuration' : 'Add New Material Setup'}</h3>
                            <form onSubmit={handleSaveMaterial}>
                                <div className="form-group">
                                    <label>Material Name:</label>
                                    <input 
                                        type="text" 
                                        value={materialName} 
                                        onChange={(e) => setMaterialName(e.target.value)} 
                                        placeholder="e.g. Notebooks, Ream of Paper, Mattress"
                                        required 
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Target Group (Gender Exception):</label>
                                    <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)}>
                                        <option value="All">All Students</option>
                                        <option value="Girls Only">Girls Only (e.g. Sanitary pads)</option>
                                        <option value="Boys Only">Boys Only</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Level Type (O'Level vs A'Level Exception):</label>
                                    <select value={levelType} onChange={(e) => setLevelType(e.target.value)}>
                                        <option value="General">General (Same minimum across all levels)</option>
                                        <option value="Level Dependent">Level Dependent (Different mins for O/A Level)</option>
                                    </select>
                                </div>

                                {levelType === 'Level Dependent' ? (
                                    <div className="row-group">
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>O' Level Minimum:</label>
                                            <input 
                                                type="number" 
                                                value={levelSpecificMins.oLevel} 
                                                onChange={(e) => setLevelSpecificMins({...levelSpecificMins, oLevel: e.target.value})} 
                                                placeholder="1"
                                                required 
                                            />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>A' Level Minimum:</label>
                                            <input 
                                                type="number" 
                                                value={levelSpecificMins.aLevel} 
                                                onChange={(e) => setLevelSpecificMins({...levelSpecificMins, aLevel: e.target.value})} 
                                                placeholder="2"
                                                required 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label>Standard Minimum Required:</label>
                                        <input 
                                            type="number" 
                                            value={minimum} 
                                            onChange={(e) => setMinimum(e.target.value)} 
                                            placeholder="0"
                                            required 
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Frequency (Annual Carry Forward Rule):</label>
                                    <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                                        <option value="Per Term">Per Term (Checked every term)</option>
                                        <option value="Once a Year (Carry Forward)">Once a Year (Carry Forward to Terms 2 & 3)</option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
                                    <button type="submit" className="btn-save">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MaterialsList;