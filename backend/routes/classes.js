import express from 'express';
import Class from '../models/Class.js';
import Department from '../models/Department.js';
import { getOrCreateBlockchain, getBlockchain } from '../utils/blockchainManager.js';

const router = express.Router();

// Create Class
router.post('/', async (req, res) => {
  try {
    const { name, code, departmentId, capacity } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ error: 'Department not found' });

    const deptBlockchain = getBlockchain(departmentId, 'department');
    const deptLatestBlock = deptBlockchain.getLatestBlock();

    const classDoc = new Class({
      name,
      code,
      departmentId,
      capacity,
    });

    // Create class blockchain with department's latest block hash as prev_hash
    const classBlockchain = getOrCreateBlockchain(classDoc._id, 'class', {
      type: 'class_creation',
      name,
      code,
      departmentId,
      prevDepartmentHash: deptLatestBlock.hash,
    });

    classDoc.blockchainData = classBlockchain.getChainData();
    await classDoc.save();

    res.json({ class: classDoc, blockchainData: classBlockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().populate('departmentId');
    const classesWithChains = classes.map((cls) => {
      const blockchain = getBlockchain(cls._id, 'class');
      return {
        ...cls.toObject(),
        blockchainData: blockchain ? blockchain.getChainData() : [],
      };
    });
    res.json(classesWithChains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get classes by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const classes = await Class.find({ departmentId: req.params.departmentId });
    const classesWithChains = classes.map((cls) => {
      const blockchain = getBlockchain(cls._id, 'class');
      return {
        ...cls.toObject(),
        blockchainData: blockchain ? blockchain.getChainData() : [],
      };
    });
    res.json(classesWithChains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const { name, code, capacity } = req.body;
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) return res.status(404).json({ error: 'Class not found' });

    const blockchain = getBlockchain(classDoc._id, 'class');

    blockchain.addBlock({
      type: 'class_update',
      prevName: classDoc.name,
      newName: name,
      prevCapacity: classDoc.capacity,
      newCapacity: capacity,
      timestamp: new Date(),
    });

    classDoc.name = name;
    classDoc.code = code;
    classDoc.capacity = capacity;
    classDoc.blockchainData = blockchain.getChainData();
    await classDoc.save();

    res.json({ class: classDoc.toObject(), blockchainData: blockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) return res.status(404).json({ error: 'Class not found' });

    const blockchain = getBlockchain(classDoc._id, 'class');

    blockchain.addBlock({
      type: 'class_deletion',
      status: 'deleted',
      classId: classDoc._id,
      name: classDoc.name,
      timestamp: new Date(),
    });

    classDoc.status = 'deleted';
    classDoc.blockchainData = blockchain.getChainData();
    await classDoc.save();

    res.json({ message: 'Class marked as deleted', blockchainData: blockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
