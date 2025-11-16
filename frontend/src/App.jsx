import { useState, useEffect } from 'react';
import './App.css';
import DepartmentManagement from './components/DepartmentManagement';
import ClassManagement from './components/ClassManagement';
import StudentManagement from './components/StudentManagement';
import AttendanceManagement from './components/AttendanceManagement';

function App() {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">⛓️ BAMS</h1>
          <p className="subtitle">Blockchain Attendance Management System</p>
        </div>
      </header>

      <div className="container">
        <nav className="sidebar">
          <button
            className={`nav-button ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button
            className={`nav-button ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            Classes
          </button>
          <button
            className={`nav-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={`nav-button ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </button>
        </nav>

        <main className="content">
          {activeTab === 'departments' && (
            <DepartmentManagement 
              departments={departments} 
              onRefresh={fetchDepartments}
              onSelect={setSelectedDept}
            />
          )}
          {activeTab === 'classes' && (
            <ClassManagement departments={departments} />
          )}
          {activeTab === 'students' && (
            <StudentManagement departments={departments} />
          )}
          {activeTab === 'attendance' && (
            <AttendanceManagement departments={departments} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
