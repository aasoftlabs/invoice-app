import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import { useProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function AddTaskModal({
  isOpen,
  onClose,
  onSuccess,
  projects: propProjects, // Optional prop
  users: propUsers, // Optional prop
  editTask = null,
}) {
  const { alert } = useModal();
  const {
    projects: hookProjects,
    fetchProjects,
    createTask,
    updateTask,
  } = useProjects();
  const { users: hookUsers, fetchUsers } = useUsers();

  const [loading, setLoading] = useState(false);

  // Use props if available, otherwise fallback to hook state
  const projects = propProjects || hookProjects;
  const users = propUsers || hookUsers;

  const [formData, setFormData] = useState({
    projectId: "",
    taskName: "",
    description: "",
    status: "Not Started",
    assignedTo: "",
  });

  // Fetch data if needed when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!propProjects) fetchProjects();
      if (!propUsers) fetchUsers();
    }
  }, [isOpen, propProjects, propUsers, fetchProjects, fetchUsers]);

  // Pre-populate form when editing
  useEffect(() => {
    if (editTask) {
      setFormData({
        projectId: editTask.projectId?._id || editTask.projectId || "",
        taskName: editTask.taskName || "",
        description: editTask.description || "",
        status: editTask.status || "Not Started",
        assignedTo: editTask.assignedTo?._id || editTask.assignedTo || "",
      });
    } else {
      setFormData({
        projectId: "",
        taskName: "",
        description: "",
        status: "Not Started",
        assignedTo: "",
      });
    }
  }, [editTask, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editTask) {
        result = await updateTask({ id: editTask._id, ...formData });
      } else {
        result = await createTask(formData);
      }

      if (result.success) {
        await alert({
          title: "Success",
          message: editTask
            ? "Task updated successfully!"
            : "Task created successfully!",
          variant: "success",
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
      console.error("Error submitting task:", error);
      await alert({
        title: "Error",
        message: "An unexpected error occurred",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const projectOptions = projects.map((project) => ({
    value: project._id,
    label: project.name,
  }));

  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTask ? "Edit Task" : "Add New Task"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Select
              label="Project"
              required
              options={projectOptions}
              value={formData.projectId}
              onChange={(e) =>
                setFormData({ ...formData, projectId: e.target.value })
              }
              placeholder="Select Project"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Task Name"
              required
              value={formData.taskName}
              onChange={(e) =>
                setFormData({ ...formData, taskName: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Description"
              textarea
              rows={3}
              placeholder="Task description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <Input
              label="Status"
              value="Not Started"
              disabled
              className="bg-gray-100 dark:bg-slate-900/50 cursor-not-allowed"
            />
          </div>

          <div>
            <Select
              label="Assigned To"
              options={userOptions}
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
              placeholder="Not Assigned"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} icon={Save}>
            {editTask ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
