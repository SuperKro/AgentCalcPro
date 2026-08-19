import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using AgentCalc Pro, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Description of Service</h2>
            <p className="text-gray-600">
              AgentCalc Pro is a web-based calculator suite designed for real estate professionals. 
              Our service provides various financial calculators including loan calculators, mortgage 
              calculators, commission calculators, and more.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must not share your account credentials with others</li>
              <li>You must notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Free and Paid Services</h2>
            <p className="text-gray-600 mb-3">We offer the following tiers:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Free Tier:</strong> 5 calculations total, access to basic calculators</li>
              <li><strong>Monthly Pro:</strong> ₱50/month for unlimited calculations</li>
              <li><strong>Lifetime Access:</strong> ₱200 one-time payment for unlimited access forever</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Payment Terms</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All payments are processed securely through our payment providers</li>
              <li>Monthly subscriptions renew automatically unless cancelled</li>
              <li>Lifetime access is a one-time payment with no recurring charges</li>
              <li>Refunds may be requested within 7 days of purchase if unused</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Disclaimer</h2>
            <p className="text-gray-600">
              <strong>IMPORTANT:</strong> The calculations provided by AgentCalc Pro are for informational 
              and educational purposes only. They should not be considered as financial, legal, or tax advice. 
              Always consult with qualified professionals before making financial decisions.
            </p>
            <p className="text-gray-600 mt-3">
              Tax rates, fees, and regulations vary by location and change over time. Our calculators use 
              general estimates based on Philippine standards but may not reflect exact amounts for your 
              specific situation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Limitation of Liability</h2>
            <p className="text-gray-600">
              AgentCalc Pro shall not be liable for any direct, indirect, incidental, or consequential 
              damages arising from your use of our service or reliance on any calculations provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Intellectual Property</h2>
            <p className="text-gray-600">
              All content, features, and functionality of AgentCalc Pro are owned by us and are protected 
              by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Prohibited Uses</h2>
            <p className="text-gray-600 mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Copy, modify, or distribute our content without permission</li>
              <li>Use automated systems to access the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Termination</h2>
            <p className="text-gray-600">
              We reserve the right to terminate or suspend your account at any time for violations of 
              these terms or for any other reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">11. Changes to Terms</h2>
            <p className="text-gray-600">
              We may modify these terms at any time. Continued use of the service after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">12. Governing Law</h2>
            <p className="text-gray-600">
              These terms shall be governed by and construed in accordance with the laws of the Philippines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">13. Contact Information</h2>
            <p className="text-gray-600">
              For questions about these Terms of Service, contact us at:
              <br />
              <strong>Email:</strong> support@agentcalc.pro
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
