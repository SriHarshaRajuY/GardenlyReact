// api/routes/user.route.js
import express from "express";
import { 
  getProfile, 
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile, account settings, addresses, password & avatar management
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current user's profile, stats and order history
 *     description: Returns user details, order summary stats, and list of orders
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/me", verifyToken, getProfile);

/**
 * @swagger
 * /api/user/me:
 *   put:
 *     summary: Update basic profile fields (name, phone, avatar URL)
 *     description: Now only updates name/phone/avatar URL. Use dedicated endpoints for addresses & file upload.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:   { type: string, example: "Bheemarati" }
 *               phone:  { type: string, example: "9876543210" }
 *               avatar: { type: string, nullable: true, example: "https://cdn..." }
 *     responses:
 *       200: { description: Profile updated, content: { application/json: { schema: { type: object, properties: { success: boolean, user: {$ref: '#/components/schemas/User'} } } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.put("/me", verifyToken, updateProfile);

/**
 * @swagger
 * /api/user/change-password:
 *   post:
 *     summary: Change current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, example: "oldPass123" }
 *               newPassword:     { type: string, example: "newSecure456" }
 *     responses:
 *       200: { description: Password changed successfully, content: { application/json: { schema: { type: object, properties: { success: {type:boolean}, message: {type:string} } } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post("/change-password", verifyToken, changePassword);

/**
 * @swagger
 * /api/user/addresses:
 *   post:
 *     summary: Add a new address for the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, address1, city, state, pincode]
 *             properties:
 *               fullName:  { type: string }
 *               address1:  { type: string }
 *               address2:  { type: string, nullable: true }
 *               city:      { type: string }
 *               state:     { type: string }
 *               pincode:   { type: string }
 *               isDefault: { type: boolean, default: false }
 *     responses:
 *       201: { description: Address added, content: { application/json: { schema: { type: object, properties: { success: boolean, address: {type:object} } } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 */
router.post("/addresses", verifyToken, addAddress);

/**
 * @swagger
 * /api/user/addresses/{addressId}:
 *   put:
 *     summary: Update an existing address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:  { type: string }
 *               address1:  { type: string }
 *               address2:  { type: string, nullable: true }
 *               city:      { type: string }
 *               state:     { type: string }
 *               pincode:   { type: string }
 *               isDefault: { type: boolean }
 *     responses:
 *       200: { description: Address updated }
 */
router.put("/addresses/:addressId", verifyToken, updateAddress);

/**
 * @swagger
 * /api/user/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Address deleted }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete("/addresses/:addressId", verifyToken, deleteAddress);

export default router;