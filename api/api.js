const express = require('express');

const apiRouter = express.Router();

const employeesRouter = require('./employees');
apiRouter.use('/employees', employeesRouter);

const menusRouter = require('./menus');
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;
