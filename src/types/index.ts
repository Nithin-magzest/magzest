export type UserRole = 'student' | 'counselor' | 'admin' | 'appteam';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Student extends User {
  role: 'student';
  phone: string;
  nationality: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  passport?: { number: string; issueDate: string; expiryDate: string; issuingCountry: string };
  address?: { street: string; city: string; state: string; postalCode: string };
  educationLevel: string;
  gpa: number;
  englishScore: { type: 'IELTS' | 'TOEFL' | 'PTE'; score: number };
  preferredCountries: string[];
  budget: number;
  interestedCourses: string[];
  applications: Application[];
  documents: Document[];
  counselorId?: string;
  joinedDate: string;
  status: 'active' | 'inactive' | 'enrolled';
  academicDetails?: { level: string; institution: string; board: string; year: string; percentage: string; city: string; }[];
}

export interface Counselor extends User {
  role: 'counselor';
  specialization: string[];
  assignedStudents: string[];
  experience: number;
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  logo: string;
  coverImage: string;
  ranking: number;
  type: 'Public' | 'Private';
  founded: number;
  website: string;
  description: string;
  courses: Course[];
  facilities: string[];
  scholarships: Scholarship[];
  applicationDeadlines: { intake: string; deadline: string }[];
  averageFees: { undergraduate: number; postgraduate: number; currency: string };
  acceptanceRate: number;
  totalStudents: number;
  internationalStudents: number;
  rating: number;
  tags: string[];
}

export interface Course {
  id: string;
  name: string;
  level: 'Bachelor' | 'Master' | 'PhD' | 'Diploma' | 'Certificate';
  duration: string;
  tuitionFee: number;
  currency: string;
  requirements: string[];
  description: string;
  department: string;
  intake: string[];
}

export interface Scholarship {
  name: string;
  amount: number;
  currency: string;
  eligibility: string;
  deadline: string;
}

export interface Application {
  id: string;
  studentId: string;
  universityId: string;
  universityName: string;
  courseId: string;
  courseName: string;
  status: 'draft' | 'submitted' | 'under_review' | 'offer_received' | 'accepted' | 'rejected' | 'enrolled';
  submittedDate?: string;
  updatedDate: string;
  notes?: string;
  intake: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: string[];
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  type: 'student-counselor' | 'counselor-university';
}

export interface SearchFilters {
  query: string;
  country: string;
  courseLevel: string;
  minFee: number;
  maxFee: number;
  ranking: string;
  intakeYear: string;
  fieldOfStudy: string;
}
