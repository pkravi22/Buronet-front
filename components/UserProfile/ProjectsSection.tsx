// components/UserProfile/ProjectsSection.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserProject } from '../../lib/types/user'; // Import from the consolidated types folder
import UserProfileSection from './UserProfileSection';
import EditProjectForm from './EditProjectForm'; // You'll create this
import { useUserProfile } from '../../hooks/useUserProfile';
import { format } from 'date-fns';

interface ProjectsSectionProps {
  projects: UserProject[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const { deleteProject } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<UserProject | null>(null);

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
        alert("Project deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete project: ${error.message}`);
      }
    }
  };

  return (
    <UserProfileSection title="Projects" onAdd={handleAddClick}>
      {projects.length === 0 ? (
        <p className="text-gray-500 italic">No projects added yet. Click "Add New" to add one.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="relative p-4 border rounded-lg bg-gray-50">
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleEditClick(project)}
                  className="text-blue-600 hover:underline text-sm"
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
              <h4 className="font-semibold text-lg text-gray-800">{project.projectName}</h4>
              <p className="text-gray-500 text-sm">
                {project.startDate ? format(new Date(project.startDate), 'MMM yyyy') : 'N/A'} -{' '}
                {project.endDate ? format(new Date(project.endDate), 'MMM yyyy') : 'Present'}
              </p>
              {project.url && <p className="text-blue-600 text-sm hover:underline"><a href={project.url} target="_blank" rel="noopener noreferrer">View Project</a></p>}
              {project.description && <p className="text-gray-700 mt-2 text-sm">{project.description}</p>}
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <EditProjectForm
          project={editingProject}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </UserProfileSection>
  );
};

export default ProjectsSection;