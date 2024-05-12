import './routes';
import { restoreSessions } from './sessions';
import { routes } from './routes';
import express from 'express';
import { json, urlencoded } from 'body-parser';
import { maxAttachmentSize } from './config';

const app = express();

// Initialize Express app
app.disable('x-powered-by');
app.use(json({ limit: maxAttachmentSize + 1000000 }));
app.use(urlencoded({ limit: maxAttachmentSize + 1000000, extended: true }));
app.use('/', routes);

restoreSessions();

export default app;
