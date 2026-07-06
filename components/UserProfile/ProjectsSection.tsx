// components/UserProfile/ProjectsSection.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserProject } from '../../lib/types/user'; // Import from the consolidated types folder
import UserProfileSection from './UserProfileSection';
import EditProjectForm from './EditProjectForm'; // You'll create this
import { useUserProfile } from '../../hooks/useUserProfile';
import { formatDateOnly } from '@/lib/dates';

interface ProjectsSectionProps {
  projects: UserProject[];
  canEdit?: boolean;
  onProjectsChange?: (projects: UserProject[]) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, canEdit = true, onProjectsChange }) => {
  const { deleteProject } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<UserProject | null>(null);
  const [localProjects, setLocalProjects] = useState<UserProject[]>(projects);

  const handleAddClick = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (project: UserProject) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (projectId: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId);
        const updatedProjects = localProjects.filter(p => p.id !== projectId);
        setLocalProjects(updatedProjects);
        onProjectsChange?.(updatedProjects);
        alert("Project deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete project: ${error.message}`);
      }
    }
  };

  const handleFormClose = (newItem?: UserProject) => {
    if (newItem) {
      const updatedProjects = editingProject
        ? localProjects.map(p => p.id === newItem.id ? newItem : p)
        : [...localProjects, newItem];
      setLocalProjects(updatedProjects);
      onProjectsChange?.(updatedProjects);
    }
    setIsFormOpen(false);
  };

  return (
    <UserProfileSection title="Projects" onAdd={canEdit ? handleAddClick : undefined}>
      {localProjects.length === 0 ? (
        <p className="text-gray-500 italic">No projects added yet.</p>
      ) : (
        <div className="space-y-4">
          {localProjects.map((project) => (
            <div key={project.id} className="relative p-4 border rounded-lg bg-gray-50">
              {canEdit && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(project)}
                    className="text-[#0096c7] hover:underline text-sm"
                    title="Edit Project"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(project.id)}
                    className="text-red-600 hover:underline text-sm"
                    title="Delete Project"
                  >
                    Delete
                  </button>
                </div>
              )}
              <h4 className="font-semibold text-lg text-gray-800">{project.projectName}</h4>
              <p className="text-gray-500 text-sm">
                {project.startDate ? formatDateOnly(project.startDate, 'MMM yyyy') : 'N/A'} -{' '}
                {project.endDate ? formatDateOnly(project.endDate, 'MMM yyyy') : 'Present'}
              </p>
              {project.url && <p className="text-[#0096c7] text-sm hover:underline"><a href={project.url} target="_blank" rel="noopener noreferrer">View Project</a></p>}
              {project.description && <p className="text-gray-700 mt-2 text-sm">{project.description}</p>}
            </div>
          ))}
        </div>
      )}

      {canEdit && isFormOpen && (
        <EditProjectForm
          project={editingProject}
          onClose={handleFormClose}
        />
      )}
    </UserProfileSection>
  );
};

export default ProjectsSection;