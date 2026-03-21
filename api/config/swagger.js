import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gardenly API',
      version: '1.0.0',
      description: 'API documentation for Gardenly plant shop',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      // { url: 'https://api.gardenly.in', description: 'Production' } ← later
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: { /* ← paste the schema shown above */ },
      },
    },
  },
  apis: [
    path.join(process.cwd(), 'routes/**/*.js'),           // ← most reliable
    // path.join(process.cwd(), 'src/routes/**/*.js'),    // alternative
    // path.join(__dirname, '../routes/*.js'),            // your original
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Debug – keep until it works
console.log("Swagger discovered paths count:", Object.keys(swaggerSpec.paths || {}).length);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,              // nice to have
    swaggerOptions: {
      persistAuthorization: true // keeps token after refresh
    }
  }));
};

export default setupSwagger;