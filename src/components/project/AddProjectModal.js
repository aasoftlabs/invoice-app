import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import { useProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function AddProjectModal({
  isOpen,
  onClose,
  onSuccess,
  editProject,
}) {
  const { alert } = useModal();
  const { createProject, updateProject } = useProjects();
  const { users, fetchUsers } = useUsers();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    priority: "Medium",
    client: "",
    refLink: "",
    projectManager: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name || "",
        priority: editProject.priority || "Medium",
        client: editProject.client || "",
        refLink: editProject.refLink || "",
        projectManager:
          editProject.projectManager?._id || editProject.projectManager || "",
      });
    } else {
      setFormData({
        name: "",
        priority: "Medium",
        client: "",
        refLink: "",
        projectManager: "",
      });
    }
  }, [editProject, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editProject) {
        result = await updateProject({ ...formData, id: editProject._id });
      } else {
        result = await createProject(formData);
      }

      if (result.success) {
        await alert({
          title: "Success",
          message: editProject
            ? "Project updated successfully!"
            : "Project created successfully!",
          variant: "success",
        });
        setFormData({
          name: "",
          priority: "Medium",
          client: "",
          refLink: "",
          projectManager: "",
        });
        onSuccess();
        onClose();
      } else {
        await alert({
          title: "Error",
          message: result.error || "Operation failed",
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      await alert({
        title: "Error",
        message: "An unexpected error occurred",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  const managerOptions = users.map((user) => ({
    value: user._id,
    label: `${user.name} (${user.email})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editProject ? "Edit Project" : "Add New Project"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Project Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <Select
            label="Priority"
            required
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
          />

          <Input
            label="Client Name"
            required
            placeholder="Enter client name"
            value={formData.client}
            onChange={(e) =>
              setFormData({ ...formData, client: e.target.value })
            }
          />

          <Select
            label="Project Manager"
            options={managerOptions}
            value={formData.projectManager}
            onChange={(e) =>
              setFormData({ ...formData, projectManager: e.target.value })
            }
            placeholder="Select Manager"
          />

          <div className="md:col-span-2">
            <Input
              label="Reference Link"
              type="url"
              placeholder="https://..."
              value={formData.refLink}
              onChange={(e) =>
                setFormData({ ...formData, refLink: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Status, start date, and end date will be
              automatically managed:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-400/80 mt-2 ml-4 list-disc space-y-1">
              <li>
                Status starts as &quot;Not Started&quot; and updates based on
                task completion
              </li>
              <li>Start date is set from the first work log entry</li>
              <li>End date is set from the most recent work log entry</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} icon={Save}>
            {editProject ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
