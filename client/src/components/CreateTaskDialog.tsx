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
import { Plus } from "lucide-react";
import { TaskForm } from "./TaskForm";
import { useCreateTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import type { InsertTask } from "@shared/schema";

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateTask();
  const { toast } = useToast();

  const handleSubmit = (data: InsertTask) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Task created",
          description: "New task has been added successfully.",
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
        <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-primary">Create New Task</DialogTitle>
          <DialogDescription>
            Add details for a new project task. Start and End dates are required.
          </DialogDescription>
        </DialogHeader>
        <TaskForm 
          onSubmit={handleSubmit} 
          isPending={isPending} 
          submitLabel="Create Task" 
        />
      </DialogContent>
    </Dialog>
  );
}
