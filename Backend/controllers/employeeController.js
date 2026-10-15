const pool = require('../config/db');

function getValidEmployeeId(idParam) {
  if (!/^[1-9]\d*$/.test(idParam)) {
    return null;
  }

  const id = Number(idParam);
  return Number.isSafeInteger(id) ? id : null;
}

function validateEmployee(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const department =
    typeof body.department === 'string' ? body.department.trim() : '';

  if (!name) {
    return { error: 'Name is required.' };
  }

  if (!email) {
    return { error: 'Email is required.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please provide a valid email address.' };
  }

  if (!department) {
    return { error: 'Department is required.' };
  }

  if (name.length > 100 || email.length > 150 || department.length > 100) {
    return { error: 'One or more fields exceed the maximum allowed length.' };
  }

  return { employee: { name, email, department } };
}

function handleDatabaseError(error, res, action) {
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'An employee with this email already exists.' });
  }

  console.error(`Failed to ${action}:`, error);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
}

async function getAllEmployees(req, res) {
  try {
    const [employees] = await pool.promise().query(
      'SELECT id, name, email, department FROM employees ORDER BY id'
    );
    return res.status(200).json(employees);
  } catch (error) {
    return handleDatabaseError(error, res, 'retrieve employees');
  }
}

async function getEmployeeById(req, res) {
  const id = getValidEmployeeId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Employee ID must be a positive integer.' });
  }

  try {
    const [employees] = await pool.promise().query(
      'SELECT id, name, email, department FROM employees WHERE id = ?',
      [id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    return res.status(200).json(employees[0]);
  } catch (error) {
    return handleDatabaseError(error, res, 'retrieve the employee');
  }
}

async function createEmployee(req, res) {
  const validation = validateEmployee(req.body || {});
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const { name, email, department } = validation.employee;

  try {
    const [result] = await pool.promise().query(
      'INSERT INTO employees (name, email, department) VALUES (?, ?, ?)',
      [name, email, department]
    );

    return res.status(201).json({
      message: 'Employee created successfully.',
      employee: { id: result.insertId, name, email, department }
    });
  } catch (error) {
    return handleDatabaseError(error, res, 'create the employee');
  }
}

async function updateEmployee(req, res) {
  const id = getValidEmployeeId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Employee ID must be a positive integer.' });
  }

  const validation = validateEmployee(req.body || {});
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const { name, email, department } = validation.employee;

  try {
    const [existingEmployees] = await pool.promise().query(
      'SELECT id FROM employees WHERE id = ?',
      [id]
    );

    if (existingEmployees.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    await pool.promise().query(
      'UPDATE employees SET name = ?, email = ?, department = ? WHERE id = ?',
      [name, email, department, id]
    );

    return res.status(200).json({
      message: 'Employee updated successfully.',
      employee: { id, name, email, department }
    });
  } catch (error) {
    return handleDatabaseError(error, res, 'update the employee');
  }
}

async function deleteEmployee(req, res) {
  const id = getValidEmployeeId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Employee ID must be a positive integer.' });
  }

  try {
    const [existingEmployees] = await pool.promise().query(
      'SELECT id FROM employees WHERE id = ?',
      [id]
    );

    if (existingEmployees.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    await pool.promise().query('DELETE FROM employees WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    return handleDatabaseError(error, res, 'delete the employee');
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
