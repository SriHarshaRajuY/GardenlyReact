export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8faf7] dark:bg-gray-900 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 md:p-12">
        <h1 className="text-3xl font-black text-green-800 dark:text-green-400 mb-6">Privacy Policy</h1>
        <div className="space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            Gardenly collects account, contact, order, payment-status, community, and support-ticket information needed to operate the marketplace.
          </p>
          <p>
            Payment card data is handled by Razorpay checkout. Gardenly stores only payment identifiers and order status returned after server-side signature verification.
          </p>
          <p>
            Uploaded product, blog, community, and support images are stored through the configured upload provider. Do not upload sensitive documents unless requested by support.
          </p>
          <p>
            Cookies are used for authenticated sessions and CSRF protection. You can sign out at any time to clear the session cookie from your browser.
          </p>
          <p>
            For privacy or account deletion requests, contact Gardenly support using the email listed in the footer.
          </p>
        </div>
      </div>
    </div>
  );
}
