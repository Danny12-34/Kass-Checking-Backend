import React, { useState, useEffect } from 'react';

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
    const [targetGroup, setTargetGroup] = useState('All'); // 'All', 'Girls Only', 'Boys Only'
    const [levelType, setLevelType] = useState('General'); // 'General', 'Level Dependent'
    const [levelSpecificMins, setLevelSpecificMins] = useState({ oLevel: '', aLevel: '' });
    const [frequency, setFrequency] = useState('Per Term'); // 'Per Term', 'Once a Year (Carry Forward)'

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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
            // Directly map the fetched frequency or fallback safely without overwriting user-specified inputs
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
                frequency // Saves the exact frequency selected by the user
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
        if (!window.confirm('Are you sure you want to delete this material?')) return;
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

    if (loading) return <div className="loading-state">Loading materials inventory...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;

    return (
        <>
            <style>{`
                body {
                    margin: 0;
                    background-color: #f4f6f9;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .materials-container {
                    padding: 30px;
                    max-width: 1050px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
                .add-btn {
                    background-color: #2ecc71;
                    color: white;
                    padding: 10px 18px;
                    border: none;
                    cursor: pointer;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 14px;
                    transition: background 0.2s;
                }
                .add-btn:hover {
                    background-color: #27ae60;
                }
                .styled-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    overflow: hidden;
                    border-radius: 6px;
                }
                .styled-table thead tr {
                    background-color: #34495e;
                    color: #ffffff;
                    text-align: left;
                    font-weight: bold;
                }
                .styled-table th, .styled-table td {
                    padding: 14px 16px;
                }
                .styled-table tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    transition: background 0.15s;
                }
                .styled-table tbody tr:hover {
                    background-color: #f8fafc;
                }
                .styled-table tbody tr:last-of-type {
                    border-bottom: 2px solid #34495e;
                }
                .badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .badge-target { background: #e0f2fe; color: #0369a1; }
                .badge-level { background: #fef3c7; color: #b45309; }
                .badge-freq { background: #f3e8ff; color: #6b21a8; }
                
                .action-btn-edit {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-right: 8px;
                    transition: background 0.2s;
                }
                .action-btn-edit:hover {
                    background-color: #2980b9;
                }
                .action-btn-delete {
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.2s;
                }
                .action-btn-delete:hover {
                    background-color: #c0392b;
                }
                .empty-state {
                    text-align: center;
                    color: #7f8c8d;
                    padding: 30px;
                    font-style: italic;
                }
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
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(2px);
                }
                .modal-card {
                    background: white;
                    padding: 25px;
                    border-radius: 8px;
                    width: 480px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .modal-card h3 {
                    margin-top: 0;
                    color: #2c3e50;
                    font-size: 18px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #edf2f7;
                    padding-bottom: 10px;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    color: #4a5568;
                    font-weight: 600;
                    font-size: 13px;
                }
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #cbd5e1;
                    border-radius: 4px;
                    box-sizing: border-box;
                    font-size: 14px;
                }
                .form-group input:focus, .form-group select:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
                }
                .row-group {
                    display: flex;
                    gap: 10px;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                .btn-cancel {
                    background-color: #e2e8f0;
                    color: #475569;
                    border: none;
                    padding: 9px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .btn-cancel:hover {
                    background-color: #cbd5e1;
                }
                .btn-save {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 9px 18px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .btn-save:hover {
                    background-color: #2980b9;
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

            <div className="materials-container">
                <div className="header-flex">
                    <h2>Materials Management Portal</h2>
                    <button onClick={() => handleOpenModal()} className="add-btn">
                        + Add New Material
                    </button>
                </div>

                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Material Name</th>
                            <th>Minimum Required</th>
                            <th>Target Group</th>
                            <th>Level/Frequency Rules</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentMaterials.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-state">No materials found in configuration.</td>
                            </tr>
                        ) : (
                            currentMaterials.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: '600', color: '#2d3748' }}>{item.material}</td>
                                    <td>
                                        {item.levelType === 'Level Dependent' ? (
                                            <span style={{ fontSize: '13px' }}>
                                                O-L: <strong>{item.levelSpecificMins?.oLevel || 0}</strong> | A-L: <strong>{item.levelSpecificMins?.aLevel || 0}</strong>
                                            </span>
                                        ) : (
                                            item.minimum
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
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleOpenModal(item)} className="action-btn-edit">Edit</button>
                                        <button onClick={() => handleDeleteMaterial(item.id)} className="action-btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

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

                {/* Modal for Add / Edit with Rule Exception fields */}
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
                                        placeholder="e.g. Notebooks, Lame, Mattress"
                                        required 
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Target Group (Gender Exception):</label>
                                    <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)}>
                                        <option value="All">All Students</option>
                                        <option value="Girls Only">Girls Only (e.g. Nicker pegs & pads)</option>
                                        <option value="Boys Only">Boys Only</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Level Type (O'Level vs A'Level Exception):</label>
                                    <select value={levelType} onChange={(e) => setLevelType(e.target.value)}>
                                        <option value="General">General (Same for all levels)</option>
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
        </>
    );
}

export default MaterialsList;