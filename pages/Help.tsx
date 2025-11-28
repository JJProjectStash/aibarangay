
import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '../components/UI';
import { api } from '../services/api';
import { FAQ, SiteSettings } from '../types';

const Help = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        const [faqsData, settingsData] = await Promise.all([
            api.getFAQs(),
            api.getPublicSiteSettings()
        ]);
        setFaqs(faqsData);
        setSettings(settingsData);
        setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-500">Frequently asked questions and support contacts</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
          <Card className="col-span-2">
              <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {loading ? (
                      [1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)
                  ) : faqs.length === 0 ? (
                      <p className="text-gray-500 italic">No FAQs available yet.</p>
                  ) : (
                      faqs.map(faq => (
                        <FAQItem 
                            key={faq.id}
                            question={faq.question} 
                            answer={faq.answer} 
                        />
                      ))
                  )}
              </CardContent>
          </Card>

          <div className="space-y-6">
              <Card className="bg-primary-50 border-primary-100">
                  <CardContent className="p-6">
                      <h3 className="font-bold text-primary-900 mb-4">Contact Us</h3>
                      <div className="space-y-4">
                          <div className="flex items-start gap-3 text-sm text-gray-700">
                              <Phone className="w-4 h-4 text-primary-600 mt-1" />
                              <div>
                                  <p className="font-medium">Emergency Hotline</p>
                                  <p>{settings?.contactPhone || '(02) 8123-4567'}</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-3 text-sm text-gray-700">
                              <Mail className="w-4 h-4 text-primary-600 mt-1" />
                              <div>
                                  <p className="font-medium">Email Support</p>
                                  <p>{settings?.contactEmail || 'help@ibarangay.com'}</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-3 text-sm text-gray-700">
                              <MapPin className="w-4 h-4 text-primary-600 mt-1" />
                              <div>
                                  <p className="font-medium">Barangay Hall</p>
                                  <p>{settings?.address || '123 Rizal St, Quezon City'}</p>
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
    <details className="group border-b border-gray-100 pb-4 last:border-0 last:pb-0">
        <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900 hover:text-primary-600">
            {question}
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed pl-1">{answer}</p>
    </details>
);

export default Help;
