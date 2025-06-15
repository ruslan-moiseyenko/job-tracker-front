import { useEffect, useState } from 'react';

import type { DragEndEvent } from '@dnd-kit/core';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import type { ApplicationStageType } from '@/dashboard/dashboard.types';
import { useCreateStage } from '@/dashboard/hooks/useCreateStage';
import { useDeleteStage } from '@/dashboard/hooks/useDeleteStage';
import { useGetStages } from '@/dashboard/hooks/useGetStages';
import { useReorderStage } from '@/dashboard/hooks/useReorderStage';
import { useUpdateStage } from '@/dashboard/hooks/useUpdateStage';
import { logger } from '@/lib/logger';

export function useStageManagement() {
  const { stages: apiStages, loading: _stagesLoading } = useGetStages();
  const {
    deleteStage: deleteStageAPI,
    loading: deleteLoading,
    error: deleteError
  } = useDeleteStage();
  const {
    createStage: createStageAPI,
    loading: createLoading,
    error: createError
  } = useCreateStage();
  const {
    updateStage: updateStageAPI,
    loading: updateLoading,
    error: updateError
  } = useUpdateStage();
  const {
    reorderStage: reorderStageAPI,
    loading: reorderLoading,
    error: reorderError
  } = useReorderStage();

  const [stages, setStages] = useState<ApplicationStageType[]>([]);

  // Synchronize with API
  useEffect(() => {
    if (apiStages.length > 0) {
      setStages([...apiStages].sort((a, b) => a.order - b.order));
    }
  }, [apiStages]);

  const [editingStage, setEditingStage] = useState<ApplicationStageType | null>(
    null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [deletingStageId, setDeletingStageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      const draggedStageId = active.id as string;
      const targetStageId = over.id as string;

      // Find the indices to determine if we're moving before or after
      const draggedIndex = stages.findIndex(
        (stage) => stage.id === draggedStageId
      );
      const targetIndex = stages.findIndex(
        (stage) => stage.id === targetStageId
      );

      // Determine position based on drag direction
      const position =
        draggedIndex < targetIndex
          ? `after:${targetStageId}`
          : `before:${targetStageId}`;

      // Optimistically update local state for immediate feedback
      setStages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index + 1 }));
      });

      // Call the API to persist the change
      const result = await reorderStageAPI({
        stageId: draggedStageId,
        position
      });

      if (!result) {
        // If API call failed, revert the optimistic update
        setStages([...apiStages].sort((a, b) => a.order - b.order));
        logger.error('Failed to reorder stage, reverting changes');
      }
    }
  };

  const handleAddStage = async (
    stageData: Omit<ApplicationStageType, 'id' | 'order'>
  ) => {
    const newStage = await createStageAPI({
      name: stageData.name,
      description: stageData.description,
      color: stageData.color
      // insertAfter: null - to add stage to the end
    });

    if (newStage) {
      setIsAddingNew(false);
      // The Apollo cache will be updated automatically by the mutation
    }
  };

  const handleEditStage = (stage: ApplicationStageType) => {
    setEditingStage(stage);
  };

  const handleSaveEdit = async (
    stageData: Omit<ApplicationStageType, 'id' | 'order'>
  ) => {
    if (editingStage) {
      const updatedStage = await updateStageAPI({
        id: editingStage.id,
        name: stageData.name,
        description: stageData.description,
        color: stageData.color
      });

      if (updatedStage) {
        setEditingStage(null);
        // The Apollo cache will be updated automatically by the mutation
      }
    }
  };

  const handleDeleteStage = async (id: string) => {
    setDeletingStageId(id);
    try {
      const success = await deleteStageAPI(id);
      if (!success) {
        logger.error('Failed to delete stage');
        // The error will be available in deleteError state
      }
    } catch (error) {
      logger.error('Error deleting stage:', error);
    } finally {
      setDeletingStageId(null);
    }
  };

  const handleCancel = () => {
    setEditingStage(null);
    setIsAddingNew(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Clear all form states when dialog is closed
    if (!open) {
      setEditingStage(null);
      setIsAddingNew(false);
      setDeletingStageId(null);
    }
  };

  return {
    stages,
    editingStage,
    isAddingNew,
    isOpen,
    sensors,
    deleteLoading,
    deleteError,
    createLoading,
    createError,
    updateLoading,
    updateError,
    reorderLoading,
    reorderError,
    deletingStageId,
    handleDialogOpenChange,
    setIsAddingNew,
    handleDragEnd,
    handleAddStage,
    handleEditStage,
    handleSaveEdit,
    handleDeleteStage,
    handleCancel
  };
}
