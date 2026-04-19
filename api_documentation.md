# Gardenly REST API Documentation (Complete Reference)

This document provides a complete reference for all RESTful web services provided by the Gardenly platform.

## Base URL
`http://localhost:3000/api`

## 1. Authentication & User Profile (B2C/B2B Core)
Common endpoints for identity management.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/auth/signup` | Create a new account (Buyer, Seller, Admin, or Expert). |
| POST | `/auth/signin` | Login to the platform. |
| POST | `/auth/google` | Google OAuth integration. |
| POST | `/auth/forgot-password` | Request password reset OTP. |
| POST | `/auth/reset-password` | Reset password using OTP. |
| POST | `/auth/logout` | Logout (clears session cookie). |
| GET | `/auth/check` | Verify session authentication status. |
| GET | `/user/me` | Get current logged-in user profile details. |

---

## 2. B2C Services (Business-to-Consumer)
Designed for Buyers to browse, shop, and manage requests.

### Product Browsing & Search
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/products` | Get recent products (Paginated & Cached). |
| GET | `/products/category/:category` | Get products by specific category (Cached). |
| GET | `/products/search?q=...` | **Optimized Search:** Weighted relevance scoring across Name, Category, and Description. |

### Shopping Cart & Ordering
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/cart` | View current shopping cart. |
| POST | `/cart/add` | Add product to cart. |
| PUT | `/cart/update` | Update item quantity in cart. |
| DELETE | `/cart/remove/:productId` | Remove item from cart. |
| POST | `/cart/checkout` | Initiate checkout process. |
| POST | `/orders/send-otp` | Send verification OTP for order confirmation. |
| POST | `/orders/verify-otp` | Finalize order after OTP verification. |

### Custom Service Requests
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/custom-requests` | Submit a new custom service/product request. |
| GET | `/custom-requests/my-requests` | View all custom requests submitted by the user. |
| PUT | `/custom-requests/:id/proposals/:pId/accept` | Accept a seller's proposal for a custom request. |

### Support Tickets
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/tickets/submit` | Submit a new support ticket (with attachment). |
| GET | `/tickets/user` | View tickets submitted by the current user. |
| GET | `/tickets/:id` | View detailed status of a specific ticket. |

---

## 3. B2B Services (Business-to-Business)
Designed for Sellers, Experts, and Delivery personnel.

### Seller Inventory & Sales Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/products` | Add a new product to the platform (Multipart/Image). |
| PUT | `/products/:id` | Update existing product details. |
| DELETE | `/products/:id` | Remove a product from the inventory. |
| GET | `/products/seller` | View all products listed by the seller. |
| GET | `/products/top-sales` | View best-selling products for the business. |
| GET | `/products/recent-sales` | View latest sales activity. |
| GET | `/seller/orders` | Manage orders placed for the seller's products. |
| GET | `/seller/summary` | View business performance analytics (Revenue, Orders). |

### Seller Lead Generation (Custom Requests)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/custom-requests/open` | View all open buyer requests in the marketplace. |
| POST | `/custom-requests/:id/proposals` | Submit a business proposal to fulfill a buyer's request. |

### Expert Support Services
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/tickets/expert` | View support tickets assigned for expert resolution. |
| POST | `/tickets/:id/resolve` | Provide expert resolution to a buyer's ticket. |

### Delivery Logistics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/delivery/agents` | View available delivery agents (Manager view). |
| GET | `/delivery/stats` | View agent performance statistics. |

---

## 4. Administrative Services (Platform-Level B2B)
Full control endpoints for platform administrators.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/admin/dashboard` | Platform-wide health and business metrics. |
| GET | `/admin/users` | List and manage all platform users (Buyers, Sellers, etc). |
| DELETE | `/admin/users/:id` | Suspend or remove a user account. |
| GET | `/admin/products` | Platform-wide inventory audit. |
| DELETE | `/admin/products/:id` | Remove a product for policy violations. |
| GET | `/admin/orders` | Monitor all platform transactions. |
| GET | `/admin/tickets` | Manage all support activity. |
| PATCH | `/admin/tickets/:id/resolve` | Administrative resolution of support issues. |

---

## 5. System & Testing
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/test/send-test-email` | Verify SMTP configuration and email delivery. |

---

## Technical Specifications
- **Format:** All requests and responses use `application/json` (except file uploads which use `multipart/form-data`).
- **Security:** Statefull JWT authentication via HTTP-Only Cookies (`access_token`).
- **Optimization:** High-traffic B2C endpoints are cached using **Redis** (78%+ speed improvement).
- **Search:** Advanced Weighted Relevance scoring for optimized user search experience.
