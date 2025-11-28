
import React, { useEffect, useState } from 'react';
import { Phone, Shield, Ambulance, Zap, Building2, Search } from 'lucide-react';
import { Card, CardContent, Button, Input } from '../components/UI';
import { api } from '../services/api';
import { Hotline } from '../types';

const Hotlines: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
        const data = await api.getHotlines();
        setHotlines(data);
        setLoading(false);
    }
    fetch();
  }, []);

  const getIcon = (category: string) => {
      switch(category) {
          case 'security': return <Shield className="w-6 h-6 text-blue-600" />;
          case 'emergency': return <Ambulance className="w-6 h-6 text-red-600" />;
          case 'utility': return <Zap className="w-6 h-6 text-yellow-600" />;
          case 'health': return <Ambulance className="w-6 h-6 text-green-600" />;
          default: return <Building2 className="w-6 h-6 text-gray-600" />;
      }
  }

  const filtered = hotlines.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.number.includes(search));

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Phone className="w-8 h-8 text-primary-600" />
                        Emergency Hotlines
                    </h1>
                    <p className="text-gray-500 mt-2">Essential contact numbers for emergency assistance</p>
                </div>
                {onBack && <Button variant="outline" onClick={onBack}>Back to Home</Button>}
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                    placeholder="Search hotlines..." 
                    className="pl-11 h-12 text-lg"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-12">Loading numbers...</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {filtered.map(hotline => (
                        <Card key={hotline.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary-500">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-gray-100">
                                        {getIcon(hotline.category)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{hotline.name}</h3>
                                        <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">{hotline.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <a href={`tel:${hotline.number}`} className="block text-xl font-bold text-primary-600 hover:text-primary-700 font-mono">
                                        {hotline.number}
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h3 className="text-red-800 font-bold text-lg mb-2">In case of extreme emergency</h3>
                <p className="text-red-600">Please dial 911 immediately for life-threatening situations.</p>
            </div>
        </div>
    </div>
  );
};

export default Hotlines;
