// api/controllers/delivery.controller.js
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Get all delivery agents
export const getDeliveryAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: "DeliveryAgent" }).select("-password");
    res.status(200).json({ success: true, agents });
  } catch (err) {
    next(err);
  }
};

// Get unassigned orders (for manager)
export const getUnassignedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      deliveryStatus: "unassigned",
      status: "confirmed",
    })
      .populate("userId", "username email")
      .populate("items.product", "name price");

    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// Assign order to delivery agent
export const assignOrderToAgent = async (req, res, next) => {
  const { orderId } = req.params;
  const { agentId } = req.body;

  try {
    // Verify agentId exists and is valid
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== "DeliveryAgent") {
      return next(errorHandler(404, "Invalid delivery agent"));
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        deliveryAgentId: agentId,
        deliveryStatus: "assigned",
        assignedAt: new Date(),
      },
      { new: true }
    )
      .populate("deliveryAgentId", "username email mobile")
      .populate("userId", "username email");

    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }

    res.status(200).json({ success: true, message: "Order assigned successfully", order });
  } catch (err) {
    next(err);
  }
};

// Get orders assigned to current agent
export const getAgentDeliveries = async (req, res, next) => {
  const { id: agentId } = req.user; // from JWT token

  try {
    const orders = await Order.find({
      deliveryAgentId: agentId,
    })
      .populate("userId", "username email")
      .populate("items.product", "name price")
      .sort({ assignedAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { deliveryStatus } = req.body;
  const { id: agentId } = req.user;

  try {
    const validStatuses = ["unassigned", "assigned", "picked_up", "in_transit", "delivered", "failed"];
    if (!validStatuses.includes(deliveryStatus)) {
      return next(errorHandler(400, "Invalid delivery status"));
    }

    // Verify agent owns this order
    const order = await Order.findById(orderId);
    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }

    if (order.deliveryAgentId.toString() !== agentId) {
      return next(errorHandler(403, "You are not assigned to this order"));
    }

    // Update status
    const updateData = { deliveryStatus };
    if (deliveryStatus === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    })
      .populate("deliveryAgentId", "username email mobile")
      .populate("userId", "username email");

    res.status(200).json({ success: true, message: "Delivery status updated", order: updatedOrder });
  } catch (err) {
    next(err);
  }
};

// Get delivery statistics for agent
export const getAgentStats = async (req, res, next) => {
  const { id: agentId } = req.user;

  try {
    const total = await Order.countDocuments({ deliveryAgentId: agentId });
    const delivered = await Order.countDocuments({
      deliveryAgentId: agentId,
      deliveryStatus: "delivered",
    });
    const failed = await Order.countDocuments({
      deliveryAgentId: agentId,
      deliveryStatus: "failed",
    });
    const pending = total - delivered - failed;

    res.status(200).json({
      success: true,
      stats: { total, delivered, failed, pending },
    });
  } catch (err) {
    next(err);
  }
};
