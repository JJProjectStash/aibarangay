import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Label, Textarea, Modal, ConfirmDialog, FileUpload } from '../components/UI';
import { SharedCalendar } from '../components/SharedCalendar';
import { api } from '../services/api';
import { Event } from '../types';

const AdminCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  const [formData, setFormData] = useState({
      title: '', description: '', eventDate: '', location: '', maxAttendees: 100, category: 'General', imageUrl: '', organizerId: 'admin'
  });

  const fetchEvents = async () => {
      const data = await api.getEvents();
      setEvents(data);
  };

  useEffect(() => {
      fetchEvents();
  }, []);

  const handleDayClick = (day: Date) => {
      // Format for datetime-local input
      const isoString = new Date(day.setHours(9,0,0,0)).toISOString().slice(0, 16);
      setFormData({...formData, eventDate: isoString});
      setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await api.createEvent(formData);
      setShowModal(false);
      fetchEvents();
  };

  const handleDelete = async () => {
      if(deleteDialog.id) {
          await api.deleteEvent(deleteDialog.id);
          setDeleteDialog({isOpen: false, id: null});
          fetchEvents();
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Barangay Calendar</h1>
                <p className="text-gray-500">Manage community events and schedules</p>
            </div>
            <Button onClick={() => { setFormData({...formData, eventDate: ''}); setShowModal(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
            </Button>
        </div>

        <SharedCalendar 
            events={events}
            onDateClick={handleDayClick}
            renderEventAction={(ev) => (
                <button 
                    className="absolute top-0 right-0 bottom-0 px-1 bg-red-500 text-white flex items-center justify-center rounded-r"
                    onClick={(e) => { e.stopPropagation(); setDeleteDialog({isOpen: true, id: ev.id}); }}
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}
        />

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Event">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label required>Event Title</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label required>Date & Time</Label>
                    <Input type="datetime-local" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label required>Location</Label>
                    <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label required>Description</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Max Attendees</Label>
                    <Input type="number" value={formData.maxAttendees} onChange={e => setFormData({...formData, maxAttendees: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                    <FileUpload 
                        label="Event Banner"
                        value={formData.imageUrl} 
                        onChange={val => setFormData({...formData, imageUrl: val})} 
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit">Create Event</Button>
                </div>
            </form>
        </Modal>

        <ConfirmDialog 
            isOpen={deleteDialog.isOpen} 
            onClose={() => setDeleteDialog({isOpen: false, id: null})}
            onConfirm={handleDelete}
            title="Delete Event"
            description="Are you sure you want to remove this event from the calendar?"
        />
    </div>
  );
};

export default AdminCalendar;