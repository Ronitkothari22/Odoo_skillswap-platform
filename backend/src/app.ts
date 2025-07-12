import express, { Application } from 'express';
import routes from './routes';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './middleware/logger';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Security & common middlewares
app.use(cors());
app.use(helmet());
app.use(logger());
app.use(express.json());

// Mount routes
app.use('/api', routes);

// Fallback & error handling
app.use(notFound);
app.use(errorHandler);

export default app; 