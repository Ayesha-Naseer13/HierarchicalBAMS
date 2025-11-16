import { useState, useEffect } from 'react';
import axios from 'axios';
import './DepartmentManagement.css';
import BlockchainViewer from './BlockchainViewer';

export default function DepartmentManagement({ departments, onRefresh, onSelect }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/departments', { name, code });
      setName('');
      setCode('');
      onRefresh();
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Error creating department: ' + error.response?.data?.error);
    }
  };

  const handleSelectDept = async (dept) => {
    setSelectedDept(dept);
    setBlockchainData(dept.blockchainData);
    onSelect(dept);
  };

  const handleDeleteDept = async (id) => {
    if (window.confirm('Mark this department as deleted?')) {
      try {
        await axios.delete(`http://localhost:5000/api/departments/${id}`);
        onRefresh();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const filteredDepts = departments.filter(
    (dept) =>
      !dept.status?.includes('deleted') &&
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="management-container">
      <h2>Department Management</h2>

      <form className="form-section" onSubmit={handleCreateDept}>
        <h3>Create New Department</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Department Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Department Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit">Create Department</button>
        </div>
      </form>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="content-grid">
        <div className="list-section">
          <h3>Departments</h3>
          <div className="list">
            {filteredDepts.map((dept) => (
              <div
                key={dept._id}
                className={`list-item ${selectedDept?._id === dept._id ? 'active' : ''}`}
                onClick={() => handleSelectDept(dept)}
              >
                <div className="item-header">
                  <h4>{dept.name}</h4>
                  <span className="code-badge">{dept.code}</span>
                </div>
                <p className="item-date">
                  Created: {new Date(dept.createdAt).toLocaleDateString()}
                </p>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDept(dept._id);
                  }}
                >
                  Mark as Deleted
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedDept && blockchainData && (
          <div className="blockchain-section">
            <h3>Blockchain History - {selectedDept.name}</h3>
            <BlockchainViewer blocks={blockchainData} />
          </div>
        )}
      </div>
    </div>
  );
}
