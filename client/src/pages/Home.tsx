import { useState } from "react";
import { useTasks, useCheckOverdue } from "@/hooks/use-tasks";
import { TaskListView } from "@/components/TaskListView";
import { GanttChartView } from "@/components/GanttChartView";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutList, 
  BarChart, 
  RefreshCw, 
  CalendarClock, 
  CheckCircle2,
  AlertCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: tasks, isLoading, isError } = useTasks();
  const { mutate: checkOverdue, isPending: isChecking } = useCheckOverdue();
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "gantt">("list");

  const handleCheckOverdue = () => {
    checkOverdue(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Overdue Check Complete",
          description: data.message,
          variant: data.count > 0 ? "destructive" : "default",
        });
      },
      onError: () => {
        toast({
          title: "Check Failed",
          description: "Could not check overdue tasks. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  // Stats
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
  const overdueTasks = tasks?.filter(t => t.isOverdue && t.status !== 'done').length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === 'in-progress').length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        <p className="text-xl font-bold">Error loading tasks. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <CalendarClock className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Project<span className="text-primary">Scheduler</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleCheckOverdue}
              disabled={isChecking}
              className="hidden sm:flex"
            >
              {isChecking ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2 text-destructive" />
              )}
              Check Overdue
            </Button>
            <CreateTaskDialog />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard 
            label="Total Tasks" 
            value={totalTasks} 
            icon={<LayoutList className="w-5 h-5 text-blue-500" />}
            bg="bg-blue-500/10"
          />
          <StatsCard 
            label="In Progress" 
            value={inProgressTasks} 
            icon={<RefreshCw className="w-5 h-5 text-amber-500" />}
            bg="bg-amber-500/10"
          />
          <StatsCard 
            label="Completed" 
            value={completedTasks} 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            bg="bg-emerald-500/10"
          />
          <StatsCard 
            label="Overdue" 
            value={overdueTasks} 
            icon={<AlertCircle className="w-5 h-5 text-red-500" />}
            bg="bg-red-500/10"
            alert={overdueTasks > 0}
          />
        </div>

        {/* View Controls & Content */}
        <div className="space-y-4">
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "gantt")} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold text-foreground">Project Timeline</h2>
                <p className="text-muted-foreground">Manage your tasks and track progress.</p>
              </div>
              <TabsList className="grid w-full sm:w-[300px] grid-cols-2">
                <TabsTrigger value="list">
                  <LayoutList className="w-4 h-4 mr-2" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="gantt">
                  <BarChart className="w-4 h-4 mr-2" />
                  Gantt View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <TaskListView tasks={tasks || []} />
            </TabsContent>
            
            <TabsContent value="gantt" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <GanttChartView tasks={tasks || []} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ label, value, icon, bg, alert }: { label: string, value: number, icon: React.ReactNode, bg: string, alert?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${alert ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20' : 'border-border bg-card'} shadow-sm flex flex-col items-start gap-4 transition-all hover:shadow-md`}>
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold font-display ${alert ? 'text-red-600' : 'text-foreground'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
