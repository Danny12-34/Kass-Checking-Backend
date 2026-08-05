import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 'bold',
    backgroundColor: isActive ? '#34495e' : '#ecf0f1',
    color: isActive ? '#fff' : '#2c3e50',
    transition: 'background 0.2s ease'
  });

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '25px', 
      borderBottom: '2px solid #ddd', 
      paddingBottom: '15px', 
      flexWrap: 'wrap', 
      gap: '15px',
      background: '#f8f9fa',
      padding: '15px 20px',
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '22px' }}>🛡️</span>
        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '20px' }}>
          KASS Discipline Office
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <NavLink to="/" style={linkStyle} end>
          Home Dashboard
        </NavLink>
        <NavLink to="/Studentlist" style={linkStyle}>
          Students List
        </NavLink>
        <NavLink to="/MaterialsList" style={linkStyle}>
          Materials List
        </NavLink>
        <NavLink to="/DisDashboard" style={linkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/AllStuMat" style={linkStyle}>
          All Checked Students
        </NavLink>
        <NavLink to="/MaterialsTable" style={linkStyle}>
          Materials
        </NavLink>
      </div>
    </nav>
  );
}