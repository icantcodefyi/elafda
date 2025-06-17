"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faUsers,
  faSpinner,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "~/hooks/use-auth";
import type {
  CollaboratorUser,
  Collaborator,
  CollaboratorManagerProps,
  CollaboratorsResponse,
  UsersSearchResponse,
  AddCollaboratorResponse,
  ErrorResponse,
} from "~/types";

export function CollaboratorManager({ postSlug, authorId }: CollaboratorManagerProps) {
  const { user, isSignedIn } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchUsers, setSearchUsers] = useState<CollaboratorUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showCollaboratorsDialog, setShowCollaboratorsDialog] = useState(false);

  // Fetch collaborators
  const fetchCollaborators = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${postSlug}/collaborators`);
      if (response.ok) {
        const data = await response.json() as CollaboratorsResponse;
        setCollaborators(data.collaborators ?? []);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search users
  const searchUsersHandler = async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }

    try {
      setIsSearching(true);
      const params = new URLSearchParams({
        q: query,
        limit: "10",
      });
      const response = await fetch(`/api/users/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json() as UsersSearchResponse;
        setSearchUsers(data.users ?? []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Add collaborator
  const addCollaborator = async (userId: string) => {
    try {
      const response = await fetch(`/api/posts/${postSlug}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json() as AddCollaboratorResponse;
        setCollaborators(prev => [...prev, data.collaborator]);
        setShowSearchDialog(false);
        setSearchQuery("");
        setSearchUsers([]);
      } else {
        const error = await response.json() as ErrorResponse;
        console.error("Error adding collaborator:", error.error);
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
    }
  };

  // Remove collaborator
  const removeCollaborator = async (userId: string) => {
    try {
      const response = await fetch(`/api/posts/${postSlug}/collaborators`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setCollaborators(prev => prev.filter(collab => collab.userId !== userId));
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
    }
  };

  useEffect(() => {
    void fetchCollaborators();
  }, [postSlug]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      void searchUsersHandler(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Only show to post author
  if (!isSignedIn || user?.id !== authorId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Add Collaborator Button */}
      <Dialog 
        open={showSearchDialog} 
        onOpenChange={(open) => {
          setShowSearchDialog(open);
          if (!open) {
            // Clear search when dialog closes
            setSearchQuery("");
            setSearchUsers([]);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FontAwesomeIcon icon={faUserPlus} className="h-3 w-3" />
            <span className="hidden sm:inline">Add Collab</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Collaborator</DialogTitle>
            <DialogDescription>
              Search for users to give them editing permissions for this post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto border rounded-md">
              {isSearching ? (
                <div className="flex items-center justify-center py-6">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="h-4 w-4 animate-spin"
                  />
                </div>
              ) : (
                <div>
                  {(() => {
                    const filteredUsers = searchUsers.filter(searchUser => 
                      !collaborators.some(collab => collab.userId === searchUser.id)
                    );
                    
                    // Show empty state only if we have a search query but no results
                    if (searchQuery.trim() && filteredUsers.length === 0) {
                      return (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                          No users found.
                        </div>
                      );
                    }
                    
                    // Show placeholder when no search query
                    if (!searchQuery.trim()) {
                      return (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                          Start typing to search users...
                        </div>
                      );
                    }
                    
                    // Show results
                    return filteredUsers.map((searchUser) => (
                      <button
                        key={searchUser.id}
                        onClick={() => void addCollaborator(searchUser.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-accent hover:text-accent-foreground text-left border-b last:border-b-0"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={searchUser.image ?? undefined} />
                          <AvatarFallback>
                            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {searchUser.name ?? "Unnamed User"}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {searchUser.email}
                          </span>
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Collaborators Button */}
      {collaborators.length > 0 && (
        <Dialog open={showCollaboratorsDialog} onOpenChange={setShowCollaboratorsDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
              <FontAwesomeIcon icon={faUsers} className="h-3 w-3 sm:mr-2" />
              <span className="hidden sm:inline">
                <Badge variant="secondary" className="ml-1">
                  {collaborators.length}
                </Badge>
              </span>
              <Badge variant="secondary" className="ml-1 sm:hidden">
                {collaborators.length}
              </Badge>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Collaborators</DialogTitle>
              <DialogDescription>
                Users who can edit this post.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="h-4 w-4 animate-spin"
                  />
                </div>
              ) : (
                collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.user.image ?? undefined} />
                        <AvatarFallback>
                          <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {collaborator.user.name ?? "Unnamed User"}
                        </span>
                        <span className="text-muted-foreground text-xxs">
                          {collaborator.user.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void removeCollaborator(collaborator.userId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 