import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import { useProjects } from "@/hooks/useProjects";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function AddWorkLogModal({
  isOpen,
  onClose,
  onSuccess,
  projects,
  users, // Kept for consistency if passed from parent, though not used in form directly unless we add assignment here?
  // Wait, original form didn't use 'users' prop in the form?
  // Ah, original form didn't use 'users' in render? Let me check.
  // Original Render:
  // It DID NOT use users. It only used projects.
  // Wait, AddProjectModal uses users. AddWorkLogModal... let me re-read original code.
  // Original Props: projects, users, editLog.
  // Original Form: Date, Status, Project, Task, Details, Remarks.
  // It seems 'users' was passed but unused?
  // Actually, let's keep it clean.
  editLog = null,
}) {
  const { alert } = useModal();
  const { fetchTasks, createWorkLog, updateWorkLog, tasks } = useProjects();

  const [loading, setLoading] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    taskId: "",
    details: "",
    status: "In Progress",
    remarks: "",
  });

  // Fetch tasks when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen, fetchTasks]);

  // Pre-populate form when editing
  useEffect(() => {
    if (editLog) {
      setFormData({
        date: editLog.date
          ? new Date(editLog.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        projectId: editLog.projectId?._id || "",
        taskId: editLog.taskId?._id || "",
        details: editLog.details || "",
        status: editLog.status || "In Progress",
        remarks: editLog.remarks || "",
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        projectId: "",
        taskId: "",
        details: "",
        status: "In Progress",
        remarks: "",
      });
    }
  }, [editLog, isOpen]);

  // Filter tasks by project
  useEffect(() => {
    if (formData.projectId && tasks.length > 0) {
      const projectTasks = tasks.filter(
        (t) =>
          t.projectId?._id === formData.projectId ||
          t.projectId === formData.projectId,
      );
      setFilteredTasks(projectTasks);
    } else {
      setFilteredTasks([]);
    }
  }, [formData.projectId, tasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editLog) {
        result = await updateWorkLog(editLog._id, formData);
      } else {
        result = await createWorkLog(formData);
      }

      if (result.success) {
        await alert({
          title: "Success",
          message: editLog
            ? "Work log updated successfully!"
            : "Work log created successfully!",
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
      console.error("Error submitting work log:", error);
      await alert({
        title: "Error",
        message: "An unexpected error occurred",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const projectOptions = projects.map((p) => ({ value: p._id, label: p.name }));
  const taskOptions = filteredTasks.map((t) => ({
    value: t._id,
    label: t.taskName,
  }));

  const statusOptions = [
    { value: "Not Started", label: "Not Started" },
    { value: "In Progress", label: "In Progress" },
    { value: "Follow-up", label: "Follow-up" },
    { value: "Completed", label: "Completed" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editLog ? "Edit Work Log Entry" : "Add Work Log Entry"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <Select
            label="Status"
            required
            options={statusOptions}
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          />

          <Select
            label="Project"
            required
            options={projectOptions}
            value={formData.projectId}
            onChange={(e) =>
              setFormData({
                ...formData,
                projectId: e.target.value,
                taskId: "", // Reset task when project changes
              })
            }
            placeholder="Select Project"
          />

          <Select
            label="Task"
            required
            options={taskOptions}
            value={formData.taskId}
            onChange={(e) =>
              setFormData({ ...formData, taskId: e.target.value })
            }
            placeholder="Select Task"
            disabled={!formData.projectId}
          />

          <div className="md:col-span-2">
            <Input
              label="Work Details"
              textarea
              rows={4}
              required
              placeholder="Describe what you worked on..."
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Remarks"
              textarea
              rows={2}
              placeholder="Additional notes (optional)..."
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} icon={Save}>
            {editLog ? "Update Work Log" : "Create Work Log"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
