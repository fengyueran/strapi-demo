const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  console.log('Event triggered:', req.body);
  res.sendStatus(200);
});

app.listen(8000, () => console.log('listening on port 8000'));
