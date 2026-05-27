import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/user.model.js", () => {
  const User = jest.fn(function User(data) {
    Object.assign(this, data);
    this._doc = { ...data };
    this.save = jest.fn().mockResolvedValue(this);
  });

  User.findOne = jest.fn();
  User.create = jest.fn();
  User.findByIdAndUpdate = jest.fn();

  return { default: User };
});

jest.unstable_mockModule("../models/community.model.js", () => ({
  default: {
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compareSync: jest.fn(),
    hashSync: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

jest.unstable_mockModule("../utils/mailer.js", () => ({
  sendSignupVerificationMail: jest.fn(),
  sendOtpMail: jest.fn(),
  send2FAMail: jest.fn(),
}));

describe("Auth Controller Unit Tests", () => {
  let req;
  let res;
  let next;
  let authController;
  let User;
  let Community;
  let bcrypt;
  let jwt;
  let mailer;

  beforeAll(async () => {
    authController = await import("../controllers/auth.controller.js");
    User = (await import("../models/user.model.js")).default;
    Community = (await import("../models/community.model.js")).default;
    bcrypt = (await import("bcryptjs")).default;
    jwt = (await import("jsonwebtoken")).default;
    mailer = await import("../utils/mailer.js");
  });

  beforeEach(() => {
    req = { body: {} };
    res = {
      cookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = "test-secret";
    jest.clearAllMocks();
  });

  describe("signin", () => {
    it("returns 400 if fields are missing", async () => {
      req.body = { username: "test" };

      await authController.signin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: "Username, password, and role are required",
        statusCode: 400,
      }));
    });

    it("successfully signs in a valid user", async () => {
      req.body = { username: "testuser", password: "Password1!", role: "Buyer" };
      const mockUser = {
        _id: "123",
        username: "testuser",
        password: "hashedPassword",
        role: "Buyer",
        isEmailVerified: true,
        _doc: { _id: "123", username: "testuser", role: "Buyer" },
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue("mock-jwt-token");

      await authController.signin(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
      expect(bcrypt.compareSync).toHaveBeenCalledWith("Password1!", "hashedPassword");
      expect(res.cookie).toHaveBeenCalledWith("access_token", "mock-jwt-token", expect.objectContaining({
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }));
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: "mock-jwt-token",
        user: expect.objectContaining({ username: "testuser" }),
      });
    });

    it("returns 401 for invalid password", async () => {
      req.body = { username: "testuser", password: "WrongPassword!", role: "Buyer" };
      User.findOne.mockResolvedValue({ password: "hashed", role: "Buyer" });
      bcrypt.compareSync.mockReturnValue(false);

      await authController.signin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: "Invalid password",
        statusCode: 401,
      }));
    });

    it("rejects a valid password when the selected role does not match", async () => {
      req.body = { username: "seller1", password: "Password1!", role: "Buyer" };
      User.findOne.mockResolvedValue({ password: "hashed", role: "Seller" });
      bcrypt.compareSync.mockReturnValue(true);

      await authController.signin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 403,
        message: "Role mismatch. Please select correct role.",
      }));
    });
  });

  describe("signup", () => {
    it("blocks invalid email format", async () => {
      req.body = {
        username: "valid",
        email: "invalid",
        password: "Password1!",
        role: "Buyer",
        mobile: "1234567890",
      };

      await authController.signup(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it("blocks weak passwords before querying the database", async () => {
      req.body = {
        username: "valid",
        email: "valid@example.com",
        password: "weak",
        role: "Buyer",
        mobile: "1234567890",
      };

      await authController.signup(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: "Password must be 8+ chars with uppercase, number, special char",
      }));
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it("blocks duplicate username, email, or mobile", async () => {
      req.body = {
        username: "valid",
        email: "valid@example.com",
        password: "Password1!",
        role: "Buyer",
        mobile: "1234567890",
      };
      User.findOne.mockResolvedValue({ _id: "existing-user" });

      await authController.signup(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { username: "valid" },
          { email: "valid@example.com" },
          { mobile: "1234567890" },
        ],
      });
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "User with this username/email/mobile already exists",
      }));
    });

    it("requires expertise when signing up as an expert", async () => {
      req.body = {
        username: "expert1",
        email: "expert@example.com",
        password: "Password1!",
        role: "Expert",
        mobile: "1234567890",
      };

      await authController.signup(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Expertise required for Expert role",
      }));
    });

    it("creates a buyer account and sends an email verification OTP", async () => {
      req.body = {
        username: "buyer1",
        email: "buyer@example.com",
        password: "Password1!",
        role: "Buyer",
        mobile: "1234567890",
      };
      User.findOne.mockResolvedValue(null);
      Community.findOne.mockResolvedValue(null);
      bcrypt.hashSync.mockReturnValue("hashed-password");

      await authController.signup(req, res, next);

      expect(User).toHaveBeenCalledWith(expect.objectContaining({
        username: "buyer1",
        email: "buyer@example.com",
        password: "hashed-password",
        role: "Buyer",
        mobile: "1234567890",
        isEmailVerified: false,
        emailVerificationOtp: expect.any(String),
        emailVerificationOtpExpiresAt: expect.any(Date),
      }));
      expect(User.mock.instances[0].save).toHaveBeenCalled();
      expect(mailer.sendSignupVerificationMail).toHaveBeenCalledWith(
        "buyer@example.com",
        expect.stringMatching(/^\d{6}$/)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        requireVerification: true,
        email: "buyer@example.com",
      }));
    });
  });

  describe("verifyEmail", () => {
    it("returns 404 if user is not found", async () => {
      req.body = { email: "nonexistent@test.com", otp: "123456" };
      User.findOne.mockResolvedValue(null);

      await authController.verifyEmail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it("rejects an invalid verification OTP", async () => {
      req.body = { email: "buyer@example.com", otp: "111111" };
      User.findOne.mockResolvedValue({
        isEmailVerified: false,
        emailVerificationOtp: "222222",
        emailVerificationOtpExpiresAt: new Date(Date.now() + 60_000),
      });

      await authController.verifyEmail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Invalid OTP",
      }));
    });

    it("marks a user as verified for a valid OTP", async () => {
      req.body = { email: "buyer@example.com", otp: "123456" };
      const user = {
        isEmailVerified: false,
        emailVerificationOtp: "123456",
        emailVerificationOtpExpiresAt: new Date(Date.now() + 60_000),
        save: jest.fn().mockResolvedValue(undefined),
      };
      User.findOne.mockResolvedValue(user);

      await authController.verifyEmail(req, res, next);

      expect(user.isEmailVerified).toBe(true);
      expect(user.emailVerificationOtp).toBeUndefined();
      expect(user.emailVerificationOtpExpiresAt).toBeUndefined();
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("forgotPassword and resetPassword", () => {
    it("returns 404 for an unknown forgot-password email", async () => {
      req.body = { email: "unknown@test.com" };
      User.findOne.mockResolvedValue(null);

      await authController.forgotPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it("sets reset OTP fields and sends the reset email", async () => {
      req.body = { email: "buyer@example.com" };
      const user = { save: jest.fn().mockResolvedValue(undefined) };
      User.findOne.mockResolvedValue(user);

      await authController.forgotPassword(req, res, next);

      expect(user.resetOtp).toMatch(/^\d{6}$/);
      expect(user.resetOtpExpiresAt).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalled();
      expect(mailer.sendOtpMail).toHaveBeenCalledWith("buyer@example.com", user.resetOtp);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("rejects an invalid reset OTP", async () => {
      req.body = { email: "buyer@example.com", otp: "000000", newPassword: "Newpass1!" };
      User.findOne.mockResolvedValue({
        resetOtp: "123456",
        resetOtpExpiresAt: new Date(Date.now() + 60_000),
      });

      await authController.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Invalid OTP",
      }));
    });

    it("updates the password hash and clears reset OTP fields", async () => {
      req.body = { email: "buyer@example.com", otp: "123456", newPassword: "Newpass1!" };
      const user = {
        resetOtp: "123456",
        resetOtpExpiresAt: new Date(Date.now() + 60_000),
        save: jest.fn().mockResolvedValue(undefined),
      };
      User.findOne.mockResolvedValue(user);
      bcrypt.hashSync.mockReturnValue("new-hash");

      await authController.resetPassword(req, res, next);

      expect(user.password).toBe("new-hash");
      expect(user.resetOtp).toBeUndefined();
      expect(user.resetOtpExpiresAt).toBeUndefined();
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
