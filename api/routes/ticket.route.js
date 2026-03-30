// api/routes/ticket.route.js
import express from "express";
import {
  submitTicket,
  getUserTickets,
  getExpertTickets,
  getTicket,
  resolveTicket,
} from "../controllers/ticket.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import multer from "multer";

const router = express.Router();

// Multer setup for attachment (image/PDF up to 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Support ticket system (issue reporting & resolution)
 */

/**
 * @swagger
 * /api/tickets/submit:
 *   post:
 *     summary: Submit a new support ticket (with optional attachment)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Plant arrived damaged
 *               description:
 *                 type: string
 *                 example: The leaves are yellowing and falling off...
 *               orderId:
 *                 type: string
 *                 example: 671234abcd5678ef90123456
 *               attachment:
 *                 type: string
 *                 format: binary
 *                 description: Optional image or PDF proof (max 5MB)
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ticket submitted successfully"
 *                 ticketId:
 *                   type: string
 *                   example: 672345efgh9012ijkl345678
 *       400:
 *         description: Missing required fields / invalid file type/size
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/submit",
  verifyToken,
  upload.single("attachment"),
  submitTicket
);

/**
 * @swagger
 * /api/tickets/user:
 *   get:
 *     summary: Get all tickets submitted by the current user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 */
router.get("/user", verifyToken, getUserTickets);

/**
 * @swagger
 * /api/tickets/expert:
 *   get:
 *     summary: Get all tickets assigned to the current expert (expert only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized / not an expert
 *       403:
 *         description: Forbidden - user is not an expert
 */
router.get("/expert", verifyToken, getExpertTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get details of a specific ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *         example: 672345efgh9012ijkl345678
 *     responses:
 *       200:
 *         description: Ticket details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this ticket
 *       404:
 *         description: Ticket not found
 */
router.get("/:id", verifyToken, getTicket);

/**
 * @swagger
 * /api/tickets/{id}/resolve:
 *   post:
 *     summary: Resolve a ticket (expert only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID to resolve
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: string
 *                 example: Issue resolved - replacement plant sent.
 *               notes:
 *                 type: string
 *                 example: Customer confirmed satisfaction.
 *     responses:
 *       200:
 *         description: Ticket resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Ticket resolved"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to resolve this ticket
 *       404:
 *         description: Ticket not found
 */
router.post("/:id/resolve", verifyToken, resolveTicket);

export default router;
