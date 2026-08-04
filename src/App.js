// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './components/Home.jsx';
import StudentsList from './components/StudentsList.jsx';
import Navbar from './components/Navbar.jsx';
import AddStudent from './components/AddStudent.jsx';
import DisciplineDashboard from './components/DisciplineDashboard.jsx';
import StudentMaterialsCheck from './components/MaterialCheck.jsx';
import MaterialsList from './components/MaterialsList.jsx'
import AllStudentsMaterialsView from './components/AllStudentsMaterialsView.jsx';



function App() {
  return (
    <div className="app-layout">
      {/* NAVBAR */}

      <Navbar />

      {/* MAIN CONTENT - Forced to full width via CSS */}
      <main className="app-content">
        <Routes>
          {/* ===== PUBLIC ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/Studentlist" element={< StudentsList/>} />
          <Route path="/CreateStudent" element={< AddStudent/>} />
          <Route path="/MaterialsList" element={< MaterialsList/>} />
          <Route path="/DisDashboard" element={< DisciplineDashboard/>} />
          <Route path="/AllStuMat" element={< AllStudentsMaterialsView/>} />
          <Route path="/MaterialsTable" element={< StudentMaterialsCheck/>} />
         

 
        </Routes>
      </main>

      {/* FOOTER */}
      {/* <Footer /> */}
    </div>
  );
}

export default App;