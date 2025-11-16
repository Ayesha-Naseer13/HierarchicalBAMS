import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { getBlockchain } from '../utils/blockchainManager.js';

const router = express.Router();

// Mark attendance
router.post('/', async (req, res) => {
  try {
    const { studentId, classId, departmentId, status } = req.body;

    if (!['Present', 'Absent', 'Leave'].includes(status)) {
      return res.status(400).json({ error: 'Invalid attendance status' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const studentBlockchain = getBlockchain(studentId, 'student');

    // Add attendance block to student's blockchain
    studentBlockchain.addBlock({
      type: 'attendance',
      studentId,
      classId,
      departmentId,
      status,
      date: new Date(),
    });

    const attendance = new Attendance({
      studentId,
      classId,
      departmentId,
      status,
      blockchainData: studentBlockchain.getChainData(),
    });

    await attendance.save();

    res.json({ attendance, blockchainData: studentBlockchain.getChainData() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    const studentBlockchain = getBlockchain(req.params.studentId, 'student');
    
    res.json({
      attendance,
      blockchainData: studentBlockchain ? studentBlockchain.getChainData() : [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance by class and date
router.get('/class/:classId/date/:date', async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const attendance = await Attendance.find({
      classId: req.params.classId,
      date: { $gte: startDate, $lt: endDate },
    }).populate('studentId');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get department attendance summary
router.get('/department/:departmentId/summary', async (req, res) => {
  try {
    const attendance = await Attendance.find({ departmentId: req.params.departmentId })
      .populate('studentId')
      .populate('classId');
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
