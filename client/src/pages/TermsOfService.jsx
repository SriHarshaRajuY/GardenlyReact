export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#f8faf7] dark:bg-gray-900 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 md:p-12">
        <h1 className="text-3xl font-black text-green-800 dark:text-green-400 mb-6">Terms of Service</h1>
        <div className="space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            Gardenly is a marketplace for gardening products, custom buyer requests, community posts, blogs, and expert support. Users are responsible for accurate account, listing, and order information.
          </p>
          <p>
            Sellers must list only products they can fulfill and keep stock quantities accurate. Gardenly may remove listings or content that is fraudulent, unsafe, or unrelated to gardening.
          </p>
          <p>
            Orders are confirmed only after OTP verification for cash orders or successful Razorpay signature verification for online payments.
          </p>
          <p>
            Community and blog interactions must remain respectful and relevant. Admins may remove abusive posts, spam, or unsafe advice.
          </p>
          <p>
            Expert support provides gardening guidance and order help, but it is not a substitute for emergency, legal, medical, or professional safety advice.
          </p>
        </div>
      </div>
    </div>
  );
}
