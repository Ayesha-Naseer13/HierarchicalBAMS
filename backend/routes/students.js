import express from 'express';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import { getOrCreateBlockchain, getBlockchain } from '../utils/blockchainManager.js';

const router = express.Router();

// Create Student
router.post('/', async (req, res) => {
  try {
    const { name, rollNumber, departmentId, classId } = req.body;

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ error: 'Class not found' });

    const classBlockchain = getBlockchain(classId, 'class');
    const classLatestBlock = classBlockchain.getLatestBlock();

    const student = new Student({
      name,
      rollNumber,
      departmentId,
      classId,
    });

    // Create student blockchain with class's latest block hash as prev_hash
    const studentBlockchain = getOrCreateBlockchain(student._id, 'student', {
      type: 'student_creation',
      name,
      rollNumber,
      classId,
      departmentId,
      prevClassHash: classLatestBlock.hash,
    });

    student.blockchainData = studentBlockchain.getChainData();
    await student.save();

    res.json({ student, blockchainData: studentBlockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('departmentId').populate('classId');
    const studentsWithChains = students.map((student) => {
      const blockchain = getBlockchain(student._id, 'student');
      return {
        ...student.toObject(),
        blockchainData: blockchain ? blockchain.getChainData() : [],
      };
    });
    res.json(studentsWithChains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get students by class
router.get('/class/:classId', async (req, res) => {
  try {
    const students = await Student.find({ classId: req.params.classId });
    const studentsWithChains = students.map((student) => {
      const blockchain = getBlockchain(student._id, 'student');
      return {
        ...student.toObject(),
        blockchainData: blockchain ? blockchain.getChainData() : [],
      };
    });
    res.json(studentsWithChains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { name, rollNumber } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const blockchain = getBlockchain(student._id, 'student');

    blockchain.addBlock({
      type: 'student_update',
      prevName: student.name,
      newName: name,
      prevRollNumber: student.rollNumber,
      newRollNumber: rollNumber,
      timestamp: new Date(),
    });

    student.name = name;
    student.rollNumber = rollNumber;
    student.blockchainData = blockchain.getChainData();
    await student.save();

    res.json({ student: student.toObject(), blockchainData: blockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const blockchain = getBlockchain(student._id, 'student');

    blockchain.addBlock({
      type: 'student_deletion',
      status: 'deleted',
      studentId: student._id,
      name: student.name,
      timestamp: new Date(),
    });

    student.status = 'deleted';
    student.blockchainData = blockchain.getChainData();
    await student.save();

    res.json({ message: 'Student marked as deleted', blockchainData: blockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
