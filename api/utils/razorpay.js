import Razorpay from "razorpay";

let razorpayClient;

export const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay is not configured.");
    error.statusCode = 500;
    throw error;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
};

export default {
  get orders() {
    return getRazorpayClient().orders;
  },
};
