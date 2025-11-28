import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '../components/UI';
import { api } from '../services/api';
import { Event, User } from '../types';

interface EventsProps {
  user: User;
  onNavigate?: (page: string) => void;
}

const Events: React.FC<EventsProps> = ({ user, onNavigate }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await api.getEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId: string) => {
    await api.registerForEvent(eventId, user.id);
    fetchEvents();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Events</h1>
          <p className="text-gray-500">Upcoming gatherings and programs</p>
        </div>
        {user.role !== 'resident' && (
             <Button onClick={() => onNavigate && onNavigate('admin-calendar')}>Manage Events</Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading events...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="h-48 w-full bg-gray-200 relative">
                 <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                 <Badge variant="primary" className="absolute top-4 right-4">{event.category}</Badge>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{event.title}</h3>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600 mb-6 flex-1">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span>{new Date(event.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary-500" />
                        <span>{event.currentAttendees} / {event.maxAttendees} attending</span>
                    </div>
                    <p className="text-gray-500 mt-2 line-clamp-3">{event.description}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                    {event.isRegistered ? (
                        <Button disabled className="w-full bg-green-100 text-green-700 border-none hover:bg-green-100">Registered</Button>
                    ) : (
                        <Button onClick={() => handleRegister(event.id)} className="w-full" disabled={event.currentAttendees >= event.maxAttendees}>
                            {event.currentAttendees >= event.maxAttendees ? 'Full' : 'Register Now'}
                        </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;