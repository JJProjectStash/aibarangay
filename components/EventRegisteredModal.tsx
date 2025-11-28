import React from "react";
import { Modal, CardContent, Badge } from "./UI";
import { Mail, Phone, MapPin } from "lucide-react";
import { User as UserType } from "../types";

interface EventRegisteredModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  registeredUsers: UserType[];
}

const EventRegisteredModal: React.FC<EventRegisteredModalProps> = ({
  isOpen,
  onClose,
  eventTitle,
  registeredUsers,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registered Attendees - ${eventTitle}`}
      className="max-w-2xl"
    >
      <CardContent className="p-0">
        {registeredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No attendees registered yet.
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              {registeredUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={user.avatar || "https://via.placeholder.com/48"}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <Badge variant="primary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{user.phoneNumber}</span>
                          </div>
                        )}
                        {user.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{user.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Modal>
  );
};

export default EventRegisteredModal;
