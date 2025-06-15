import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
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
  deleteLoading: boolean;
  reorderLoading?: boolean;
  deletingStageId: string | null;
  onEdit: (stage: ApplicationStageType) => void;
  onDelete: (id: string) => void;
  onDragEnd: (event: any) => void;
}

export function StageList({
  stages,
  sensors,
  isEditingDisabled,
  deleteLoading,
  reorderLoading = false,
  deletingStageId,
  onEdit,
  onDelete,
  onDragEnd
}: StageListProps) {
  const isDragDisabled = isEditingDisabled || reorderLoading;
  return (
    <div className="space-y-3">
      {stages.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Current Stages (drag to reorder)
          {reorderLoading && ' - Reordering...'}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
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
                isEditingDisabled={isDragDisabled || deleteLoading}
                isDeleting={deletingStageId === stage.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
