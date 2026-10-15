require('dotenv').config();

const express = require('express');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');
const pool = require('./config/db');

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Employee Management backend is running.' });
});

app.use('/api/employees', employeeRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }

  console.error('Unexpected server error:', error);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function startServer() {
  try {
    await pool.promise().query('SELECT 1');
    console.log('Database connection successful.');

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Could not connect to the database. Check your .env settings and MySQL server.');
    console.error(error.message);
    await pool.end();
    process.exitCode = 1;
  }
}

startServer();
