
import React, { useEffect, useState } from 'react';
import { ArrowRight, Shield, Users, Activity, Calendar, Megaphone, MapPin, Clock, Newspaper, ChevronRight, Phone, X } from 'lucide-react';
import { Button, Card, CardContent, Badge, Modal } from '../components/UI';
import { SharedCalendar } from '../components/SharedCalendar';
import { api } from '../services/api';
import { Announcement, Event, NewsItem, Official } from '../types';

interface LandingProps {
    onLogin: () => void;
    onSignup: () => void;
    onNavigate?: (page: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin, onSignup, onNavigate }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
    const [loading, setLoading] = useState(true);
    const [requiresSignIn, setRequiresSignIn] = useState(false);

  // Modals for Footer/News
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
      const fetchData = async () => {
          const results = await Promise.allSettled([
                  api.getPublicEvents(),
                  api.getPublicAnnouncements(),
                  api.getPublicNews(),
                  api.getPublicOfficials()
          ]);

          // Results order matches the original Promise.all
          const [eventsRes, announcementsRes, newsRes, officialsRes] = results;

          setEvents(eventsRes.status === 'fulfilled' ? eventsRes.value as Event[] : []);
          setAnnouncements(announcementsRes.status === 'fulfilled' ? (announcementsRes.value as Announcement[]).filter(a => a.isPublished).slice(0,3) : []);
          setNews(newsRes.status === 'fulfilled' ? (newsRes.value as NewsItem[]).slice(0,3) : []);
          setOfficials(officialsRes.status === 'fulfilled' ? officialsRes.value as Official[] : []);

                    const rejected = results.filter((r) => r.status === 'rejected');
                    if (rejected.length) {
                        console.warn('Some landing fetches failed:', rejected);
                        rejected.forEach((r) => {
                            const reason = (r as PromiseRejectedResult).reason;
                            if (reason?.status === 401) {
                                setRequiresSignIn(true);
                                console.info('A landing endpoint is returning 401: it may require authentication.');
                            }
                        });
                    }

          setLoading(false);
      };
      fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-40 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">i</div>
                  <span className="text-xl font-bold text-gray-900 tracking-tight">iBarangay</span>
              </div>
              <div className="flex gap-3">
                  <Button variant="ghost" onClick={onLogin} className="text-gray-600 font-medium hover:text-primary-600 hover:bg-primary-50">Sign In</Button>
                  <Button onClick={onSignup} className="font-medium shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all">Get Started</Button>
              </div>
          </div>
      </nav>

      {/* Hero */}
            <div className="relative overflow-hidden bg-primary-900 pt-20 pb-32 text-white">
                {requiresSignIn && (
                    <div className="absolute top-4 right-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-3 rounded shadow z-50">
                        <div className="text-sm font-medium">Some content on this page requires authentication.</div>
                        <div className="text-xs text-yellow-600">Sign in to view protected content or make the endpoint public on the backend for non-authenticated users.</div>
                    </div>
                )}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary-900 to-teal-900" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
              <Badge variant="primary" className="bg-white/10 text-primary-50 border border-white/10 mb-6 backdrop-blur-sm px-4 py-1.5 text-sm uppercase tracking-wide font-semibold shadow-sm">
                  Official Barangay Portal
              </Badge>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-white mb-6 leading-tight drop-shadow-sm">
                  Digital Services for a<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-teal-200">Better Community</span>
              </h1>
              <p className="mt-4 max-w-2xl text-xl text-primary-100 leading-relaxed font-light">
                  Stay connected. Access services, file complaints, and get the latest updates anytime, anywhere with the new iBarangay system.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button size="lg" onClick={onSignup} className="h-14 px-8 text-lg bg-white text-primary-900 hover:bg-primary-50 shadow-xl shadow-primary-900/20 font-bold">
                      Register Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" onClick={onLogin}>
                      Member Login
                  </Button>
              </div>
          </div>
      </div>

