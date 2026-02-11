export enum UserRole {
  SISWA = 'SISWA',
  MENTOR = 'MENTOR',
  PEMBINA = 'PEMBINA',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export enum SubmissionStatus {
  PENDING = 'Menunggu Review',
  REVISION = 'Perlu Revisi',
  APPROVED = 'ACC / Disetujui'
}

export interface Submission {
  id: string;
  title: string;
  studentName: string;
  date: string;
  status: SubmissionStatus;
  feedback?: string;
  fileUrl: string;
  chapter: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
}

export interface Reference {
  id: string;
  title: string;
  author: string;
  year: string;
  type: 'Jurnal' | 'Buku' | 'Artikel';
  url: string;
}
