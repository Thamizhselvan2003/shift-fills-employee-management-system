# Employee Management System Backend

A simple REST API for creating, viewing, updating, and deleting employees. It uses Express.js and stores employee data in MySQL.

## Technologies

- Node.js
- Express.js
- MySQL
- mysql2
- cors
- dotenv
- nodemon (development only)

## Project structure

```text
backend/
├── config/
│   └── db.js
├── controllers/
│   └── employeeController.js
├── routes/
│   └── employeeRoutes.js
├── database/
│   └── schema.sql
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Windows installation

In PowerShell, run these commands from the folder where you want the project:

```powershell
mkdir backend
cd backend
npm init -y
npm install express cors dotenv mysql2
npm install --save-dev nodemon
```

If the project folder already exists, open it instead of running `mkdir` and `npm init -y` again. Set the `start` and `dev` scripts in `package.json` to:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

The dependencies and scripts are already configured in this project's `package.json`.

## MySQL setup

1. Start the MySQL server and open MySQL Workbench.
2. Open `database/schema.sql` in Workbench (File > Open SQL Script).
3. Connect to your local MySQL server.
4. Click the lightning-bolt Execute button. The script creates and selects `employee_management`, then creates the `employees` table.

The table uses an auto-incrementing integer ID and requires a unique email address.

## Environment configuration

Edit the root `.env` file and enter the credentials for your local MySQL account:

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_management
PORT=5000
```

Replace `your_mysql_password` with your own MySQL password. Do not share or commit `.env`; it is excluded by `.gitignore`.

## Start the server

Run these commands from the project folder:

```powershell
npm run dev
```

For normal startup without automatic restarts, use:

```powershell
npm start
```

The server checks the database connection before listening for requests. By default, it runs at `http://localhost:5000`.

## API endpoints

All endpoints use the `/api/employees` base path. JSON responses contain employee records or an `error`/`message` field.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Create an employee |
| PUT | `/api/employees/:id` | Replace an employee's name, email, and department |
| DELETE | `/api/employees/:id` | Delete an employee |

The POST and PUT request body must include all three fields:

```json
{
  "name": "Hari",
  "email": "hari@example.com",
  "department": "IT"
}
```

## Test with Postman

1. Start MySQL and run `database/schema.sql`.
2. Set your local MySQL values in `.env` and start the backend.
3. In Postman, send requests to `http://localhost:5000/api/employees`.
4. To add an employee, choose POST, select Body > raw > JSON, and use the example JSON above.
5. Use GET to list employees, or copy an employee ID from the response and use it in `GET`, `PUT`, or `DELETE` URLs. PUT uses the same JSON body as POST.

Use `http://localhost:5000/` to confirm the backend is running. The API allows browser requests from Angular at `http://localhost:4200`.
