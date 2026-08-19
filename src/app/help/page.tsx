import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Help & FAQ</h1>
        <p className="text-gray-500 mb-8">Everything you need to know about AgentCalc Pro</p>

        <div className="space-y-6">
          {/* Getting Started */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🚀 Getting Started
            </h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800">How do I create an account?</h3>
                <p className="mt-1">Click &quot;Sign Up Free&quot; on the top right, enter your email, name, and create a password. You&apos;ll get 5 free calculations instantly!</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">What calculators are included?</h3>
                <p className="mt-1">We have 12 professional calculators: Loan Calculator, Mortgage Calculator, Commission Calculator, Amortization Schedule, ROI Calculator, Rental Yield, Affordability Calculator, Transfer Tax, Cap Rate, Closing Costs, Home Equity, and Loan Comparison.</p>
              </div>
            </div>
          </section>

          {/* Free vs Paid */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              💳 Free vs Paid Plans
            </h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800">What&apos;s included in the free plan?</h3>
                <p className="mt-1">Free accounts get 5 total calculations and access to 3 basic calculators (Loan, Mortgage, Commission). Your calculation history is saved.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">What&apos;s the difference between Monthly and Lifetime?</h3>
                <p className="mt-1">Both give you unlimited calculations and all 12 calculators. Monthly (₱50/month) renews every 30 days. Lifetime (₱200 one-time) gives you access forever with no recurring payments.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Can I upgrade anytime?</h3>
                <p className="mt-1">Yes! Go to the Pricing page and select your preferred plan. Your account will be upgraded once payment is confirmed.</p>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              💰 Payments
            </h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800">What payment methods do you accept?</h3>
                <p className="mt-1">We accept GCash, PayMaya/Maya, and Bank Transfer.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">How do I pay?</h3>
                <ol className="mt-1 list-decimal list-inside space-y-1">
                  <li>Select your plan and click Subscribe/Get Lifetime</li>
                  <li>Choose your payment method (GCash, PayMaya, or Bank)</li>
                  <li>Send the payment to the displayed account</li>
                  <li>Enter your payment reference/transaction number</li>
                  <li>Click &quot;Submit for Verification&quot;</li>
                  <li>Wait for confirmation (usually within 24 hours)</li>
                </ol>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">How long until my account is upgraded?</h3>
                <p className="mt-1">Once you submit your payment, it will be verified within 24 hours. You&apos;ll have immediate access to all features once confirmed.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">What if my payment is rejected?</h3>
                <p className="mt-1">If your payment cannot be verified, you&apos;ll see the reason. Please make sure to send the correct amount and use a valid reference number. Contact support if you believe there&apos;s an error.</p>
              </div>
            </div>
          </section>

          {/* Calculators */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🧮 Using Calculators
            </h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800">Are the calculations accurate?</h3>
                <p className="mt-1">Our calculators use standard financial formulas. However, actual rates, taxes, and fees may vary. Always consult with a financial professional for important decisions.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Can I see my past calculations?</h3>
                <p className="mt-1">Yes! Click &quot;History&quot; in the menu to see all your previous calculations.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">What tax rates are used?</h3>
                <p className="mt-1">Our Transfer Tax Calculator uses Philippine tax rates (6% Capital Gains Tax, 1.5% Documentary Stamp Tax, etc.). Local rates may vary.</p>
              </div>
            </div>
          </section>

          {/* Account & Security */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🔒 Account & Security
            </h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800">How is my data protected?</h3>
                <p className="mt-1">Your password is encrypted and we use secure connections. We never share your data with third parties.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">What if I forget my password?</h3>
                <p className="mt-1">Contact support to reset your password. We&apos;ll verify your identity and help you regain access.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Why is my account locked?</h3>
                <p className="mt-1">For security, accounts are temporarily locked after 5 failed login attempts. Wait 30 minutes and try again, or contact support.</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
              📞 Need More Help?
            </h2>
            <p className="text-blue-700 mb-4">
              Can&apos;t find what you&apos;re looking for? Contact our support team:
            </p>
            <div className="space-y-2 text-blue-700">
              <p>📧 Email: <a href="mailto:support@agentcalc.pro" className="underline">support@agentcalc.pro</a></p>
              <p>💬 Response time: Usually within 24 hours</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
