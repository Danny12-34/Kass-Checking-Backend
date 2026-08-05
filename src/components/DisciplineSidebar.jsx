import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function DisciplineSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Perform any logout logic here (e.g., clearing localStorage, tokens, etc.)
    localStorage.clear();
    // Redirect to login page (adjust the path as needed for your router setup)
    navigate('/login');
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          padding-left: 280px; /* Matches the updated sidebar width */
          background-color: #f8fafc;
        }

        .discipline-sidebar {
          width: 280px;
          height: 100vh;
          background: linear-gradient(160deg, #0f172a 0%, #090d16 100%);
          color: #f8fafc;
          position: fixed;
          top: 0;
          left: 0;
          padding: 24px 16px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
          z-index: 1000;
        }

        .sidebar-top {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-header {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(8px);
        }

        .sidebar-logo-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .sidebar-title-group {
          display: flex;
          flex-direction: column;
        }

        .sidebar-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.3px;
        }

        .sidebar-subtitle {
          margin: 2px 0 0 0;
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-section-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          font-weight: 700;
          padding: 0 16px;
          margin-top: 8px;
          margin-bottom: 4px;
        }

        .sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          color: #94a3b8;
          background-color: transparent;
          border: 1px solid transparent;
        }

        .sidebar-link-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-link span:first-child {
          font-size: 16px;
          transition: transform 0.2s ease;
        }

        .sidebar-link:hover .sidebar-link-content span:first-child {
          transform: scale(1.1);
        }

        .sidebar-link.active {
          color: #ffffff;
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.03) 100%);
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.12);
          font-weight: 600;
        }

        .sidebar-link.inactive:hover {
          color: #f1f5f9;
          background-color: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.04);
        }

        .sidebar-badge {
          background-color: rgba(239, 68, 68, 0.2);
          color: #f87171;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .sidebar-bottom-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.2);
          color: #ffffff;
          border-color: rgba(239, 68, 68, 0.4);
          transform: translateY(-1px);
        }

        .sidebar-footer {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-school-name {
          font-size: 12px;
          font-weight: 600;
          color: #cbd5e1;
        }

        .footer-status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #64748b;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
        }
      `}</style>

      <div className="discipline-sidebar">
        <div className="sidebar-top">
          {/* Header Card */}
          <div className="sidebar-header">
            <div className="sidebar-logo-icon">🛡️</div>
            <div className="sidebar-title-group">
              <h3 className="sidebar-title">Discipline Office</h3>
              <p className="sidebar-subtitle">KASS Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="sidebar-links">
            <div className="sidebar-section-label">Main Menu</div>
            
            <Link 
              to="/DisDashboard" 
              className={`sidebar-link ${isActive('/DisDashboard') ? 'active' : 'inactive'}`}
            >
              <div className="sidebar-link-content">
                <span>📊</span> Dashboard
              </div>
            </Link>

            <Link 
              to="/Studentlist" 
              className={`sidebar-link ${isActive('/Studentlist') ? 'active' : 'inactive'}`}
            >
              <div className="sidebar-link-content">
                <span>🎓</span> Student List
              </div>
            </Link>

            <div className="sidebar-section-label" style={{ marginTop: '12px' }}>Inventory & Audit</div>

            <Link 
              to="/MaterialsList" 
              className={`sidebar-link ${isActive('/MaterialsList') ? 'active' : 'inactive'}`}
            >
              <div className="sidebar-link-content">
                <span>➕</span> All Materials
              </div>
            </Link>

            <Link 
              to="/MaterialsTable" 
              className={`sidebar-link ${isActive('/MaterialsTable') ? 'active' : 'inactive'}`}
            >
              <div className="sidebar-link-content">
                <span>📋</span> Check Student
              </div>
              <span className="sidebar-badge">Live</span>
            </Link>

            <Link 
              to="/AllStuMat" 
              className={`sidebar-link ${isActive('/AllStuMat') ? 'active' : 'inactive'}`}
            >
              <div className="sidebar-link-content">
                <span>📑</span> Checked Details
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Section: Logout & Footer */}
        <div className="sidebar-bottom-section">
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span> Logout
          </button>

          <div className="sidebar-footer">
            <span className="footer-school-name">Karenge Adventist Sec. School</span>
            <div className="footer-status-indicator">
              <span className="status-dot"></span> System Online
            </div>
          </div>
        </div>
      </div>
    </>
  );
}