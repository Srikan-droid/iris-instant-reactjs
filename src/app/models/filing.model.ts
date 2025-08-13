export interface FilingDetails {
  mandate: string;
  typeOfSubmission?: string;
  companyName: string;
  description?: string;
}

export interface Filing {
  id: string;
  date: string;
  details: FilingDetails;
  filename: string;
  status: 'Processing' | 'Completed';
  fileContent: string;
  userEmail: string;
}

export interface User {
  user: 'guest' | 'gmail';
  email?: string;
  name?: string;
  mandate?: string;
}

export interface FilterState {
  search: string;
  status: string;
  companyName: string;
  dateFrom: string;
  dateTo: string;
} 