export interface CollaboratorUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface Collaborator {
  id: string;
  userId: string;
  user: CollaboratorUser;
  createdAt: string;
}

export interface CollaboratorManagerProps {
  postSlug: string;
  authorId: string;
}

// API Response Types
export interface CollaboratorsResponse {
  collaborators: Collaborator[];
}

export interface UsersSearchResponse {
  users: CollaboratorUser[];
}

export interface AddCollaboratorResponse {
  collaborator: Collaborator;
} 