      {/* Quick Stats/Features overlapping Hero */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-20 z-10">
          <div className="grid md:grid-cols-3 gap-6">
              {[
                  { icon: <Shield className="w-8 h-8" />, title: "Secure & Verified", text: "Only verified residents can access sensitive services.", color: "blue" },
                  { icon: <Activity className="w-8 h-8" />, title: "Real-time Updates", text: "Track complaints and requests with instant notifications.", color: "teal" },
                  { icon: <Users className="w-8 h-8" />, title: "Community First", text: "Bridging the gap between officials and residents.", color: "purple" }
              ].map((feat, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-start gap-4 transform hover:-translate-y-1 transition-all duration-300">
                    <div className={`p-3 rounded-xl text-${feat.color}-600 bg-${feat.color}-50`}>
                        {feat.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{feat.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{feat.text}</p>
                    </div>
                </div>
              ))}
          </div>
      </div>

      {/* Latest News Section */}
      <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12">
                  <div>
                      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                          <Newspaper className="w-8 h-8 text-primary-600" />
                          Community News
                      </h2>
                      <p className="text-gray-500 mt-2 text-lg">What's happening in our barangay</p>
                  </div>
                  <Button variant="ghost" className="text-primary-600 hover:text-primary-700 font-semibold" onClick={() => onNavigate && onNavigate('news')}>View All News →</Button>
              </div>

              {loading ? (
                  <div className="text-center py-12">Loading news...</div>
              ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {news.map(item => (
                          <div key={item.id} className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden" onClick={() => setSelectedNews(item)}>
                              <div className="aspect-video relative overflow-hidden">
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                                  <span className="absolute bottom-4 left-4 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                                      {new Date(item.publishedAt).toLocaleDateString()}
                                  </span>
                              </div>
                              <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-3 line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-4 flex-1">
                                    {item.summary}
                                </p>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                                    <span className="text-xs text-gray-400 font-medium">By {item.author}</span>
                                    <button className="text-primary-600 font-bold text-sm flex items-center hover:underline">
                                        Read Story <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* Community Calendar Section */}
      <div className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                      <Calendar className="w-8 h-8 text-primary-600" />
                      Community Calendar
                  </h2>
                  <p className="text-gray-500 mt-3 text-lg">Schedule of events and activities</p>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 shadow-lg rounded-xl overflow-hidden border border-gray-200">
                      <SharedCalendar events={events} readOnly />
                  </div>
                  <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <Activity className="w-5 h-5 text-primary-500" /> Upcoming Highlights
                      </h3>
                      {events.slice(0, 3).map(event => (
                           <Card key={event.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
                                <CardContent className="p-4 flex gap-4 items-start">
                                    <div className="bg-primary-50 text-primary-700 rounded-lg p-3 text-center min-w-[60px] border border-primary-100">
                                        <div className="text-xs font-bold uppercase">{new Date(event.eventDate).toLocaleString('default', { month: 'short' })}</div>
                                        <div className="text-xl font-bold">{new Date(event.eventDate).getDate()}</div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 line-clamp-1 text-base">{event.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Clock className="w-3 h-3" /> {new Date(event.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <MapPin className="w-3 h-3" /> {event.location}
                                        </div>
                                        <Button size="sm" variant="outline" className="mt-3 h-7 text-xs" onClick={onLogin}>View Details</Button>
                                    </div>
                                </CardContent>
                           </Card>
                      ))}
                  </div>
              </div>
          </div>
      </div>

       {/* Officials Section */}
       <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                      <Users className="w-8 h-8 text-primary-600" />
                      Meet Your Officials
                  </h2>
                  <p className="text-gray-500 mt-3 text-lg">Dedicated leaders serving our community</p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                  {officials.map(official => (
                      <div key={official.id} className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                          <div className="w-24 h-24 rounded-full mx-auto p-1 border-2 border-primary-100 bg-white mb-4">
                            <img src={official.imageUrl} alt={official.name} className="w-full h-full rounded-full object-cover bg-gray-100" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg">{official.name}</h3>
                          <p className="text-primary-600 text-sm font-medium uppercase tracking-wide mt-1">{official.position}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Announcements Section */}
      <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row gap-12">
                  <div className="md:w-1/3">
                      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                          <Megaphone className="w-8 h-8 text-primary-600" />
                          Announcements
                      </h2>
                      <p className="text-gray-500 text-lg leading-relaxed mb-6">
                          Important updates from the Barangay Hall. Please check regularly for schedule changes, policies, and emergency alerts.
                      </p>
                      <Button variant="outline" className="w-full sm:w-auto hover:bg-white hover:text-primary-600" onClick={() => window.scrollTo(0,0)}>
                          Subscribe to Alerts
                      </Button>
                  </div>

                  <div className="md:w-2/3 space-y-4">
                      {announcements.map(announcement => (
                          <div key={announcement.id} className="bg-white border-l-4 border-primary-500 pl-6 py-4 pr-4 relative shadow-sm rounded-r-lg hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                  <Badge variant={announcement.priority === 'high' ? 'danger' : 'default'} className="uppercase text-[10px] tracking-wider font-bold">
                                      {announcement.category}
                                  </Badge>
                                  <span className="text-xs text-gray-400 font-medium">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{announcement.title}</h3>
                              <p className="text-gray-600 text-sm leading-relaxed">{announcement.content}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* Floating Action Button for Quick Contact */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
            onClick={() => onNavigate && onNavigate('hotlines')}
            className="bg-red-600 text-white p-4 rounded-full shadow-lg shadow-red-600/30 hover:bg-red-700 hover:scale-110 transition-all group relative animate-bounce-slow"
        >
            <Phone className="w-6 h-6" />
            <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium top-1/2 -translate-y-1/2">
                Emergency Hotlines
            </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
              <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">i</div>
                      <span className="text-xl font-bold text-white">iBarangay</span>
                  </div>
                  <p className="max-w-md leading-relaxed mb-6 text-gray-400">Empowering communities through digital innovation. Efficient service delivery and transparent governance for every resident.</p>
                  <div className="flex gap-4">
                      {['f', 't', 'in'].map((social, idx) => (
                        <div key={idx} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all cursor-pointer font-bold">
                            {social}
                        </div>
                      ))}
                  </div>
              </div>
              <div>
                  <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Quick Links</h4>
                  <ul className="space-y-3">
                      <li><button onClick={onLogin} className="hover:text-primary-400 transition-colors hover:translate-x-1 inline-block">Resident Login</button></li>
                      <li><button onClick={onSignup} className="hover:text-primary-400 transition-colors hover:translate-x-1 inline-block">New Registration</button></li>
                      <li><button onClick={() => setActiveModal('privacy')} className="hover:text-primary-400 transition-colors hover:translate-x-1 inline-block">Privacy Policy</button></li>
                      <li><button onClick={() => setActiveModal('terms')} className="hover:text-primary-400 transition-colors hover:translate-x-1 inline-block">Terms of Service</button></li>
                  </ul>
              </div>
              <div>
                  <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Contact Us</h4>
                  <ul className="space-y-4 text-sm">
                      <li className="flex items-start gap-3 group">
                          <MapPin className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors mt-0.5" />
                          <span>Barangay Hall, 123 Rizal St.<br/>Quezon City, 1100</span>
                      </li>
                      <li className="flex items-center gap-3 group">
                          <Phone className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors" />
                          <span>(02) 8123-4567</span>
                      </li>
                      <li className="flex items-center gap-3 group">
                          <div className="w-5 h-5 flex items-center justify-center text-gray-600 group-hover:text-primary-500 transition-colors">@</div>
                          <span>help@ibarangay.com</span>
                      </li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
              &copy; 2024 iBarangay Online Services. All rights reserved.
          </div>
      </footer>

      {/* Privacy Policy Modal */}
      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Privacy Policy">
          <div className="space-y-4 text-sm text-gray-600">
              <p>Your privacy is important to us. It is iBarangay's policy to respect your privacy regarding any information we may collect from you across our website.</p>
              <h4 className="font-bold text-gray-900">1. Information We Collect</h4>
              <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
              <h4 className="font-bold text-gray-900">2. How We Use Information</h4>
              <p>We use your data to provide barangay services, process complaints, and verify residency. We do not share your data publicly or with third-parties, except when required to by law.</p>
          </div>
      </Modal>

      {/* Terms Modal */}
      <Modal isOpen={activeModal === 'terms'} onClose={() => setActiveModal(null)} title="Terms of Service">
          <div className="space-y-4 text-sm text-gray-600">
              <p>By accessing the website at iBarangay, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
              <h4 className="font-bold text-gray-900">1. Use License</h4>
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on iBarangay's website for personal, non-commercial transitory viewing only.</p>
          </div>
      </Modal>

      {/* News Article Modal */}
      <Modal isOpen={!!selectedNews} onClose={() => setSelectedNews(null)} title="">
          {selectedNews && (
              <div className="space-y-6">
                   <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-inner relative">
                       <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                       <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white shadow-black">{selectedNews.title}</h3>
                   </div>
                   
                   <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
                       <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(selectedNews.publishedAt).toLocaleDateString()}</span>
                       <span>By {selectedNews.author}</span>
                   </div>
                   
                   <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                       {selectedNews.content}
                   </p>
                   
                   <div className="flex justify-end pt-4">
                       <Button onClick={() => setSelectedNews(null)}>Close</Button>
                   </div>
              </div>
          )}
      </Modal>
    </div>
  );
};

export default Landing;
