const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express  = require('express');
const timesheetsRouter = express.Router({ mergeParams: true });

module.exports = timesheetsRouter;

timesheetsRouter.param('timesheetId', (req,res,next,id) => {
  db.get('SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId',
  {
    $timesheetId: id
  }, (error, timesheet) => {
    if(error) {
      next(error);
    } else if(timesheet) {
      next()
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get('/', (req,res,next) => {
  db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id=${req.params.employeeId}`,
    (error, timesheets) => {
      if(error) {
        next(error);
      } else {
        res.status(200).json({ timesheets: timesheets });
      }
  });
});

timesheetsRouter.post('/', (req,res,next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId; //req.body.timesheet.employee_id;

  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId;';
  const employeeValues = { $employeeId: employeeId };

  db.get(employeeSql, employeeValues, (error, employee) => {
    if(error) {
      next(error);
    } else {
      if(!hours || !rate || !date) {
        return res.sendStatus(400);
      }

      const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id)
      VALUES ($hours, $rate, $date, $employeeId);`;
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
      };

      db.run(sql,values, function(error) {
        if(error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID};`,
            (error, timesheet) => {
              res.status(201).send({ timesheet: timesheet });
          });
        }
      });
    }
  });
});

timesheetsRouter.put('/:timesheetId', (req,res,next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId; //req.body.timesheet.employee_id;

  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId;';
  const employeeValues = { $employeeId: employeeId };

  db.get(employeeSql, employeeValues, (error, employee) => {
    if(error) {
      next(error);
    } else {
      if(!hours || !rate || !date) {
        return res.sendStatus(400);
      }

      const sql = `UPDATE Timesheet SET hours=$hours, rate=$rate, date=$date
      WHERE Timesheet.id=$timesheetId;`;
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $timesheetId: req.params.timesheetId
      };

      db.run(sql,values, function(error) {
        if(error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId};`,
            (error, timesheet) => {
              res.status(200).send({ timesheet: timesheet });
          });
        }
      });
    }
  });
});

timesheetsRouter.delete('/:timesheetId', (req,res,next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id=$timesheetId';
  const values = { $timesheetId: req.params.timesheetId };
  db.run(sql,values, function(error) {
    if(error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});
