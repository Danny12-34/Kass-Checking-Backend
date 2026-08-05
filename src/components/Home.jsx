import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ totalStudents }) {
  return (
    <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #2c3e50, #4ca1af)', color: 'white', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
        <h1>Welcome, Discipline Officer</h1>
        <p style={{ fontSize: '16px', opacity: '0.9' }}>
          KASS Discipline Office Materials Inspection System (Academic Year 2026-2027)
        </p>
      </div>

      {/* Quick Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #2c3e50', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Total Registered Students</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#2c3e50' }}>{totalStudents}</p>
        </div>
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #27ae60', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Inspection Criteria</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#27ae60' }}>18 Items</p>
        </div>
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #f39c12', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Academic Term Tracking</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#f39c12' }}>Terms 1 - 3</p>
        </div>
      </div>

      {/* Quick Navigation Action Cards */}
      <h3>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Materials Inspection Table</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Inspect student requirements per term, dynamically update item quantities, and monitor sufficiency statuses.
          </p>
          <Link to="/inspection" style={{ display: 'inline-block', textDecoration: 'none', background: '#2c3e50', color: 'white', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
            Open Inspection Table &rarr;
          </Link>
        </div>

        <div style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Students Directory</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            View the complete master list of registered students, register new students manually, or import lists via PDF.
          </p>
          <Link to="/students" style={{ display: 'inline-block', textDecoration: 'none', background: '#2c3e50', color: 'white', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
            View Students Directory &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}