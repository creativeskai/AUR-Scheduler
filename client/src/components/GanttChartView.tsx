import { Task } from "@shared/schema";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useMemo, useState } from "react";
import { EditTaskDialog } from "./EditTaskDialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GanttChartViewProps {
  tasks: Task[];
}

export function GanttChartView({ tasks }: GanttChartViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Map database tasks to Gantt library tasks
  const ganttTasks = useMemo<GanttTask[]>(() => {
    if (!tasks.length) return [];
    
    return tasks.map(t => ({
      start: new Date(t.startDate),
      end: new Date(t.endDate),
      name: t.name,
      id: String(t.id),
      type: "task",
      progress: t.progress,
      isDisabled: false,
      styles: {
        progressColor: t.isOverdue && t.status !== 'done' ? '#ef4444' : '#3b82f6', // red if overdue, blue otherwise
        progressSelectedColor: '#2563eb',
        backgroundColor: t.isOverdue && t.status !== 'done' ? '#fee2e2' : '#dbeafe', // light red or light blue
      },
    }));
  }, [tasks]);

  const handleTaskClick = (task: GanttTask) => {
    const originalTask = tasks.find(t => String(t.id) === task.id);
    if (originalTask) {
      setSelectedTask(originalTask);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground shadow-sm">
        No tasks available for Gantt chart. Create a task to visualize the timeline.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select 
          value={viewMode} 
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="View Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ViewMode.Day}>Day View</SelectItem>
            <SelectItem value={ViewMode.Week}>Week View</SelectItem>
            <SelectItem value={ViewMode.Month}>Month View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-2 gantt-container">
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onSelect={handleTaskClick}
          listCellWidth="155px"
          columnWidth={viewMode === ViewMode.Month ? 300 : 60}
          headerHeight={50}
          rowHeight={50}
          barFill={70}
          barCornerRadius={8}
          fontFamily="inherit"
        />
      </div>

      {/* Hidden edit dialog triggered by selection */}
      {selectedTask && (
        <EditTaskDialog 
          task={selectedTask} 
          trigger={<button id="edit-trigger" className="hidden"></button>} 
        />
      )}
      
      {/* 
        Note: The standard Gantt library onClick doesn't easily allow wrapping the row in a Trigger.
        A real implementation might need a custom state-controlled Dialog that opens when selectedTask changes.
        For now, we'll render a separate Edit dialog that is controlled by the state.
      */}
      {selectedTask && (
        <GanttEditDialog 
          task={selectedTask} 
          open={!!selectedTask} 
          onOpenChange={(open) => !open && setSelectedTask(null)} 
        />
      )}
    </div>
  );
}

// Wrapper to adapt EditTaskDialog logic for external state control
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useUpdateTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import type { InsertTask } from "@shared/schema";

function GanttEditDialog({ task, open, onOpenChange }: { task: Task, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { mutate, isPending } = useUpdateTask();
  const { toast } = useToast();

  const handleSubmit = (data: InsertTask) => {
    mutate({ id: task.id, ...data }, {
      onSuccess: () => {
        toast({ title: "Task updated", description: "Saved changes from Gantt view." });
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Task: {task.name}</DialogTitle>
          <DialogDescription>Modify task details directly from the timeline.</DialogDescription>
        </DialogHeader>
        <TaskForm 
          defaultValues={{
            name: task.name,
            segment: task.segment,
            description: task.description || "",
            status: task.status as "todo" | "in-progress" | "done",
            progress: task.progress,
            assignee: task.assignee || "",
            startDate: new Date(task.startDate),
            endDate: new Date(task.endDate),
          }}
          onSubmit={handleSubmit} 
          isPending={isPending} 
          submitLabel="Save Changes" 
        />
      </DialogContent>
    </Dialog>
  );
}
