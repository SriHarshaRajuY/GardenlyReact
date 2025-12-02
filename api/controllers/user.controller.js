// server/controllers/user.controller.js
export const test=(req, res) => {
    res.json({
        message: "User route is working!"
    })
}

export const getAgents = async (req, res, next) => {
    try {
        // match role case-insensitively
        const agents = await (await import("../models/user.model.js")).default.find({ role: { $regex: /^agent$/i } }, { password: 0 });
        res.status(200).json({ success: true, agents });
    } catch (err) {
        next(err);
    }
};