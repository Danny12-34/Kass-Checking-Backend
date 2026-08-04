import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function DisciplineSidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        .discipline-sidebar {
          width: 250px;
          height: 100vh;
          background: #2c3e50;
          color: white;
          position: fixed;
          top: 0;
          left: 0;
          padding: 20px 0;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
          display: flex;
          flexDirection: column;
          justify-content: space-between;
        }
        .sidebar-header {
          padding: 0 20px 20px 20px;
          border-bottom: 1px solid #34495e;
        }
        .sidebar-title {
          margin: 0;
          font-size: 18px;
          color: #ecf0f1;
        }
        .sidebar-subtitle {
          margin: 5px 0 0 0;
          font-size: 12px;
          color: #95a5a6;
        }
        .sidebar-links {
          margin-top: 20px;
        }
        .sidebar-link {
          display: block;
          text-decoration: none;
          padding: 12px 20px;
          transition: all 0.2s ease;
        }
        .sidebar-link.active {
          color: #ffffff;
          background-color: #34495e;
          border-left: 4px solid #e74c3c;
          font-weight: bold;
        }
        .sidebar-link.inactive {
          color: #bdc3c7;
          background-color: transparent;
          border-left: 4px solid transparent;
          font-weight: normal;
        }
        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #34495e;
          font-size: 12px;
          color: #95a5a6;
          text-align: center;
        }
      `}</style>

      <div className="discipline-sidebar">
        <div>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Discipline Office</h3>
            <p className="sidebar-subtitle">KASS Management System</p>
          </div>

          <div className="sidebar-links">
            <Link 
              to="/discipline/dashboard" 
              className={`sidebar-link ${isActive('/discipline/dashboard') ? 'active' : 'inactive'}`}
            >
              📊 Dashboard
            </Link>
            <Link 
              to="/Studentlist" 
              className={`sidebar-link ${isActive('/Studentlist') ? 'active' : 'inactive'}`}
            >
              🎓 Student Directory
            </Link>
            <Link 
              to="/discipline/add-student" 
              className={`sidebar-link ${isActive('/discipline/add-student') ? 'active' : 'inactive'}`}
            >
              ➕ Register Students
            </Link>
            <Link 
              to="/discipline/incidents" 
              className={`sidebar-link ${isActive('/discipline/incidents') ? 'active' : 'inactive'}`}
            >
              ⚠️ Record Incidents
            </Link>
            <Link 
              to="/discipline/reports" 
              className={`sidebar-link ${isActive('/discipline/reports') ? 'active' : 'inactive'}`}
            >
              📋 Disciplinary Reports
            </Link>
          </div>
        </div>

        <div className="sidebar-footer">
          Karenge Adventist Sec. School
        </div>
      </div>
    </>
  );
}