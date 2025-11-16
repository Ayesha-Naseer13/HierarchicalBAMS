import { useState, useEffect } from 'react';
import axios from 'axios';
import './AttendanceManagement.css';
import BlockchainViewer from './BlockchainViewer';

export default function AttendanceManagement({ departments }) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendance, setAttendance] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBlockchain, setStudentBlockchain] = useState(null);

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
      setStudents(response.data.filter((s) => !s.status?.includes('deleted')));
      setAttendance({});
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      const response = await axios.post('http://localhost:5000/api/attendance', {
        studentId,
        classId: selectedClass,
        departmentId: selectedDept,
        status,
      });
      
      setAttendance({
        ...attendance,
        [studentId]: status,
      });

      // Show success feedback
      alert(`Attendance marked: ${status}`);
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const handleViewHistory = async (student) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/attendance/student/${student._id}`
      );
      setSelectedStudent(student);
      setAttendanceHistory(response.data.attendance);
      setStudentBlockchain(response.data.blockchainData);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  return (
    <div className="management-container">
      <h2>Attendance Management</h2>

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

        {selectedClass && (
          <div>
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {selectedClass && (
        <div className="content-grid">
          <div className="attendance-section">
            <h3>Mark Attendance - {selectedDate}</h3>
            <div className="student-list">
              {students.map((student) => (
                <div key={student._id} className="student-card">
                  <div className="student-info">
                    <h5>{student.name}</h5>
                    <p>Roll: {student.rollNumber}</p>
                  </div>
                  <div className="attendance-buttons">
                    <button
                      className={`status-btn present ${
                        attendance[student._id] === 'Present' ? 'active' : ''
                      }`}
                      onClick={() => handleMarkAttendance(student._id, 'Present')}
                    >
                      Present
                    </button>
                    <button
                      className={`status-btn absent ${
                        attendance[student._id] === 'Absent' ? 'active' : ''
                      }`}
                      onClick={() => handleMarkAttendance(student._id, 'Absent')}
                    >
                      Absent
                    </button>
                    <button
                      className={`status-btn leave ${
                        attendance[student._id] === 'Leave' ? 'active' : ''
                      }`}
                      onClick={() => handleMarkAttendance(student._id, 'Leave')}
                    >
                      Leave
                    </button>
                    <button
                      className="history-btn"
                      onClick={() => handleViewHistory(student)}
                    >
                      History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedStudent && studentBlockchain && (
            <div className="history-section">
              <h3>Attendance History - {selectedStudent.name}</h3>
              <BlockchainViewer blocks={studentBlockchain} />
              <div className="attendance-records">
                <h4>Recent Records</h4>
                {attendanceHistory.slice(0, 5).map((record, idx) => (
                  <div key={idx} className="record">
                    <span>{record.status}</span>
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
