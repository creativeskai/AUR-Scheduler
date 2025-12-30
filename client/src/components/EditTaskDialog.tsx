import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { TaskForm } from "./TaskForm";
import { useUpdateTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import type { Task, InsertTask } from "@shared/schema";

interface EditTaskDialogProps {
  task: Task;
  trigger?: React.ReactNode;
}

export function EditTaskDialog({ task, trigger }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useUpdateTask();
  const { toast } = useToast();

  const handleSubmit = (data: InsertTask) => {
    mutate({ id: task.id, ...data }, {
      onSuccess: () => {
        toast({
          title: "Task updated",
          description: "Task details have been saved.",
        });
        setOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="hover:text-primary">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-primary">Edit Task</DialogTitle>
          <DialogDescription>
            Update details for task: {task.name}
          </DialogDescription>
        </DialogHeader>
        <TaskForm 
          defaultValues={{
            name: task.name,
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
