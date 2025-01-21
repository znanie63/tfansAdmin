import { useState, useMemo } from 'react';
import { TaskCompletionStats } from '@/lib/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskTypeFilter } from './task-type-filter';
import { TaskTypeLabels } from './task-type-labels';
import { TaskChart } from './task-chart';

interface TaskStatsChartProps {
  data: TaskCompletionStats[];
}

export function TaskStatsChart({ data }: TaskStatsChartProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    if (selectedTypes.length === 0) return data;
    return data.filter(task => selectedTypes.includes(task.taskType));
  }, [data, selectedTypes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion</CardTitle>
        <TaskTypeFilter
          data={data}
          selectedTypes={selectedTypes}
          onSelectedTypesChange={setSelectedTypes}
        />
        <TaskTypeLabels data={filteredData} />
      </CardHeader>
      <CardContent>
        <TaskChart data={filteredData} />
      </CardContent>
    </Card>
  );
}