import express from 'express';
import Department from '../models/Department.js';
import Class from '../models/Class.js';
import { getOrCreateBlockchain, getBlockchain } from '../utils/blockchainManager.js';

const router = express.Router();

// Create Department
router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;
    
    // Check if department already exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({ error: 'Department already exists' });
    }

    const department = new Department({ name, code });
    
    // Create blockchain for department
    const blockchain = getOrCreateBlockchain(department._id, 'department', {
      type: 'department_creation',
      name,
      code,
    });
    
    department.blockchainData = blockchain.getChainData();
    await department.save();

    res.json({ department, blockchain: blockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find();
    const deptWithChains = departments.map((dept) => {
      const blockchain = getBlockchain(dept._id, 'department');
      return {
        ...dept.toObject(),
        blockchainData: blockchain ? blockchain.getChainData() : [],
      };
    });
    res.json(deptWithChains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ error: 'Department not found' });
    
    const blockchain = getBlockchain(department._id, 'department');
    res.json({
      ...department.toObject(),
      blockchainData: blockchain ? blockchain.getChainData() : [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update department (add new block instead of modifying)
router.put('/:id', async (req, res) => {
  try {
    const { name, code } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ error: 'Department not found' });

    const blockchain = getBlockchain(department._id, 'department');
    
    // Add update block to blockchain
    blockchain.addBlock({
      type: 'department_update',
      prevName: department.name,
      prevCode: department.code,
      newName: name,
      newCode: code,
      timestamp: new Date(),
    });

    department.name = name;
    department.code = code;
    department.blockchainData = blockchain.getChainData();
    department.updatedAt = new Date();
    await department.save();

    res.json({ department: department.toObject(), blockchainData: blockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete department (add deletion block)
router.delete('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ error: 'Department not found' });

    const blockchain = getBlockchain(department._id, 'department');
    
    // Add deletion block instead of removing
    blockchain.addBlock({
      type: 'department_deletion',
      status: 'deleted',
      departmentId: department._id,
      name: department.name,
      timestamp: new Date(),
    });

    department.status = 'deleted';
    department.blockchainData = blockchain.getChainData();
    await department.save();

    res.json({ message: 'Department marked as deleted', blockchainData: blockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
