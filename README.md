# Gardenly

Gardenly is a full-stack MERN marketplace for plants and gardening products. It includes buyer checkout, seller product management, community posts, blogs, custom buyer requests, expert support tickets, admin controls, Redis-backed caching, Solr product search, Cloudinary uploads, and Razorpay test-mode payment verification.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO
- Frontend: React, Vite, Tailwind CSS
- Auth: JWT in httpOnly cookies, Google sign-in support
- Storage and integrations: Cloudinary, Redis, Solr, Nodemailer, Razorpay
- Testing: Jest, Supertest, Vitest, React Testing Library

## Repository Structure

```text
api/                 Express API, models, controllers, routes, middleware
client/              React/Vite frontend
client/src/          Frontend pages, components, context, Redux, utilities
tests/               Backend integration and unit tests
.env.example         Backend environment template
client/.env.example  Frontend environment template
```

## Prerequisites

- Node.js 20 or newer
- MongoDB connection string
- Redis instance
- Solr core for product search
- Cloudinary account
- Email provider credentials for OTP and notifications
- Razorpay test credentials for simulated/test payments

## Environment Variables

Create a backend `.env` file from `.env.example`.

```bash
cp .env.example .env
```

Core backend variables:

```text
MONGO_URI
PORT
NODE_ENV
CLIENT_ORIGIN
JWT_SECRET
```

Feature integration variables:

```text
GOOGLE_CLIENT_ID
EMAIL_HOST
EMAIL_PORT
EMAIL_SECURE
EMAIL_USER
EMAIL_PASS
MAIL_FROM
CLOUD_NAME
CLOUD_API_KEY
CLOUD_API_SECRET
REDIS_URL
SOLR_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

`MONGO_URI` and `JWT_SECRET` are validated at backend startup. The remaining integration values are required for their related features: Google sign-in, OTP email, Cloudinary uploads, Redis caching, Solr search, and Razorpay payments.

Create a frontend env file from `client/.env.example`.

```bash
cp client/.env.example client/.env
```

Required frontend variables:

```text
VITE_BACKEND_URL
VITE_GOOGLE_CLIENT_ID
VITE_RAZORPAY_KEY_ID
```

Do not commit real `.env` files. Rotate any credential that has already been shared outside a trusted secret manager.

## Installation

Install backend dependencies from the repository root.

```bash
npm install
```

Install frontend dependencies.

```bash
npm install --prefix client
```

## Running Locally

Start the backend API.

```bash
npm run dev
```

Start the frontend in a second terminal.

```bash
npm run client:dev
```

Default local URLs:

```text
Backend:  http://localhost:3000
Frontend: http://localhost:5173
API Docs: http://localhost:3000/api-docs
```

## Testing and Quality Checks

Run backend tests.

```bash
npm test
```

Run frontend tests.

```bash
npm run client:test
```

Run frontend linting.

```bash
npm run client:lint
```

Build the frontend.

```bash
npm run client:build
```

## Main Features

- Buyer signup, sign-in, Google auth, email verification, cart, checkout, orders, custom requests, and expert support tickets
- Seller product management, order visibility, sales summaries, and custom request proposals
- Expert dashboard for assigned support tickets and resolutions
- Admin dashboards for users, products, orders, tickets, blogs, community content, and custom requests
- Blog and community modules with moderated admin write access
- Product search through Solr and application caching through Redis

## Security Notes

- Public signup supports Buyer, Seller, and Expert roles only. Admin users must be created through a trusted backend or database process.
- Razorpay order amounts are calculated on the server from the authenticated cart. Payment confirmation requires Razorpay signature verification.
- State-changing routes use cookie authentication plus CSRF protection for production cross-site cookie deployments.
- Generic file uploads are authenticated and rate-limited.

## Deployment Notes

- Set `NODE_ENV=production` on the backend.
- Set `CLIENT_ORIGIN` to the deployed frontend origin.
- Set `VITE_BACKEND_URL` to the deployed backend origin before building the frontend.
- If the frontend and backend are served through the included Nginx container, leave `VITE_BACKEND_URL` empty so browser API and Socket.IO calls use the same origin.
- The Docker Compose stack sets container-local `REDIS_URL`, `SOLR_URL`, and `CLIENT_ORIGIN` defaults for the backend service.
- For a separate frontend image build, pass public Vite build args when needed:

```bash
docker build -f Dockerfile.client \
  --build-arg VITE_BACKEND_URL=https://your-api.example.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=your_google_client_id \
  --build-arg VITE_RAZORPAY_KEY_ID=your_razorpay_key_id \
  -t gardenly-client .
```

- Use Razorpay test keys unless you intentionally want live payment behavior.
- Confirm Redis, Solr, Cloudinary, email, MongoDB, and Razorpay credentials are available in the deployment environment.
- Ensure `/api`, `/api-docs`, `/images`, `/uploads`, and `/socket.io` are routed to the backend when deploying behind a custom reverse proxy.
