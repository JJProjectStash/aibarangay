import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Modal,
  ConfirmDialog,
  FileUpload,
  Select,
} from "../components/UI";
import { SharedCalendar } from "../components/SharedCalendar";
import { api } from "../services/api";
import { Event } from "../types";
import { useToast } from "../components/Toast";

const AdminCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    maxAttendees: 100,
    category: "General",
    imageUrl: "",
    organizerId: "admin",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "General",
    "Sports",
    "Cultural",
    "Health",
    "Education",
    "Community Service",
    "Meeting",
    "Other",
  ];

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) {
      showToast("Error", "Failed to fetch events", "error");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim() || formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    if (formData.title.length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
    }

    if (!formData.description.trim() || formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }

    if (!formData.eventDate) {
      newErrors.eventDate = "Please select event date and time";
    } else {
      const eventDate = new Date(formData.eventDate);
      const now = new Date();
      if (eventDate < now) {
        newErrors.eventDate = "Event date cannot be in the past";
      }
    }

    if (!formData.location.trim() || formData.location.length < 3) {
      newErrors.location = "Location must be at least 3 characters";
    }
    if (formData.location.length > 200) {
      newErrors.location = "Location must not exceed 200 characters";
    }

    if (!formData.maxAttendees || formData.maxAttendees < 1) {
      newErrors.maxAttendees = "Maximum attendees must be at least 1";
    }
    if (formData.maxAttendees > 10000) {
      newErrors.maxAttendees = "Maximum attendees cannot exceed 10,000";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDayClick = (day: Date) => {
    // Format for datetime-local input - set to 9 AM
    const isoString = new Date(day.setHours(9, 0, 0, 0))
      .toISOString()
      .slice(0, 16);
    setFormData({ ...formData, eventDate: isoString });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast(
        "Validation Error",
        "Please fix the errors in the form",
        "error"
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.createEvent(formData);
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        maxAttendees: 100,
        category: "General",
        imageUrl: "",
        organizerId: "admin",
      });
      setErrors({});
      showToast("Success", "Event created successfully", "success");
      fetchEvents();
    } catch (error: any) {
      showToast("Error", error.message || "Failed to create event", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.id) {
      try {
        await api.deleteEvent(deleteDialog.id);
        setDeleteDialog({ isOpen: false, id: null });
        showToast("Success", "Event deleted successfully", "success");
        fetchEvents();
      } catch (error) {
        showToast("Error", "Failed to delete event", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Barangay Calendar
          </h1>
          <p className="text-gray-500">Manage community events and schedules</p>
        </div>
        <Button
          onClick={() => {
            setFormData({ ...formData, eventDate: "" });
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <SharedCalendar
        events={events}
        onDateClick={handleDayClick}
        renderEventAction={(ev) => (
          <button
            className="absolute top-0 right-0 bottom-0 px-1 bg-red-500 text-white flex items-center justify-center rounded-r hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialog({ isOpen: true, id: ev.id });
            }}
            title="Delete event"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({
            title: "",
            description: "",
            eventDate: "",
            location: "",
            maxAttendees: 100,
            category: "General",
            imageUrl: "",
            organizerId: "admin",
          });
          setErrors({});
        }}
        title="Add Event"
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label required>Event Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
              placeholder="e.g., Community Clean-up Drive"
              maxLength={100}
              error={errors.title}
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label required>Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.eventDate}
                onChange={(e) => {
                  setFormData({ ...formData, eventDate: e.target.value });
                  if (errors.eventDate) setErrors({ ...errors, eventDate: "" });
                }}
                min={new Date().toISOString().slice(0, 16)}
                error={errors.eventDate}
              />
            </div>

            <div className="space-y-2">
              <Label required>Category</Label>
              <Select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: "" });
                }}
                error={errors.category}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label required>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => {
                setFormData({ ...formData, location: e.target.value });
                if (errors.location) setErrors({ ...errors, location: "" });
              }}
              placeholder="e.g., Barangay Hall, Basketball Court"
              maxLength={200}
              error={errors.location}
            />
            <p className="text-xs text-gray-500">
              {formData.location.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label required>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description)
                  setErrors({ ...errors, description: "" });
              }}
              placeholder="Describe the event details, activities, and what attendees should bring..."
              className="min-h-[100px]"
              maxLength={500}
              error={errors.description}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label required>Max Attendees</Label>
            <Input
              type="number"
              min="1"
              max="10000"
              value={formData.maxAttendees}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  maxAttendees: parseInt(e.target.value) || 100,
                });
                if (errors.maxAttendees)
                  setErrors({ ...errors, maxAttendees: "" });
              }}
              error={errors.maxAttendees}
            />
            <p className="text-xs text-gray-500">
              Maximum number of people who can register
            </p>
          </div>

          <div className="space-y-2">
            <FileUpload
              label="Event Banner (Optional)"
              value={formData.imageUrl}
              onChange={(val) => setFormData({ ...formData, imageUrl: val })}
              helperText="Upload an event banner image (JPG, PNG, max 5MB)"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Events will appear on the calendar and
              residents can register to attend.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setFormData({
                  title: "",
                  description: "",
                  eventDate: "",
                  location: "",
                  maxAttendees: 100,
                  category: "General",
                  imageUrl: "",
                  organizerId: "admin",
                });
                setErrors({});
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Event"
        description="Are you sure you want to remove this event from the calendar? Registered attendees will no longer see this event."
        confirmText="Delete Event"
      />
    </div>
  );
};

export default AdminCalendar;
