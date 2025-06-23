import React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import type { ApplicationType } from '../dashboard.types';
import { useGetStages } from '../hooks/useGetStages';
import { useUpdateJobApplication } from '../hooks/useUpdateJobApplication';

interface CurrentStageSelectCellProps {
  application: ApplicationType;
}

export const CurrentStageSelectCell: React.FC<CurrentStageSelectCellProps> = ({
  application
}) => {
  const { stages } = useGetStages();
  const { updateJobApplication, loading } = useUpdateJobApplication();
  const [selectedStageId, setSelectedStageId] = React.useState(
    application.currentStage?.id
  );

  React.useEffect(() => {
    setSelectedStageId(application.currentStage?.id);
  }, [application.currentStage?.id]);

  const handleChange = async (stageId: string) => {
    setSelectedStageId(stageId); // Optimistic UI update
    await updateJobApplication({
      variables: {
        id: application.id,
        currentStageId: stageId
      }
    });
    // No refetch, rely on cache update
  };

  return (
    <Select
      value={selectedStageId ?? ''}
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger
        className="capitalize w-full [&_svg]:!text-foreground [&_svg]:!opacity-100"
        style={(() => {
          const selected = stages.find((s) => s.id === selectedStageId);
          return selected && selected.color
            ? { backgroundColor: selected.color }
            : undefined;
        })()}
      >
        <SelectValue placeholder="Select stage" />
      </SelectTrigger>
      <SelectContent>
        {stages.map((stage) => (
          <SelectItem
            key={stage.id}
            value={stage.id}
            className="capitalize"
            style={
              selectedStageId === stage.id && stage.color
                ? { backgroundColor: stage.color }
                : undefined
            }
          >
            {stage.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
