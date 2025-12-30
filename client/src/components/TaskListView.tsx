import { Task } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditTaskDialog } from "./EditTaskDialog";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useDeleteTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskListViewProps {
  tasks: Task[];
}

export function TaskListView({ tasks }: TaskListViewProps) {
  const { mutate: deleteTask } = useDeleteTask();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteTask(id, {
      onSuccess: () => {
        toast({
          title: "Task deleted",
          description: "Task removed from project.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete task.",
          variant: "destructive",
        });
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-500 hover:bg-slate-600';
      case 'in-progress': return 'bg-amber-500 hover:bg-amber-600';
      case 'done': return 'bg-emerald-500 hover:bg-emerald-600';
      default: return 'bg-primary hover:bg-primary/90';
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[30%]">Task Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-4 rounded-full bg-muted">
                    <Calendar className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p>No tasks yet. Create your first task to get started.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id} className="group hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {task.isOverdue && task.status !== 'done' && (
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <span className={task.isOverdue && task.status !== 'done' ? "text-destructive font-semibold" : ""}>
                      {task.name}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[200px]">
                      {task.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(task.status)} capitalize shadow-sm`}>
                    {task.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assignee ? (
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {task.assignee}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-muted-foreground gap-1">
                    <span className="font-mono">{format(new Date(task.startDate), 'MMM d, yyyy')}</span>
                    <span className="text-center w-4 text-muted-foreground/50">↓</span>
                    <span className="font-mono">{format(new Date(task.endDate), 'MMM d, yyyy')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-full max-w-[100px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{task.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditTaskDialog task={task} />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Task</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{task.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
