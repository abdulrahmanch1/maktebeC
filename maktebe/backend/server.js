const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/test-simple', (req, res) => {
  res.status(200).json({ message: 'Simple backend is running!' });
});

app.listen(PORT, () => console.log(`Simple server running on port ${PORT}`));

module.exports = app;