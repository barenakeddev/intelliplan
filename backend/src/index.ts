import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkConnection } from './utils/supabaseClient';
import { errorHandler, logger } from './utils/errorHandler';
import routes from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

// Check connection at startup
checkConnection()
  .then(connected => {
    if (connected) {
      logger.info('Supabase connection successful');
    } else {
      logger.error('Failed to connect to Supabase');
    }
  })
  .catch(error => {
    logger.error('Error checking Supabase connection', error);
  });

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
}); 