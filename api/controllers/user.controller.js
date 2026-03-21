// ... existing getProfile, updateProfile ...

import bcrypt from "bcryptjs"; // if not already imported

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(errorHandler(400, "Current and new password are required"));
    }

    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found"));

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return next(errorHandler(400, "Current password is incorrect"));

    // Optional: add password strength check here

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found"));

    const newAddress = { ...req.body };
    user.addresses.push(newAddress);

    // Optional: set as default if it's the first or marked default
    if (newAddress.isDefault || user.addresses.length === 1) {
      user.addresses.forEach(addr => addr.isDefault = false);
      newAddress.isDefault = true;
    }

    await user.save();
    res.status(201).json({ success: true, address: newAddress });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found"));

    const address = user.addresses.id(req.params.addressId);
    if (!address) return next(errorHandler(404, "Address not found"));

    Object.assign(address, req.body);

    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
      address.isDefault = true;
    }

    await user.save();
    res.status(200).json({ success: true, address });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found"));

    const address = user.addresses.id(req.params.addressId);
    if (!address) return next(errorHandler(404, "Address not found"));

    user.addresses.pull(req.params.addressId);
    await user.save();

    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return next(errorHandler(404, "User not found"));

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found"));

    const { name, phone, avatar } = req.body;

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar?.trim() || null;

    await user.save();

    const updated = await User.findById(req.user.id).select(
      "-password -resetOtp -resetOtpExpiresAt -__v"
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    next(err);
  }
};