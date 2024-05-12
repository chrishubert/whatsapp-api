import { config } from 'dotenv';
import app from './src/app';
import { baseWebhookURL } from './src/config';

config();

// Start the server
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Check if BASE_WEBHOOK_URL environment variable is available
if (!baseWebhookURL) {
  console.error(
    'BASE_WEBHOOK_URL environment variable is not available. Exiting...',
  );
  process.exit(1); // Terminate the application with an error code
}

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
});
