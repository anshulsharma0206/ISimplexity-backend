const Events = require('./Events');
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

const eventsInstance = new Events();

// Set up middleware for parsing JSON
app.use(bodyParser.json());

// Set up an endpoint to serve your HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle button click
app.post('/', async (req, res) => {
  console.log('Button clicked!');
  await eventsInstance.logEvent("buttonClicked");
  // res.send('Button click logged');
  res.redirect('/success');
});

// Serve the success page
app.get('/success', (req, res) => {
  // Render an HTML page with a JavaScript script to handle the delayed redirection
  res.send(`
    <html>
      <head>
        <title>Success</title>
      </head>
      <body>
        <h1>Button click logged</h1>
        <script>
          setTimeout(function() {
            // Redirect back to the home route after 2 seconds
            window.location.href = '/';
          }, 2000);
        </script>
      </body>
    </html>
  `);
});


// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection');
  try{
    await eventsInstance.closeMongoConnection();
    process.exit();
  }
  catch(error) {
    console.error("Error closing mongo connection", error);
  }
});