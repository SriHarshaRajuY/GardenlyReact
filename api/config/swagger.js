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
        // ────────────────────────────────────────────────
        // Product
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
        // Order
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
                  product: { type: 'string' },
                  sellerId: { type: 'string' },
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
                fullName: { type: 'string' },
                phone: { type: 'string' },
                address1: { type: 'string' },
                address2: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' },
              },
            },
            status: { type: 'string', enum: ['pending_otp', 'confirmed', 'cancelled'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ────────────────────────────────────────────────
        // Cart
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
                  product: { $ref: '#/components/schemas/Product' },
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

        // ────────────────────────────────────────────────
        // Ticket
        // ────────────────────────────────────────────────
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

        // ────────────────────────────────────────────────
        // Error (already exists)
        // ────────────────────────────────────────────────
        Error: {
          type: 'object',
          description: 'Standard error response format',
          required: ['success', 'message', 'statusCode'],
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Invalid OTP or expired' },
            statusCode: { type: 'integer', example: 400 },
          },
          example: {
            success: false,
            message: 'Not enough stock for Monstera',
            statusCode: 400
          }
        },

        // ────────────────────────────────────────────────
        // NEW: User Schema
        // ────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f7d456789abc123def4567' },
            name: { type: 'string', example: 'Pardhu Va' },
            email: { type: 'string', example: 'pardhu@example.com' },
            phone: { type: 'string', example: '9876543210' },
            role: {
              type: 'string',
              enum: ['buyer', 'seller', 'expert', 'admin'],
              example: 'buyer'
            },
            avatar: { type: 'string', nullable: true, example: 'https://cdn.gardenly.in/avatars/123.jpg' },
            addresses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  fullName: { type: 'string' },
                  address1: { type: 'string' },
                  address2: { type: 'string', nullable: true },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  pincode: { type: 'string' },
                  isDefault: { type: 'boolean', default: false }
                }
              }
            },
            isVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    tags: [
      { name: 'Products', description: 'Product catalog & seller management' },
      { name: 'Orders', description: 'Order placement with OTP verification (buyers)' },
      { name: 'Cart', description: 'Shopping cart management (buyers)' },
      { name: 'Tickets', description: 'Support ticket system (issue reporting & resolution)' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile & account management' }
    ]
  },

  apis: [
    path.join(process.cwd(), 'routes/**/*.js'),
    path.join(process.cwd(), 'src/routes/**/*.js'),
    path.join(process.cwd(), 'api/routes/**/*.js')
  ]
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
        filter: true
      },
      customCss: `
        .swagger-ui .topbar { background-color: #2e7d32; }
        .swagger-ui .info a { color: #4caf50 !important; }
      `,
      customSiteTitle: 'Gardenly API Documentation'
    })
  );

  app.get('/', (req, res) => res.redirect('/api-docs'));
};

export default setupSwagger;