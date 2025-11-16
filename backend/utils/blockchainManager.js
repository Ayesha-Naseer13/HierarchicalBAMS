import { Blockchain } from '../blockchain/Blockchain.js';

const blockchains = {};

export const getOrCreateBlockchain = (id, type, genesisData) => {
  const key = `${type}_${id}`;
  if (!blockchains[key]) {
    blockchains[key] = new Blockchain(genesisData, type);
  }
  return blockchains[key];
};

export const getBlockchain = (id, type) => {
  const key = `${type}_${id}`;
  return blockchains[key];
};

export const validateAllChains = (departmentId, classes, students) => {
  const validation = {
    departmentValid: false,
    classesValid: [],
    studentsValid: [],
    errors: [],
  };

  // Validate department chain
  const deptChain = getBlockchain(departmentId, 'department');
  if (deptChain && deptChain.isChainValid()) {
    validation.departmentValid = true;
  } else {
    validation.errors.push('Department chain is invalid');
  }

  // Validate class chains
  classes.forEach((cls) => {
    const classChain = getBlockchain(cls._id, 'class');
    if (classChain && classChain.isChainValid()) {
      validation.classesValid.push({ classId: cls._id, valid: true });
    } else {
      validation.classesValid.push({ classId: cls._id, valid: false });
      validation.errors.push(`Class ${cls.name} chain is invalid`);
    }
  });

  // Validate student chains
  students.forEach((student) => {
    const studentChain = getBlockchain(student._id, 'student');
    if (studentChain && studentChain.isChainValid()) {
      validation.studentsValid.push({ studentId: student._id, valid: true });
    } else {
      validation.studentsValid.push({ studentId: student._id, valid: false });
      validation.errors.push(`Student ${student.name} chain is invalid`);
    }
  });

  return validation;
};
