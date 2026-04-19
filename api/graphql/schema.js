import { buildSchema } from "graphql";

/**
 * Experimental GraphQL schema module.
 * Note: this file is currently standalone and not wired to Express routes.
 */
export const schema = buildSchema(`
  scalar DateTime

  enum UserRole {
    Buyer
    Seller
    Admin
    Expert
  }

  enum TicketType {
    general
    technical
    billing
  }

  enum TicketStatus {
    Open
    Resolved
  }

  enum OrderStatus {
    pending_otp
    confirmed
    cancelled
  }

  enum DeliveryStatus {
    unassigned
    assigned
    picked_up
    in_transit
    delivered
    failed
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: UserRole!
    mobile: String
    expertise: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Product {
    id: ID!
    name: String!
    description: String
    category: String!
    price: Float!
    quantity: Int!
    sold: Int
    image: String
    sellerId: ID
    createdAt: DateTime
    updatedAt: DateTime
  }

  type CartItem {
    productId: ID!
    quantity: Int!
    product: Product
  }

  type Cart {
    id: ID!
    userId: ID!
    items: [CartItem!]!
    totalItems: Int!
    estimatedTotal: Float!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type BillingAddress {
    fullName: String!
    phone: String!
    address1: String!
    address2: String
    city: String!
    state: String!
    pincode: String!
  }

  type OrderItem {
    productId: ID!
    sellerId: ID
    quantity: Int!
    price: Float!
    adminCommission: Float
    sellerEarning: Float
    product: Product
  }

  type Order {
    id: ID!
    userId: ID!
    items: [OrderItem!]!
    totalAmount: Float!
    totalAdminCommission: Float
    status: OrderStatus!
    deliveryStatus: DeliveryStatus
    billing: BillingAddress
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Ticket {
    id: ID!
    requester: String!
    subject: String!
    type: TicketType!
    description: String!
    status: TicketStatus!
    expertId: ID
    resolution: String
    attachment: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type AdminOrderStats {
    total: Int!
    pending: Int!
    confirmed: Int!
    cancelled: Int!
    revenue: Float!
  }

  type AdminUserStats {
    total: Int!
    buyers: Int!
    sellers: Int!
    experts: Int!
    admins: Int!
  }

  type AdminTicketStats {
    total: Int!
    open: Int!
    resolved: Int!
  }

  type AdminStats {
    users: AdminUserStats!
    orders: AdminOrderStats!
    tickets: AdminTicketStats!
  }

  type AuthPayload {
    success: Boolean!
    token: String
    message: String
    user: User
  }

  type GenericResponse {
    success: Boolean!
    message: String!
  }

  type ProductList {
    items: [Product!]!
    pageInfo: PaginationInfo!
  }

  type TicketList {
    items: [Ticket!]!
    pageInfo: PaginationInfo!
  }

  type OrderList {
    items: [Order!]!
    pageInfo: PaginationInfo!
  }

  input SignupInput {
    username: String!
    email: String!
    password: String!
    role: UserRole!
    mobile: String!
    expertise: String
  }

  input SigninInput {
    username: String!
    password: String!
    role: UserRole!
  }

  input GoogleSigninInput {
    credential: String!
    role: UserRole = Buyer
  }

  input ProductFilterInput {
    category: String
    q: String
    minPrice: Float
    maxPrice: Float
    sellerId: ID
  }

  input ProductInput {
    name: String!
    description: String
    category: String!
    price: Float!
    quantity: Int!
    image: String
  }

  input ProductUpdateInput {
    name: String
    description: String
    category: String
    price: Float
    quantity: Int
    image: String
  }

  input CartItemInput {
    productId: ID!
    quantity: Int = 1
  }

  input BillingInput {
    fullName: String!
    phone: String!
    address1: String!
    address2: String
    city: String!
    state: String!
    pincode: String!
  }

  input SendOrderOtpInput {
    billing: BillingInput!
  }

  input VerifyOrderOtpInput {
    orderId: ID!
    otp: String!
  }

  input TicketInput {
    subject: String!
    type: TicketType!
    description: String!
    attachment: String
  }

  input ResolveTicketInput {
    ticketId: ID!
    resolution: String!
  }

  type Query {
    health: String!
    appName: String!
    appVersion: String!

    me: User
    userById(id: ID!): User

    products(page: Int = 1, limit: Int = 12, filter: ProductFilterInput): ProductList!
    productById(id: ID!): Product

    cart: Cart

    myOrders(page: Int = 1, limit: Int = 10): OrderList!
    orderById(id: ID!): Order

    myTickets(page: Int = 1, limit: Int = 10): TicketList!
    ticketById(id: ID!): Ticket

    adminStats: AdminStats
  }

  type Mutation {
    signup(input: SignupInput!): GenericResponse!
    signin(input: SigninInput!): AuthPayload!
    signinWithGoogle(input: GoogleSigninInput!): AuthPayload!
    logout: GenericResponse!

    createProduct(input: ProductInput!): Product
    updateProduct(id: ID!, input: ProductUpdateInput!): Product
    deleteProduct(id: ID!): GenericResponse!

    addToCart(input: CartItemInput!): Cart
    updateCartItem(input: CartItemInput!): Cart
    removeFromCart(productId: ID!): Cart
    checkout: GenericResponse!

    sendOrderOtp(input: SendOrderOtpInput!): GenericResponse!
    verifyOrderOtp(input: VerifyOrderOtpInput!): GenericResponse!

    submitTicket(input: TicketInput!): GenericResponse!
    resolveTicket(input: ResolveTicketInput!): GenericResponse!
  }
`);

export const rootValue = {
  health: () => "ok",
  appName: () => "Gardenly",
  appVersion: () => "1.0.0",

  me: () => null,
  userById: () => null,

  products: ({ page = 1, limit = 12 }) => ({
    items: [],
    pageInfo: {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }),
  productById: () => null,

  cart: () => null,

  myOrders: ({ page = 1, limit = 10 }) => ({
    items: [],
    pageInfo: {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }),
  orderById: () => null,

  myTickets: ({ page = 1, limit = 10 }) => ({
    items: [],
    pageInfo: {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }),
  ticketById: () => null,

  adminStats: () => ({
    users: { total: 0, buyers: 0, sellers: 0, experts: 0, admins: 0 },
    orders: { total: 0, pending: 0, confirmed: 0, cancelled: 0, revenue: 0 },
    tickets: { total: 0, open: 0, resolved: 0 },
  }),

  signup: () => ({ success: true, message: "Signup placeholder" }),
  signin: () => ({ success: true, token: null, message: "Signin placeholder", user: null }),
  signinWithGoogle: () => ({ success: true, token: null, message: "Google signin placeholder", user: null }),
  logout: () => ({ success: true, message: "Logout placeholder" }),

  createProduct: () => null,
  updateProduct: () => null,
  deleteProduct: () => ({ success: true, message: "Delete placeholder" }),

  addToCart: () => null,
  updateCartItem: () => null,
  removeFromCart: () => null,
  checkout: () => ({ success: true, message: "Checkout placeholder" }),

  sendOrderOtp: () => ({ success: true, message: "OTP placeholder" }),
  verifyOrderOtp: () => ({ success: true, message: "Verify OTP placeholder" }),

  submitTicket: () => ({ success: true, message: "Submit ticket placeholder" }),
  resolveTicket: () => ({ success: true, message: "Resolve ticket placeholder" }),
};