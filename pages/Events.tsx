import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Clock, Eye, CalendarX } from "lucide-react";
import { Button, Card, CardContent, Badge, Skeleton } from "../components/UI";
import EventRegisteredModal from "../components/EventRegisteredModal";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import { Event, User as UserType } from "../types";
import { EmptyState, ErrorState } from "../components/Loading";

interface EventsProps {
  user: UserType;
  onNavigate?: (page: string) => void;
}

const EventCardSkeleton = () => (
  <Card className="overflow-hidden flex flex-col h-full animate-pulse">
    <div className="h-48 w-full bg-gray-200" />
    <CardContent className="p-5 flex-1 flex flex-col">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <div className="space-y-3 mb-6 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="mt-auto pt-4 border-t border-gray-100">
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);

const Events: React.FC<EventsProps> = ({ user, onNavigate }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserType[]>([]);
  const [showRegisteredModal, setShowRegisteredModal] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      setError("Failed to load events");
      showToast("Error", "Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId: string) => {
    setRegisteringId(eventId);
    try {
      await api.registerForEvent(eventId, user.id);
      showToast("Success", "Successfully registered for event", "success");
      fetchEvents();
    } catch (err) {
      console.error("Event registration failed", err);
      showToast("Error", "Failed to register for event", "error");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleViewRegistered = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const users = await api.getEventRegisteredUsers(event.id);
      setRegisteredUsers(users);
      setShowRegisteredModal(true);
    } catch (error) {
      console.error("Failed to fetch registered users:", error);
      setRegisteredUsers([]);
      setShowRegisteredModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Events</h1>
          <p className="text-gray-500">Upcoming gatherings and programs</p>
        </div>
        {user.role !== "resident" && (
          <Button onClick={() => onNavigate && onNavigate("admin-calendar")}>
            Manage Events
          </Button>
        )}
      </div>

      {error && !loading ? (
        <ErrorState
          title="Failed to load events"
          message={error}
          onRetry={fetchEvents}
        />
      ) : loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarX className="w-8 h-8" />}
          title="No upcoming events"
          description="Check back later for community events and gatherings."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <div className="h-48 w-full bg-gray-200 relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <Badge variant="primary" className="absolute top-4 right-4">
                  {event.category}
                </Badge>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {event.title}
                  </h3>
                </div>

                <div className="space-y-3 text-sm text-gray-600 mb-6 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span>
                      {new Date(event.eventDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-500" />
                    <span>
                      {event.currentAttendees} / {event.maxAttendees} attending
                    </span>
                  </div>
                  <p className="text-gray-500 mt-2 line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                  {(user.role === "admin" || user.role === "staff") && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewRegistered(event)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Registered ({event.currentAttendees})
                    </Button>
                  )}
                  {event.isRegistered ? (
                    <Button
                      disabled
                      className="w-full bg-green-100 text-green-700 border-none hover:bg-green-100"
                    >
                      Registered
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRegister(event.id)}
                      className="w-full"
                      disabled={
                        event.currentAttendees >= event.maxAttendees ||
                        registeringId === event.id
                      }
                      isLoading={registeringId === event.id}
                    >
                      {registeringId === event.id
                        ? "Registering..."
                        : event.currentAttendees >= event.maxAttendees
                        ? "Full"
                        : "Register Now"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EventRegisteredModal
        isOpen={showRegisteredModal}
        onClose={() => setShowRegisteredModal(false)}
        eventTitle={selectedEvent?.title || ""}
        registeredUsers={registeredUsers}
      />
    </div>
  );
};

export default Events;
