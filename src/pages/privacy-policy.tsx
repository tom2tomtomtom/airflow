import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - AIrWAVE</title>
        <meta name="description" content="AIrWAVE Privacy Policy - Learn how we collect, use, and protect your data" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Effective Date:</strong> January 20, 2024<br />
                <strong>Last Updated:</strong> January 20, 2024
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p>
                  AIrWAVE ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital advertising creation platform.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials (username and password)</li>
                  <li>Company/organization information</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Communications you send to us</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Usage Information</h3>
                <p>We automatically collect information about your use of our platform:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Log data (IP address, browser type, operating system)</li>
                  <li>Device information</li>
                  <li>Usage patterns and preferences</li>
                  <li>Campaign and asset creation data</li>
                  <li>Performance metrics</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Client Data</h3>
                <p>When you upload content for campaigns:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Brand assets (images, videos, logos)</li>
                  <li>Campaign briefs and strategies</li>
                  <li>Copy and creative content</li>
                  <li>Client contact information (for approvals)</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p>We use the collected information to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze usage patterns</li>
                  <li>Detect, prevent, and address technical issues</li>
                  <li>Develop new features and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
                <p>We do not sell, trade, or rent your personal information. We may share information:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>With your consent:</strong> When you explicitly authorize us</li>
                  <li><strong>Service providers:</strong> With trusted third parties who assist in operating our platform</li>
                  <li><strong>Legal requirements:</strong> When required by law or to protect rights and safety</li>
                  <li><strong>Business transfers:</strong> In connection with mergers or acquisitions</li>
                  <li><strong>Aggregated data:</strong> Non-identifiable data for analytics and improvements</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your information:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Encryption in transit and at rest</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Secure data centers</li>
                  <li>Employee training on data protection</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                <p>
                  We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Retention periods vary based on:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Type of data</li>
                  <li>Legal requirements</li>
                  <li>Business needs</li>
                  <li>User preferences</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your data</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                  <li><strong>Restriction:</strong> Request limited processing of your data</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at{' '}
                  <a href="mailto:privacy@airwave.com" className="text-indigo-600 hover:text-indigo-500">
                    privacy@airwave.com
                  </a>
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Standard contractual clauses</li>
                  <li>Data processing agreements</li>
                  <li>Compliance with applicable data protection laws</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
                <p>
                  Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware of such collection, we will promptly delete the information.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Services</h2>
                <p>
                  Our platform integrates with third-party services including:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Creatomate (video rendering)</li>
                  <li>OpenAI (AI-powered features)</li>
                  <li>AWS (cloud infrastructure)</li>
                  <li>Analytics providers</li>
                  <li>Payment processors</li>
                </ul>
                <p>
                  These services have their own privacy policies, and we encourage you to review them.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Maintain your session</li>
                  <li>Remember your preferences</li>
                  <li>Analyze platform usage</li>
                  <li>Improve user experience</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. Note that disabling cookies may limit functionality.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy periodically. We will notify you of material changes by:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Posting the new policy on this page</li>
                  <li>Updating the "Last Updated" date</li>
                  <li>Sending email notifications for significant changes</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="mb-2">
                    <strong>AIrWAVE Privacy Team</strong>
                  </p>
                  <p className="mb-2">
                    Email:{' '}
                    <a href="mailto:privacy@airwave.com" className="text-indigo-600 hover:text-indigo-500">
                      privacy@airwave.com
                    </a>
                  </p>
                  <p className="mb-2">
                    Address: [Your Company Address]
                  </p>
                  <p>
                    Data Protection Officer:{' '}
                    <a href="mailto:dpo@airwave.com" className="text-indigo-600 hover:text-indigo-500">
                      dpo@airwave.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link href="/terms-of-service" className="text-indigo-600 hover:text-indigo-500">
                View Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
