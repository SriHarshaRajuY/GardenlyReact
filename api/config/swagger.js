// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gardenly API',
      version: '1.0.0',
      description: 'REST API for Gardenly - Online Plant Shop & Nursery\n\n' +
                   'Features: Product catalog, Seller dashboard, Buyer checkout with OTP verification, Revenue split (90% seller / 10% platform)',
      contact: {
        name: 'Gardenly Support',
        email: 'support@gardenly.in',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      // { url: 'https://api.gardenly.in', description: 'Production Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained after login (use "Bearer <token>" format)',
        },
      },
      schemas: {
        // Product (already exists)
        Product: {
          // ... your existing Product schema ...
        },

        // Order (already exists)
        Order: {
          // ... your existing Order schema ...
        },

        // Error (already exists)
        Error: {
          // ... your existing Error schema ...
        },

        // ────────────────────────────────────────────────
        // Cart Schema
        // ────────────────────────────────────────────────
        Cart: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '671234abcd5678ef90123456' },
            userId: { type: 'string', example: '64f7d456789abc123def4567' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: {
                    $ref: '#/components/schemas/Product',  // Reuses Product schema
                  },
                  quantity: { type: 'integer', example: 3 },
                },
              },
            },
            totalItems: { type: 'integer', example: 4 },
            totalPrice: { type: 'number', example: 2397 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Ticket Schema
        Ticket: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '672345efgh9012ijkl345678' },
            userId: { type: 'string', example: '64f7d456789abc123def4567' },
            expertId: { type: 'string', example: '64f8e456789abc123def9999' },
            subject: { type: 'string', example: 'Plant arrived damaged' },
            description: { type: 'string', example: 'Leaves yellowing...' },
            orderId: { type: 'string', example: '671234abcd5678ef90123456' },
            attachment: { type: 'string', example: 'https://cdn.gardenly.in/tickets/attach-123.jpg' },
            status: {
              type: 'string',
              enum: ['open', 'in-progress', 'resolved', 'closed'],
              example: 'resolved'
            },
            resolution: { type: 'string', example: 'Replacement sent' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Products', description: 'Product catalog & seller management' },
      { name: 'Orders', description: 'Order placement with OTP verification (buyers)' },
      { name: 'Cart', description: 'Shopping cart management (buyers)' },      // ← new
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile & management' },
    ],
  },

  apis: [
    path.join(process.cwd(), 'routes/**/*.js'),
    path.join(process.cwd(), 'src/routes/**/*.js'),
    path.join(process.cwd(), 'api/routes/**/*.js'),   // this should catch cart.route.js
  ],
};

const swaggerSpec = swaggerJsdoc(options);

console.log('Swagger discovered paths count:', Object.keys(swaggerSpec.paths || {}).length);

const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: false,
        tryItOutEnabled: true,
        filter: true,
      },
      customCss: `
        .swagger-ui .topbar { background-color: #2e7d32; }
        .swagger-ui .info a { color: #4caf50 !important; }
      `,
      customSiteTitle: 'Gardenly API Documentation',
    })
  );

  app.get('/', (req, res) => res.redirect('/api-docs'));
};

export default setupSwagger;