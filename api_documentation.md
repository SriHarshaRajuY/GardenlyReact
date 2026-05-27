# Gardenly REST API Reference

Base URL: `http://localhost:3000/api`

API documentation is also available from the running backend at `/api-docs`.

## Authentication and User Profile

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/auth/signup` | Create a public account as Buyer, Seller, or Expert. |
| POST | `/auth/signin` | Sign in with username, password, and role. |
| POST | `/auth/google` | Sign in or create a public account through Google. |
| POST | `/auth/verify-email` | Verify a signup email OTP. |
| POST | `/auth/forgot-password` | Request a password reset OTP. |
| POST | `/auth/reset-password` | Reset password using OTP. |
| POST | `/auth/logout` | Clear the authenticated session cookie. |
| GET | `/auth/check` | Check cookie authentication status. |
| GET | `/user/me` | Get the current authenticated user profile. |

## Products

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/products` | Get paginated recent products. |
| GET | `/products/category/:category` | Get products by category. |
| GET | `/products/search?q=...` | Search products using MongoDB weighted text search. |
| POST | `/products` | Add a product as a seller. |
| PUT | `/products/:id` | Update a seller-owned product. |
| DELETE | `/products/:id` | Delete a seller-owned product. |
| GET | `/products/seller` | Get products owned by the current seller. |
| GET | `/products/top-sales` | Get seller top-sales analytics. |
| GET | `/products/recent-sales` | Get seller recent-sales analytics. |

## Cart and Orders

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/cart` | Get the current buyer cart. |
| POST | `/cart/add` | Add a product to the cart. |
| PUT | `/cart/update` | Update item quantity. |
| DELETE | `/cart/remove/:productId` | Remove an item from the cart. |
| POST | `/orders/send-otp` | Create an OTP-backed order confirmation flow. |
| POST | `/orders/verify-otp` | Confirm an OTP-backed order. |
| POST | `/orders/create-razorpay-order` | Create a Razorpay test-mode order from the authenticated cart. |
| POST | `/orders/verify-razorpay-payment` | Verify Razorpay payment signature and confirm the order. |

## Custom Requests

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/custom-requests` | Create a buyer custom request. |
| GET | `/custom-requests/my-requests` | Get the current buyer's custom requests. |
| GET | `/custom-requests/open` | Get open custom requests as a seller. |
| POST | `/custom-requests/:id/proposals` | Submit a seller proposal. |
| PUT | `/custom-requests/:id/proposals/:proposalId/accept` | Accept one proposal as the buyer. |

## Support Tickets

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/tickets/submit` | Submit a buyer support ticket with optional image attachment. |
| GET | `/tickets/user` | Get tickets submitted by the current buyer. |
| GET | `/tickets/expert` | Get tickets assigned to the current expert. |
| GET | `/tickets/:id` | Get a ticket as the requester, assigned expert, or admin. |
| POST | `/tickets/:id/resolve` | Resolve an assigned ticket as an expert. |

## Seller

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/seller/orders` | Get orders containing the seller's products. |
| GET | `/seller/summary` | Get seller business summary metrics. |

## Admin

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/admin/dashboard` | Get platform dashboard metrics. |
| GET | `/admin/users` | List all users. |
| DELETE | `/admin/users/:id` | Delete a user and related records. |
| GET | `/admin/products` | List all products. |
| DELETE | `/admin/products/:id` | Delete a product and related cart/search records. |
| GET | `/admin/orders` | List all orders. |
| GET | `/admin/tickets` | List all tickets. |
| PATCH | `/admin/tickets/:id/resolve` | Resolve a ticket as admin. |

## Notes

- Authentication uses an httpOnly `access_token` cookie.
- Production cross-site cookie deployments require CSRF headers on state-changing requests.
- File upload endpoints require authentication.
- Public signup cannot create admin users.
- Product writes are restricted to sellers and product categories are validated server-side.
