const express = require('express');
const router = express.Router();

// Temporary test route (optional)
router.get('/', (req, res) => {
  res.send('Users page');
});

module.exports = router;
