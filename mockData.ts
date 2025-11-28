
import { User, Complaint, ServiceRequest, Event, Announcement, Notification, AuditLog, NewsItem, Hotline, Official, FAQ, SiteSettings } from './types';

// Helper to get dynamic dates
const getRelativeDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
};

const getFixedDateInCurrentMonth = (day: number) => {
    const date = new Date();
    date.setDate(day);
    return date.toISOString();
}

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'resident@ibarangay.com',
    role: 'resident',
    avatar: 'https://i.pravatar.cc/150?u=u1',
    address: 'Block 5 Lot 2, Mabuhay St.',
    phoneNumber: '09171234567',
    isVerified: true
  },
  {
    id: 'u2',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'staff@ibarangay.com',
    role: 'staff',
    avatar: 'https://i.pravatar.cc/150?u=u2',
    isVerified: true
  },
  {
    id: 'u3',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@ibarangay.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=u3',
    isVerified: true
  }
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    userId: 'u1',
    user: MOCK_USERS[0],
    title: 'Noisy Neighbors',
    description: 'Karaoke until 3AM at Lot 5 Block 2. This has been happening every weekend.',
    category: 'Noise Disturbance',
    status: 'pending',
    priority: 'medium',
    createdAt: getRelativeDate(-2),
    updatedAt: getRelativeDate(-2),
    history: [
        { id: 'h1', action: 'Complaint Filed', by: 'Juan Dela Cruz', timestamp: getRelativeDate(-2) }
    ],
    comments: []
  },
  {
    id: 'c2',
    userId: 'u1',
    user: MOCK_USERS[0],
    title: 'Uncollected Garbage',
    description: 'Garbage truck did not pass by this week.',
    category: 'Sanitation',
    status: 'in-progress',
    priority: 'high',
    createdAt: getRelativeDate(-5),
    updatedAt: getRelativeDate(-1),
    assignedTo: 'u2',
    history: [
        { id: 'h2', action: 'Complaint Filed', by: 'Juan Dela Cruz', timestamp: getRelativeDate(-5) },
        { id: 'h3', action: 'Status Updated to In-Progress', by: 'Maria Santos', timestamp: getRelativeDate(-1), note: 'Coordinating with sanitation department.' }
    ],
    comments: [
        {
            id: 'cm1',
            userId: 'u2',
            userName: 'Maria Santos',
            userRole: 'staff',
            message: 'We have contacted the contractor. They should be there by tomorrow morning.',
            timestamp: getRelativeDate(-1)
        },
        {
            id: 'cm2',
            userId: 'u1',
            userName: 'Juan Dela Cruz',
            userRole: 'resident',
            message: 'Thank you po. The smell is getting bad.',
            timestamp: getRelativeDate(-1)
        }
    ]
  },
  {
    id: 'c3',
    userId: 'u1',
    user: MOCK_USERS[0],
    title: 'Street Light Broken',
    description: 'Main street corner light is flickering.',
    category: 'Maintenance',
    status: 'resolved',
    priority: 'low',
    createdAt: getRelativeDate(-10),
    updatedAt: getRelativeDate(-8),
    assignedTo: 'u2',
    rating: 5,
    feedback: 'Fast action, thanks!',
    history: [
        { id: 'h4', action: 'Complaint Filed', by: 'Juan Dela Cruz', timestamp: getRelativeDate(-10) },
        { id: 'h5', action: 'Assigned to Staff', by: 'Admin User', timestamp: getRelativeDate(-9) },
        { id: 'h6', action: 'Resolved', by: 'Maria Santos', timestamp: getRelativeDate(-8), note: 'Bulb replaced.' }
    ],
    comments: []
  }
];

export const MOCK_SERVICES: ServiceRequest[] = [
  {
    id: 's1',
    userId: 'u1',
    user: MOCK_USERS[0],
    itemName: 'Plastic Chairs (50pcs)',
    itemType: 'Equipment',
    borrowDate: getRelativeDate(5),
    expectedReturnDate: getRelativeDate(6),
    status: 'pending',
    purpose: 'Birthday Party',
    createdAt: getRelativeDate(-1)
  },
  {
    id: 's2',
    userId: 'u1',
    user: MOCK_USERS[0],
    itemName: 'Basketball Court',
    itemType: 'Facility',
    borrowDate: getRelativeDate(-2),
    expectedReturnDate: getRelativeDate(-2),
    status: 'approved',
    purpose: 'Youth League Practice',
    createdAt: getRelativeDate(-4)
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Barangay General Assembly',
    description: 'Quarterly meeting to discuss budget and projects. All residents are encouraged to attend.',
    eventDate: getFixedDateInCurrentMonth(15), // Always on the 15th of current month
    location: 'Barangay Hall',
    organizerId: 'u3',
    maxAttendees: 200,
    currentAttendees: 45,
    category: 'Meeting',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=300&h=200'
  },
  {
    id: 'e2',
    title: 'Free Medical Mission',
    description: 'Free checkups and vitamins distribution for seniors and children.',
    eventDate: getFixedDateInCurrentMonth(20), // Always on the 20th of current month
    location: 'Covered Court',
    organizerId: 'u2',
    maxAttendees: 500,
    currentAttendees: 120,
    category: 'Health',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300&h=200'
  },
  {
    id: 'e3',
    title: 'Youth Sports League',
    description: 'Opening of the inter-barangay basketball and volleyball league.',
    eventDate: getFixedDateInCurrentMonth(25), 
    location: 'Sports Complex',
    organizerId: 'u2',
    maxAttendees: 300,
    currentAttendees: 50,
    category: 'Sports',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ee3?auto=format&fit=crop&q=80&w=300&h=200'
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Scheduled Power Interruption',
    content: 'Meralco scheduled maintenance on Nov 5, 8AM to 5PM affecting Block 1-5.',
    category: 'maintenance',
    priority: 'high',
    isPublished: true,
    isPinned: true,
    views: 1250,
    createdAt: getRelativeDate(-3),
    author: 'Admin'
  },
  {
    id: 'a2',
    title: 'New Curfew Guidelines',
    content: 'Curfew for minors is now strictly observed from 10PM to 4AM.',
    category: 'policy',
    priority: 'medium',
    isPublished: true,
    isPinned: false,
    views: 890,
    createdAt: getRelativeDate(-10),
    author: 'Admin'
  }
];

