import { useState, useEffect } from 'react';
import axios from 'axios';
import './ClassManagement.css';

export default function ClassManagement({ departments }) {
  const [classes, setClasses] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [capacity, setCapacity] = useState(35);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedDept) fetchClasses();
  }, [selectedDept]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        `https://hierarchicalbams-2.onrender.com/api/classes/department/${selectedDept}`
      );
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://hierarchicalbams-2.onrender.com/api/classes', {
        name,
        code,
        departmentId: selectedDept,
        capacity,
      });
      setName('');
      setCode('');
      setCapacity(35);
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Mark this class as deleted?')) {
      try {
        await axios.delete(`https://hierarchicalbams-2.onrender.com/api/classes/${id}`);
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  const filteredClasses = classes.filter(
    (cls) =>
      !cls.status?.includes('deleted') &&
      cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="management-container">
      <h2>Class Management</h2>

      <div className="dept-selector">
        <label>Select Department:</label>
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
          <option value="">-- Choose a Department --</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name} ({dept.code})
            </option>
          ))}
        </select>
      </div>

      {selectedDept && (
        <>
          <form className="form-section" onSubmit={handleCreateClass}>
            <h3>Create New Class</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Class Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Class Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Capacity"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                min="1"
              />
              <button type="submit">Create Class</button>
            </div>
          </form>

          <div className="search-section">
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="list">
            {filteredClasses.map((cls) => (
              <div key={cls._id} className="list-item">
                <h4>{cls.name}</h4>
                <p>Code: {cls.code} | Capacity: {cls.capacity}</p>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteClass(cls._id)}
                >
                  Delete Class
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
