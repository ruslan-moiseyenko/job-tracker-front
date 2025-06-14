import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import type { ApplicationStageType } from '@/dashboard/dashboard.types';

import { SortableStageItem } from './SortableStageItem';

interface StageListProps {
  stages: ApplicationStageType[];
  sensors: any;
  isEditingDisabled: boolean;
  onEdit: (stage: ApplicationStageType) => void;
  onDelete: (id: string) => void;
  onDragEnd: (event: any) => void;
}

export function StageList({
  stages,
  sensors,
  isEditingDisabled,
  onEdit,
  onDelete,
  onDragEnd
}: StageListProps) {
  return (
    <div className="space-y-3">
      {stages.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Current Stages (drag to reorder)
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={stages} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {stages.map((stage) => (
              <SortableStageItem
                key={stage.id}
                stage={stage}
                onEdit={onEdit}
                onDelete={onDelete}
                isEditingDisabled={isEditingDisabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