export const MOCK_NEWS: NewsItem[] = [
    {
        id: 'news1',
        title: 'Barangay Wins Cleanest Community Award',
        summary: 'Our barangay has been recognized as the cleanest in the district for the 3rd consecutive year.',
        content: 'Our barangay has been recognized as the cleanest in the district for the 3rd consecutive year. This award is a testament to the hard work and dedication of our residents and street sweepers. We hope to maintain this status in the coming years.',
        imageUrl: 'https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&q=80&w=300&h=200',
        publishedAt: getRelativeDate(-2),
        author: 'Staff'
    },
    {
        id: 'news2',
        title: 'New Community Garden Project Launched',
        summary: 'Residents gathered this weekend to plant vegetables in the new communal space.',
        content: 'Residents gathered this weekend to plant vegetables in the new communal space located behind the multi-purpose hall. This project aims to promote urban farming and food sustainability.',
        imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=300&h=200',
        publishedAt: getRelativeDate(-5),
        author: 'Staff'
    }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Service Approved',
    message: 'Your request for Basketball Court has been approved.',
    type: 'success',
    isRead: false,
    createdAt: getRelativeDate(-1)
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'Announcement',
    message: 'New scheduled power interruption posted.',
    type: 'warning',
    isRead: true,
    createdAt: getRelativeDate(-2)
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log1',
    userId: 'u3',
    user: MOCK_USERS[2],
    action: 'USER_LOGIN',
    resource: 'Auth System',
    timestamp: getRelativeDate(0),
    status: 'success',
    ipAddress: '192.168.1.1'
  },
  {
    id: 'log2',
    userId: 'u2',
    user: MOCK_USERS[1],
    action: 'UPDATE_COMPLAINT_STATUS',
    resource: 'Complaint #c1',
    timestamp: getRelativeDate(-1),
    status: 'success',
    ipAddress: '192.168.1.25'
  },
  {
    id: 'log3',
    userId: 'u3',
    user: MOCK_USERS[2],
    action: 'DELETE_USER',
    resource: 'User #u5',
    timestamp: getRelativeDate(-5),
    status: 'success',
    ipAddress: '192.168.1.1'
  }
];

export const MOCK_HOTLINES: Hotline[] = [
    { id: 'h1', name: 'Barangay Emergency', number: '(02) 8123-4567', category: 'emergency' },
    { id: 'h2', name: 'Police Station', number: '117', category: 'security' },
    { id: 'h3', name: 'Fire Station', number: '911', category: 'emergency' },
    { id: 'h4', name: 'Health Center', number: '(02) 8123-5555', category: 'health' },
    { id: 'h5', name: 'Barangay Captain', number: '0917-000-0000', category: 'official' },
    { id: 'h6', name: 'Meralco', number: '16211', category: 'utility' }
];

export const MOCK_OFFICIALS: Official[] = [
    { id: 'off1', name: 'Hon. Ricardo Dalisay', position: 'Barangay Captain', imageUrl: 'https://i.pravatar.cc/150?u=off1' },
    { id: 'off2', name: 'Kgd. Flora Borja', position: 'Kagawad - Health', imageUrl: 'https://i.pravatar.cc/150?u=off2' },
    { id: 'off3', name: 'Kgd. Delfin Borja', position: 'Kagawad - Security', imageUrl: 'https://i.pravatar.cc/150?u=off3' },
    { id: 'off4', name: 'Sec. Teddy Arellano', position: 'Barangay Secretary', imageUrl: 'https://i.pravatar.cc/150?u=off4' },
];

export const MOCK_FAQS: FAQ[] = [
    { id: 'faq1', question: 'How do I file a complaint?', answer: 'Navigate to the Complaints page, click File Complaint, and fill out the form.', category: 'Services' },
    { id: 'faq2', question: 'What are the requirements for residency ID?', answer: 'You need to present a valid government ID and proof of billing.', category: 'Documents' },
];

export const MOCK_SITE_SETTINGS: SiteSettings = {
    id: 'settings',
    barangayName: 'Barangay San Isidro',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/921/921356.png', // Placeholder icon
    contactEmail: 'help@ibarangay.com',
    contactPhone: '(02) 8123-4567',
    address: '123 Rizal St, Barangay San Isidro, Quezon City',
    facebookUrl: 'https://facebook.com',
    twitterUrl: 'https://twitter.com'
};
