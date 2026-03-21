// swagger.js  (usually placed in src/config/ or root)
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
      // Uncomment when you deploy
      // {
      //   url: 'https://api.gardenly.in',
      //   description: 'Production Server',
      // },
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
        // ────────────────────────────────────────────────
        // Product Schema
        // ────────────────────────────────────────────────
        Product: {
          type: 'object',
          required: ['name', 'price', 'category'],
          properties: {
            _id: { type: 'string', example: '64f8e123abc456def7890123' },
            name: { type: 'string', example: 'Monstera Deliciosa' },
            price: { type: 'number', example: 799 },
            category: { type: 'string', example: 'Plants' },
            description: { type: 'string', example: 'Beautiful indoor plant...' },
            stock: { type: 'integer', example: 45 },
            image: { type: 'string', example: 'https://cdn.gardenly.in/plants/monstera.jpg' },
            seller: { type: 'string', example: '64f7d456789abc123def4567' },
            sold: { type: 'integer', example: 12 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ────────────────────────────────────────────────
        // Order Schema
        // ────────────────────────────────────────────────
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '671234abcd5678ef90123456' },
            userId: { type: 'string', example: '64f7d456789abc123def4567' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string', example: '64f8e123abc456def7890123' },
                  sellerId: { type: 'string', example: '64f7d456789abc123def4567' },
                  quantity: { type: 'integer', example: 2 },
                  price: { type: 'number', example: 799 },
                  adminCommission: { type: 'number', example: 160 },
                  sellerEarning: { type: 'number', example: 639 },
                },
              },
            },
            totalAmount: { type: 'number', example: 1598 },
            totalAdminCommission: { type: 'number', example: 320 },
            billing: {
              type: 'object',
              properties: {
                fullName: { type: 'string', example: 'Pardhu Va' },
                phone: { type: 'string', example: '9876543210' },
                address1: { type: 'string', example: 'Flat 301, Green View Apts' },
                address2: { type: 'string', example: 'Banjara Hills' },
                city: { type: 'string', example: 'Hyderabad' },
                state: { type: 'string', example: 'Telangana' },
                pincode: { type: 'string', example: '500034' },
              },
            },
            status: {
              type: 'string',
              enum: ['pending_otp', 'confirmed', 'cancelled'],
              example: 'confirmed',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ────────────────────────────────────────────────
        // Basic Error response (used in many 4xx responses)
        // ────────────────────────────────────────────────
        Error: {
          type: 'object',
          description: 'Standard error response format',
          required: ['success', 'message', 'statusCode'],
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Always false for error responses'
            },
            message: {
              type: 'string',
              example: 'Invalid OTP or expired',
              description: 'Human-readable error explanation'
            },
            statusCode: {
              type: 'integer',
              example: 400,
              description: 'HTTP status code'
            },
            // Optional: add more fields you actually return
            // errorCode: { type: 'string', example: 'INVALID_OTP' },
            // details: { type: 'object', additionalProperties: true }
          },
          example: {
            success: false,
            message: 'Not enough stock for Monstera',
            statusCode: 400
          }
        },

        // You can add more later: User, Cart, LoginRequest, etc.
      },
    },
    tags: [
      { name: 'Products', description: 'Product catalog & seller management' },
      { name: 'Orders', description: 'Order placement with OTP verification (buyers)' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile & management' },
      // Add more tags as you create new route files
    ],
  },

  // Scan all route files — adjust if your structure is different
  apis: [
    path.join(process.cwd(), 'routes/**/*.js'),
    path.join(process.cwd(), 'src/routes/**/*.js'),      // in case routes are under src/
    path.join(process.cwd(), 'api/routes/**/*.js'),   // another common variant
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// ────────────────────────────────────────────────
// Debug output (remove or comment out in production)
// ────────────────────────────────────────────────
console.log('Swagger discovered paths count:', Object.keys(swaggerSpec.paths || {}).length);
// console.log('First few paths:', Object.keys(swaggerSpec.paths || {}).slice(0, 5));

const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,                    // show search bar
      swaggerOptions: {
        persistAuthorization: true,      // keep bearer token after refresh
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

  // Optional: redirect root → docs (very convenient)
  app.get('/', (req, res) => {
    res.redirect('/api-docs');
  });
};

export default setupSwagger;