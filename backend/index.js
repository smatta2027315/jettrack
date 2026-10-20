const express = require('express');
const app = express();
const PORT = 3000;

// parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//const postsFeatures = require('./features/posts');
const authFeatures = require('./features/auth');

//app.use('/api', postsFeatures);
app.use('/api/auth', authFeatures);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
