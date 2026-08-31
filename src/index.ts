import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(PORT, () => {
  console.info(`🚀 Server running on http://localhost:${PORT}`);
  console.info(`   Environment: ${process.env.NODE_ENV ?? 'development'}`);
});
