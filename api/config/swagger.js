import express from "express";

export function createSwaggerRouter() {
  const router = express.Router();

  // Helmet enables CSP globally; Swagger UI needs external + inline scripts/styles.
  // Override CSP for just the docs endpoints.
  router.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; " +
        "img-src * data: blob:; " +
        "style-src * 'unsafe-inline'; " +
        "script-src * 'unsafe-inline' 'unsafe-eval'; " +
        "connect-src * data: blob:; " +
        "font-src * data:;"
    );
    next();
  });

  router.get("/", (req, res) => {
    res
      .status(200)
      .type("html")
      .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gardenly API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api-docs/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true
      });
    </script>
  </body>
</html>`);
  });

  router.get("/swagger.json", (req, res) => {
    res.status(200).json(openApiSpec);
  });

  return router;
}

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Gardenly API",
    version: "1.0.0",
    description: "OpenAPI specification for the Gardenly backend (Express).",
  },
  servers: [{ url: "http://localhost:3000", description: "Local dev" }],
  tags: [
    { name: "Auth" },
    { name: "User" },
    { name: "Products" },
    { name: "Cart" },
    { name: "Orders" },
    { name: "Admin" },
    { name: "Seller" },
    { name: "Tickets" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "access_token" },
    },
    schemas: {
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          status: { type: "integer", example: 401 },
          message: { type: "string", example: "Unauthorized" },
          stack: { type: "string", nullable: true },
        },
      },
      AuthCheckResponse: {
        type: "object",
        properties: {
          isAuthenticated: { type: "boolean" },
          role: { type: "string", nullable: true },
          username: { type: "string", nullable: true },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f0c2f2c2a1b2c3d4e5f678" },
          username: { type: "string", example: "john" },
          email: { type: "string", example: "john@example.com" },
          role: {
            type: "string",
            example: "buyer",
            description: "Role values depend on server implementation.",
          },
        },
        additionalProperties: true,
      },
      Product: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          category: { type: "string" },
          price: { type: "number" },
          imageUrl: { type: "string" },
          sellerId: { type: "string" },
        },
        additionalProperties: true,
      },
      CartItem: {
        type: "object",
        properties: {
          productId: { type: "string" },
          quantity: { type: "integer", minimum: 1 },
          product: { $ref: "#/components/schemas/Product" },
        },
        additionalProperties: true,
      },
      Cart: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } },
          total: { type: "number" },
        },
        additionalProperties: true,
      },
      OtpRequest: {
        type: "object",
        properties: {
          email: { type: "string" },
        },
        additionalProperties: true,
      },
      Ticket: {
        type: "object",
        properties: {
          _id: { type: "string" },
          subject: { type: "string" },
          message: { type: "string" },
          status: { type: "string", example: "open" },
          createdAt: { type: "string", format: "date-time" },
        },
        additionalProperties: true,
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
        },
        additionalProperties: true,
      },
    },
    responses: {
      Unauthorized: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
    },
  },
  paths: {
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Sign up",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
            },
          },
        },
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          400: { description: "Bad Request" },
        },
      },
    },
    "/api/auth/signin": {
      post: {
        tags: ["Auth"],
        summary: "Sign in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
            },
          },
        },
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          400: { description: "Bad Request" },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
            },
          },
        },
        responses: { 200: { description: "OK" }, 400: { description: "Bad Request" } },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
            },
          },
        },
        responses: { 200: { description: "OK" }, 400: { description: "Bad Request" } },
      },
    },
    "/api/auth/check": {
      get: {
        tags: ["Auth"],
        summary: "Check authentication (reads access_token cookie)",
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthCheckResponse" } } } },
        },
      },
    },
    "/api/user/me": {
      get: {
        tags: ["User"],
        summary: "Get current user profile",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserProfile" } } },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Get recent products",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Product" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Add a product (seller only; multipart with image)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: { image: { type: "string", format: "binary" } },
                additionalProperties: true,
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/products/search": {
      get: {
        tags: ["Products"],
        summary: "Search products",
        parameters: [{ in: "query", name: "q", required: false, schema: { type: "string" } }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } },
            },
          },
        },
      },
    },
    "/api/products/category/{category}": {
      get: {
        tags: ["Products"],
        summary: "Get products by category",
        parameters: [{ in: "path", name: "category", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } },
            },
          },
        },
      },
    },
    "/api/products/seller": {
      get: {
        tags: ["Products"],
        summary: "Get seller products (seller only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/products/top-sales": {
      get: {
        tags: ["Products"],
        summary: "Get top sales (seller only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/products/recent-sales": {
      get: {
        tags: ["Products"],
        summary: "Get recent sales (seller only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/products/{id}": {
      put: {
        tags: ["Products"],
        summary: "Update product (seller only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { type: "object", additionalProperties: true } },
          },
        },
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product (seller only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get cart (buyer only)",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Cart" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/cart/add": {
      post: {
        tags: ["Cart"],
        summary: "Add item to cart (buyer only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { type: "object", additionalProperties: true } },
          },
        },
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/cart/update": {
      put: {
        tags: ["Cart"],
        summary: "Update cart item (buyer only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { type: "object", additionalProperties: true } },
          },
        },
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/cart/remove/{productId}": {
      delete: {
        tags: ["Cart"],
        summary: "Remove item from cart (buyer only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ in: "path", name: "productId", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/cart/checkout": {
      post: {
        tags: ["Cart"],
        summary: "Checkout (buyer only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/orders/send-otp": {
      post: {
        tags: ["Orders"],
        summary: "Send order OTP (buyer only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/OtpRequest" } },
          },
        },
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/orders/verify-otp": {
      post: {
        tags: ["Orders"],
        summary: "Verify order OTP (buyer only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { type: "object", additionalProperties: true } },
          },
        },
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Get admin dashboard (admin only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (admin only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/admin/products": {
      get: {
        tags: ["Admin"],
        summary: "List all products (admin only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/seller/orders": {
      get: {
        tags: ["Seller"],
        summary: "Get seller orders (seller only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/seller/summary": {
      get: {
        tags: ["Seller"],
        summary: "Get seller summary (seller only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/tickets/submit": {
      post: {
        tags: ["Tickets"],
        summary: "Submit a support ticket (authenticated; multipart attachment)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: { attachment: { type: "string", format: "binary" } },
                additionalProperties: true,
              },
            },
          },
        },
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/tickets/user": {
      get: {
        tags: ["Tickets"],
        summary: "Get current user's tickets",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Ticket" } } } },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/tickets/expert": {
      get: {
        tags: ["Tickets"],
        summary: "Get expert tickets",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Ticket" } } } },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/tickets/{id}": {
      get: {
        tags: ["Tickets"],
        summary: "Get a ticket by id",
        security: [{ cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/tickets/{id}/resolve": {
      post: {
        tags: ["Tickets"],
        summary: "Resolve a ticket (expert)",
        security: [{ cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
  },
};

