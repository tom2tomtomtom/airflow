import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - AIrWAVE</title>
        <meta name="description" content="AIrWAVE Terms of Service - Legal terms and conditions for using our platform" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Effective Date:</strong> January 20, 2024<br />
                <strong>Last Updated:</strong> January 20, 2024
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
                <p>
                  By accessing or using AIrWAVE ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p>
                  AIrWAVE is a digital advertising creation platform that provides:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>AI-powered strategy and copy generation</li>
                  <li>Campaign matrix creation and management</li>
                  <li>Automated video rendering</li>
                  <li>Asset management and organization</li>
                  <li>Client approval workflows</li>
                  <li>Multi-platform export capabilities</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
                <p>
                  To use certain features, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all account activities</li>
                  <li>Notify us immediately of unauthorized access</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Termination</h3>
                <p>
                  We reserve the right to suspend or terminate accounts that:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Violate these Terms</li>
                  <li>Provide false information</li>
                  <li>Engage in illegal activities</li>
                  <li>Abuse the Service or other users</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
                <p>
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Upload malicious code or viruses</li>
                  <li>Attempt to gain unauthorized access</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Use automated systems to access the Service</li>
                  <li>Harvest or collect user information</li>
                  <li>Create content that is harmful, offensive, or misleading</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Your Content</h3>
                <p>
                  You retain ownership of content you upload ("User Content"). By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Store, process, and display your content</li>
                  <li>Create derivative works as necessary for the Service</li>
                  <li>Provide the Service to you and your authorized users</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Our Content</h3>
                <p>
                  The Service and its original content (excluding User Content) remain our property and are protected by copyright, trademark, and other laws.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Feedback</h3>
                <p>
                  Any feedback, suggestions, or ideas you provide become our property and may be used without compensation or attribution.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Subscription Plans</h3>
                <p>
                  Paid features are available through subscription plans. By subscribing, you agree to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Pay all applicable fees</li>
                  <li>Provide valid payment information</li>
                  <li>Authorize recurring charges</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Billing</h3>
                <p>
                  Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable unless otherwise stated.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Changes to Pricing</h3>
                <p>
                  We may modify pricing with 30 days' notice. Continued use after price changes constitutes acceptance.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
                <p>
                  Your use of the Service is also governed by our{' '}
                  <Link href="/privacy-policy" className="text-indigo-600 hover:text-indigo-500">
                    Privacy Policy
                  </Link>
                  . By using the Service, you consent to our data practices as described in the Privacy Policy.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
                <p>
                  The Service integrates with third-party services. We are not responsible for:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Third-party service availability or functionality</li>
                  <li>Content provided by third parties</li>
                  <li>Third-party terms and policies</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Service Availability</h3>
                <p className="uppercase font-semibold">
                  The Service is provided "as is" and "as available" without warranties of any kind.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Limitation of Liability</h3>
                <p className="uppercase font-semibold">
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">9.3 Maximum Liability</h3>
                <p>
                  Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
                <p>
                  You agree to indemnify and hold us harmless from claims arising from:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Your User Content</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law and Disputes</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 Governing Law</h3>
                <p>
                  These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">11.2 Dispute Resolution</h3>
                <p>
                  Any disputes shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization].
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. Changes will be effective upon posting. Continued use of the Service constitutes acceptance of modified Terms.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. General Provisions</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">13.1 Entire Agreement</h3>
                <p>
                  These Terms constitute the entire agreement between you and AIrWAVE regarding the Service.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">13.2 Severability</h3>
                <p>
                  If any provision is found unenforceable, the remaining provisions shall continue in effect.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">13.3 Waiver</h3>
                <p>
                  Failure to enforce any right or provision shall not constitute a waiver.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">13.4 Assignment</h3>
                <p>
                  You may not assign these Terms without our consent. We may assign our rights and obligations without restriction.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
                <p>
                  For questions about these Terms, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="mb-2">
                    <strong>AIrWAVE Legal Team</strong>
                  </p>
                  <p className="mb-2">
                    Email:{' '}
                    <a href="mailto:legal@airwave.com" className="text-indigo-600 hover:text-indigo-500">
                      legal@airwave.com
                    </a>
                  </p>
                  <p>
                    Address: [Your Company Address]
                  </p>
                </div>
              </section>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link href="/privacy-policy" className="text-indigo-600 hover:text-indigo-500">
                View Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
