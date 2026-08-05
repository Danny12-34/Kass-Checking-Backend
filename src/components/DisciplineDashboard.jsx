import React, { useState, useEffect } from 'react';
import DisciplineSidebar from './DisciplineSidebar';

export default function DisciplineDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [checkedStudentsCount, setCheckedStudentsCount] = useState(0);
  const [lackingStudentsCount, setLackingStudentsCount] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
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

      const uniqueClasses = new Set(studentsData.map(s => s.class_name || s.class || s.grade).filter(Boolean));
      setTotalClasses(uniqueClasses.size);

      // 2. Fetch master materials configuration list to find minimums
      const matRes = await fetch('http://localhost:5000/api/v1/getall');
      if (!matRes.ok) throw new Error('Failed to fetch materials configuration');
      const materialsData = await matRes.json();

      // 3. Fetch students with their material checks for the selected term
      const studMatRes = await fetch(`http://localhost:5000/api/v1/get-students-materials?term=${selectedTerm}`);
      if (!studMatRes.ok) throw new Error('Failed to fetch student material records');
      const studMatData = await studMatRes.json();

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

  const totalSafeStudents = totalStudents > 0 ? totalStudents : 1;
  const checkedPercentage = Math.round((checkedStudentsCount / totalSafeStudents) * 100);
  const lackingPercentage = Math.round((lackingStudentsCount / totalSafeStudents) * 100);

  // Calculate dynamic heights for the bar chart based on student counts relative to total students
  const maxBarCount = Math.max(totalStudents, 1);
  const getBarHeight = (count) => {
    if (loading || totalStudents === 0) return '0%';
    const height = Math.round((count / maxBarCount) * 100);
    return `${Math.max(height, 8)}%`; // Minimum height of 8% for visibility
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background-color: #f8fafc;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #1e293b;
        }
        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          margin-left: 0px;
          flex: 1;
          padding: 36px;
          max-width: 1400px;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          background: #ffffff;
          padding: 24px 30px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
          border: 1px solid #f1f5f9;
        }
        .dashboard-header h1 {
          margin: 0;
          color: #0f172a;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .dashboard-header p {
          margin: 4px 0 0 0;
          color: #64748b;
          font-size: 13px;
        }
        .header-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .term-select {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 13px;
          color: #0f172a;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .term-select:hover {
          border-color: #94a3b8;
        }
        .year-badge {
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          color: #475569;
          font-weight: 600;
          border: 1px solid #e2e8f0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: #ffffff;
          padding: 22px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #f1f5f9;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }
        .stat-card.primary::before { background: #6366f1; }
        .stat-card.classes::before { background: #14b8a6; }
        .stat-card.success::before { background: #10b981; }
        .stat-card.warning::before { background: #f59e0b; }
        .stat-card.info::before { background: #8b5cf6; }

        .stat-title {
          margin: 0;
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
        }
        .stat-value {
          margin: 10px 0 0 0;
          font-size: 30px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -1px;
        }
        .content-section {
          background: #ffffff;
          padding: 28px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          margin-bottom: 28px;
        }
        .content-section h3 {
          margin-top: 0;
          color: #0f172a;
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .visualization-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .progress-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
        }
        .progress-track {
          width: 100%;
          background-color: #f1f5f9;
          border-radius: 8px;
          height: 12px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .progress-fill-success { background: linear-gradient(90deg, #10b981, #34d399); }
        .progress-fill-warning { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

        /* Bar Chart Styles */
        .barchart-wrapper {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 240px;
          padding: 20px 10px 10px 10px;
          border-bottom: 2px solid #e2e8f0;
          gap: 15px;
        }
        .barchart-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          height: 100%;
          justify-content: flex-end;
        }
        .barchart-bar {
          width: 100%;
          max-width: 50px;
          border-radius: 8px 8px 0 0;
          transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 6px;
        }
        .barchart-val {
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .barchart-label {
          margin-top: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-align: center;
          white-space: nowrap;
        }

        .error-banner {
          color: #991b1b;
          margin-bottom: 24px;
          background: #fef2f2;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #fecaca;
          font-size: 13px;
          font-weight: 500;
        }
      `}</style>

      <div className="dashboard-container">
        <DisciplineSidebar />

        <div className="main-content">
          <div className="dashboard-header">
            <div>
              <h1>Discipline Office Dashboard</h1>
              <p>Karenge Adventist Secondary School • Management Portal</p>
            </div>
            <div className="header-controls">
              <div className="term-selector-wrapper">
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
              <span className="year-badge">
                📅 2026
              </span>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              ⚠️ Error loading real-time records: {error}
            </div>
          )}

          {/* Statistics Grid */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <h4 className="stat-title">Total Students</h4>
              <p className="stat-value">{loading ? '...' : totalStudents}</p>
            </div>
            <div className="stat-card classes">
              <h4 className="stat-title">Total Classes</h4>
              <p className="stat-value">{loading ? '...' : totalClasses}</p>
            </div>
            <div className="stat-card success">
              <h4 className="stat-title">Fully Checked</h4>
              <p className="stat-value">{loading ? '...' : checkedStudentsCount}</p>
            </div>
            <div className="stat-card warning">
              <h4 className="stat-title">Lacking Items</h4>
              <p className="stat-value">{loading ? '...' : lackingStudentsCount}</p>
            </div>
            
          </div>

          {/* Visual Analysis Analytics Panel */}
          <div className="content-section">
            <h3>Material Checklist Analytics ({selectedTerm})</h3>
            <div className="visualization-container">
              <div>
                <div className="progress-label-row">
                  <span>✨ Fully Verified & Complete</span>
                  <span>{checkedStudentsCount} / {totalStudents} ({checkedPercentage}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill progress-fill-success" style={{ width: `${loading ? 0 : checkedPercentage}%` }}></div>
                </div>
              </div>

              <div>
                <div className="progress-label-row">
                  <span>⚠️ Lacking Materials</span>
                  <span>{lackingStudentsCount} / {totalStudents} ({lackingPercentage}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill progress-fill-warning" style={{ width: `${loading ? 0 : lackingPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart Panel */}
          <div className="content-section">
            <h3>Student Verification Status Overview</h3>
            <div className="barchart-wrapper">
              <div className="barchart-column">
                <div 
                  className="barchart-bar" 
                  style={{ height: getBarHeight(totalStudents), background: '#6366f1' }}
                >
                  <span className="barchart-val">{loading ? '' : totalStudents}</span>
                </div>
                <span className="barchart-label">Total Students</span>
              </div>

              <div className="barchart-column">
                <div 
                  className="barchart-bar" 
                  style={{ height: getBarHeight(checkedStudentsCount), background: '#10b981' }}
                >
                  <span className="barchart-val">{loading ? '' : checkedStudentsCount}</span>
                </div>
                <span className="barchart-label">Fully Checked</span>
              </div>

              <div className="barchart-column">
                <div 
                  className="barchart-bar" 
                  style={{ height: getBarHeight(lackingStudentsCount), background: '#f59e0b' }}
                >
                  <span className="barchart-val">{loading ? '' : lackingStudentsCount}</span>
                </div>
                <span className="barchart-label">Lacking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}