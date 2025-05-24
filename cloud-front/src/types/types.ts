export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string; 
    last_name: string;  
    file_count: number; 
    total_size: number; 
    is_admin: boolean;
  }
  

export interface AuthState {
  user: User | null;
}


export interface File {
  id: number;
  name: string;
  size: number;
  comment: string;
  uploadedAt: string;
}


export interface FileData {
  id: number;
  name: string;
  external_link: string | null;
  url: string;
  comment: string | null;
  uploadedAt: string;
}


export interface FileManagerProps {
  refresh: boolean;
}

export interface UploadFileProps {
  onUploadSuccess: () => void;
}