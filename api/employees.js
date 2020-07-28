const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express  = require('express');
const employeesRouter = express.Router();

module.exports = employeesRouter;

const timesheetsRouter = require('./timesheets');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/', (req,res,next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1;',
  (err, employees) => {
    if(err) {
      next(err);
    } else {
      res.status(200).json({ employees: employees });
    }
  });
});

employeesRouter.param('employeeId', (req,res,next,id) => {
  db.get('SELECT * FROM Employee WHERE Employee.id = $id', { $id: id },
    (err, employee) => {
      if(err) {
        next(err);
      } else if(employee) {
        req.employee = employee;
        next();
      } else {
        res.sendStatus(404);
      }
  })
});

employeesRouter.get('/:employeeId', (req,res,next) => {
  res.status(200).json({ employee: req.employee });
});

employeesRouter.post('/', (req,res,next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.is_current_employee === 0 ? 0 : 1;

  if(!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = `INSERT INTO Employee (name, position, wage, is_current_employee)
  VALUES ($name, $position, $wage, $isCurrentEmployee)`;
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  };

  db.run(sql,values, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id=${this.lastID};`,
        (err, employee) => {
          res.status(201).json({ employee: employee });
      });
    }
  });
});

employeesRouter.put('/:employeeId', (req,res,next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.is_current_employee === 0? 0 : 1;

  if(!name || !position || !wage || !isCurrentEmployee) {
    return res.sendStatus(400);
  }

  const sql = `UPDATE Employee SET name=$name, position=$position, wage=$wage,
  is_current_employee=$isCurrentEmployee
  WHERE Employee.id = $id;`;
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $id: req.params.employeeId
  };

  db.run(sql,values, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId};`,
        (error, employee) => {
          res.status(200).json({ employee: employee });
      });
    }
  });
});

employeesRouter.delete('/:employeeId', (req,res,next) => {
  const sql = `UPDATE Employee SET is_current_employee=0
  WHERE Employee.id = $id;`;
  const values = { $id: req.params.employeeId };
  db.run(sql,values, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id=${req.params.employeeId};`,
      (error, employee) => {
        res.status(200).send({ employee: employee });
      });
    }
  });
});
