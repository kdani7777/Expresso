const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());
app.use(morgan('tiny'));

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is now listening on PORT: ${PORT}`);
});

module.exports = app;
