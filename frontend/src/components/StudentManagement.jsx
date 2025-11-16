import { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentManagement.css';

export default function StudentManagement({ departments }) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedDept) fetchClasses();
  }, [selectedDept]);

  useEffect(() => {
    if (selectedClass) fetchStudents();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/classes/department/${selectedDept}`
      );
      setClasses(response.data.filter((cls) => !cls.status?.includes('deleted')));
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/students/class/${selectedClass}`
      );
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/students', {
        name,
        rollNumber,
        departmentId: selectedDept,
        classId: selectedClass,
      });
      setName('');
      setRollNumber('');
      fetchStudents();
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Mark this student as deleted?')) {
      try {
        await axios.delete(`http://localhost:5000/api/students/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      !student.status?.includes('deleted') &&
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="management-container">
      <h2>Student Management</h2>

      <div className="selector-group">
        <div>
          <label>Select Department:</label>
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
            <option value="">-- Choose a Department --</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {selectedDept && (
          <div>
            <label>Select Class:</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">-- Choose a Class --</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedClass && (
        <>
          <form className="form-section" onSubmit={handleCreateStudent}>
            <h3>Add New Student</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Roll Number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
              <button type="submit">Add Student</button>
            </div>
          </form>

          <div className="search-section">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="list">
            {filteredStudents.map((student) => (
              <div key={student._id} className="list-item">
                <h4>{student.name}</h4>
                <p>Roll Number: {student.rollNumber}</p>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteStudent(student._id)}
                >
                  Delete Student
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
