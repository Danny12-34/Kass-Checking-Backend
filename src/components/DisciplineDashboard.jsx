import React, { useState, useEffect } from 'react';
import DisciplineSidebar from './DisciplineSidebar'; // Adjust path if necessary

export default function DisciplineDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [checkedStudentsCount, setCheckedStudentsCount] = useState(0);
  const [lackingStudentsCount, setLackingStudentsCount] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTerm]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch total registered students list
      const studentsRes = await fetch('http://localhost:5000/api/v1/students-list');
      if (!studentsRes.ok) throw new Error('Failed to fetch students list');
      const studentsData = await studentsRes.json();
      setTotalStudents(studentsData.length || 0);

      // 2. Fetch master materials configuration list to find minimums
      const matRes = await fetch('http://localhost:5000/api/v1/getall');
      if (!matRes.ok) throw new Error('Failed to fetch materials configuration');
      const materialsData = await matRes.json();

      // 3. Fetch students with their material checks for the selected term
      const studMatRes = await fetch(`http://localhost:5000/api/v1/get-students-materials?term=${selectedTerm}`);
      if (!studMatRes.ok) throw new Error('Failed to fetch student material records');
      const studMatData = await studMatRes.json();

      // Calculate how many students have completely fulfilled vs lacking materials
      let fullyCheckedCount = 0;
      let lackingCount = 0;

      if (materialsData.length > 0 && studMatData.length > 0) {
        studMatData.forEach(student => {
          const isComplete = materialsData.every(mat => {
            const record = student.material_checks?.find(c => c.material_name === mat.material);
            const presentVal = record ? Number(record.present_material) : 0;
            return presentVal >= Number(mat.minimum);
          });

          if (isComplete) {
            fullyCheckedCount++;
          } else {
            lackingCount++;
          }
        });
      } else {
        lackingCount = studentsData.length;
      }

      setCheckedStudentsCount(fullyCheckedCount);
      setLackingStudentsCount(lackingCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentages for visualization bars
  const totalSafeStudents = totalStudents > 0 ? totalStudents : 1;
  const checkedPercentage = Math.round((checkedStudentsCount / totalSafeStudents) * 100);
  const lackingPercentage = Math.round((lackingStudentsCount / totalSafeStudents) * 100);

  return (
    <>
      <style>{`
        body {
          margin: 0;
          background-color: #f4f6f9;
          font-family: Arial, sans-serif;
        }
        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          margin-left: 250px; /* Matches sidebar width */
          flex: 1;
          padding: 30px;
          box-sizing: border-box;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 15px;
        }
        .dashboard-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 26px;
        }
        .dashboard-header p {
          margin: 5px 0 0 0;
          color: #7f8c8d;
          font-size: 14px;
        }
        .term-selector-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .term-select {
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 13px;
          color: #2c3e50;
          font-weight: bold;
          cursor: pointer;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border-left: 5px solid #3498db;
        }
        .stat-card.warning {
          border-left-color: #e74c3c;
        }
        .stat-card.success {
          border-left-color: #2ecc71;
        }
        .stat-card.info {
          border-left-color: #f39c12;
        }
        .stat-card.primary {
          border-left-color: #9b59b6;
        }
        .stat-title {
          margin: 0;
          font-size: 13px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-value {
          margin: 10px 0 0 0;
          font-size: 28px;
          font-weight: bold;
          color: #2c3e50;
        }
        .content-section {
          background: #ffffff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
        }
        .content-section h3 {
          margin-top: 0;
          color: #2c3e50;
          font-size: 18px;
          margin-bottom: 15px;
        }
        .visualization-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .progress-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: bold;
          color: #334155;
          margin-bottom: 5px;
        }
        .progress-track {
          width: 100%;
          background-color: #e2e8f0;
          border-radius: 6px;
          height: 16px;
          overflow: hidden;
        }
        .progress-fill-success {
          background-color: #2ecc71;
          height: 100%;
          border-radius: 6px 0 0 6px;
          transition: width 0.5s ease-in-out;
        }
        .progress-fill-warning {
          background-color: #e74c3c;
          height: 100%;
          border-radius: 6px 0 0 6px;
          transition: width 0.5s ease-in-out;
        }
        .quick-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .action-btn {
          background: #34495e;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          text-decoration: none;
          transition: background 0.2s;
          display: inline-block;
        }
        .action-btn:hover {
          background: #2c3e50;
        }
        .action-btn.danger {
          background: #e74c3c;
        }
        .action-btn.danger:hover {
          background: #c0392b;
        }
      `}</style>

      <div className="dashboard-container">
        {/* Imported Sidebar */}
        <DisciplineSidebar />

        {/* Main Dashboard Panel */}
        <div className="main-content">
          <div className="dashboard-header">
            <div>
              <h1>Discipline Office Dashboard</h1>
              <p>Karenge Adventist Secondary School - Management Portal</p>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="term-selector-wrapper">
                <label style={{ fontSize: '13px', color: '#2c3e50', fontWeight: 'bold' }}>Term:</label>
                <select 
                  className="term-select"
                  value={selectedTerm} 
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
              <span style={{ background: '#e2e8f0', padding: '8px 15px', borderRadius: '20px', fontSize: '13px', color: '#2c3e50', fontWeight: 'bold' }}>
                Academic Year: 2026
              </span>
            </div>
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: '20px', background: '#fadbd8', padding: '10px', borderRadius: '5px' }}>
              Error loading real-time dashboard records: {error}
            </div>
          )}

          {/* Statistics Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <h4 className="stat-title">Total Registered Students</h4>
              <p className="stat-value">{loading ? '...' : totalStudents}</p>
            </div>
            <div className="stat-card success">
              <h4 className="stat-title">Checked Students ({selectedTerm})</h4>
              <p className="stat-value">{loading ? '...' : checkedStudentsCount}</p>
            </div>
            <div className="stat-card warning">
              <h4 className="stat-title">Active Incidents</h4>
              <p className="stat-value">3</p>
            </div>
            <div className="stat-card info">
              <h4 className="stat-title">Pending Actions</h4>
              <p className="stat-value">1</p>
            </div>
            <div className="stat-card primary">
              <h4 className="stat-title">Resolved Cases</h4>
              <p className="stat-value">12</p>
            </div>
          </div>

          {/* Visual Analysis Analytics Panel */}
          <div className="content-section">
            <h3>Material Checklist Analytics ({selectedTerm})</h3>
            <div className="visualization-container">
              <div>
                <div className="progress-label-row">
                  <span>Fully Verified & Complete Materials</span>
                  <span>{checkedStudentsCount} / {totalStudents} Students ({checkedPercentage}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill-success" style={{ width: `${loading ? 0 : checkedPercentage}%` }}></div>
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <div className="progress-label-row">
                  <span>Pending / Lacking Materials</span>
                  <span>{lackingStudentsCount} / {totalStudents} Students ({lackingPercentage}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill-warning" style={{ width: `${loading ? 0 : lackingPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="content-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <a href="/discipline/add-student" className="action-btn">
                ➕ Register New Student
              </a>
              <a href="/discipline/incidents" className="action-btn danger">
                ⚠️ Record New Incident
              </a>
              <a href="/Studentlist" className="action-btn">
                🎓 View Student Directory
              </a>
              <a href="/discipline/reports" className="action-btn">
                📋 Generate Report
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}