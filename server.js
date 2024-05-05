const { createServer } = require("http");
const app = require("./src/app");
const { baseWebhookURL } = require("./src/config");
require("dotenv").config();

// Start the server
const port = process.env.PORT || 3000;

// Check if BASE_WEBHOOK_URL environment variable is available
if (!baseWebhookURL) {
  console.error(
    "BASE_WEBHOOK_URL environment variable is not available. Exiting..."
  );
  process.exit(1); // Terminate the application with an error code
}

// Créer un serveur HTTP et passer les requêtes à l'application Express
const server = createServer(app);

// Démarrer le serveur
server.listen(port, () => {
  console.log(
    `Le serveur est en cours d'exécution sur http://localhost:${port}`
  );
});

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`)
// })
