
import React, { useEffect, useState } from 'react';
import { Newspaper, ChevronRight, ArrowLeft, Calendar, User } from 'lucide-react';
import { Button, Modal } from '../components/UI';
import { api } from '../services/api';
import { NewsItem } from '../types';

const NewsPage = ({ onBack }: { onBack: () => void }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
      const fetch = async () => {
          const data = await api.getNews();
          setNews(data);
          setLoading(false);
      }
      fetch();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-8">
                <div>
                    <Button variant="ghost" onClick={onBack} className="mb-4 pl-0 hover:pl-2 transition-all text-gray-500 hover:text-primary-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                        <Newspaper className="w-8 h-8 md:w-10 md:h-10 text-primary-600" />
                        Community News
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Updates, stories, and highlights from your barangay.</p>
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-3 gap-8">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-white rounded-xl h-96 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-t-xl" />
                            <div className="p-6 space-y-3">
                                <div className="h-6 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedNews(item)}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer border border-gray-100"
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                <span className="absolute bottom-4 left-4 text-white text-xs font-bold bg-primary-600/90 px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
                                    {new Date(item.publishedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                                    {item.summary}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                        <User className="w-3 h-3" /> {item.author}
                                    </span>
                                    <span className="text-primary-600 font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                                        Read Story <ChevronRight className="w-4 h-4 ml-1" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Article Modal */}
        <Modal isOpen={!!selectedNews} onClose={() => setSelectedNews(null)} title="">
          {selectedNews && (
              <div className="space-y-6">
                   <div className="w-full h-64 md:h-80 bg-gray-200 rounded-xl overflow-hidden shadow-inner relative">
                       <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                       <h2 className="absolute bottom-6 left-6 right-6 text-2xl md:text-3xl font-bold text-white leading-tight shadow-black">
                           {selectedNews.title}
                       </h2>
                   </div>
                   
                   <div className="flex items-center gap-6 text-sm text-gray-500 border-b border-gray-100 pb-4">
                       <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-primary-500" />
                           {new Date(selectedNews.publishedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                       </div>
                       <div className="flex items-center gap-2">
                           <User className="w-4 h-4 text-primary-500" />
                           By {selectedNews.author}
                       </div>
                   </div>

                   <div className="prose prose-blue max-w-none">
                       <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                           {selectedNews.content}
                       </p>
                   </div>
                   
                   <div className="pt-6 flex justify-end">
                       <Button onClick={() => setSelectedNews(null)}>Close Article</Button>
                   </div>
              </div>
          )}
      </Modal>
    </div>
  );
};

export default NewsPage;
