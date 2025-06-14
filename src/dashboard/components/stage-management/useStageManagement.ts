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
import { useGetStages } from '@/dashboard/hooks/useGetStages';

export function useStageManagement() {
  const { stages: apiStages, loading: _stagesLoading } = useGetStages();

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setStages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order property
        return newItems.map((item, index) => ({ ...item, order: index + 1 }));
      });
    }
  };

  const handleAddStage = (
    stageData: Omit<ApplicationStageType, 'id' | 'order'>
  ) => {
    const newStage: ApplicationStageType = {
      id: Date.now().toString(),
      ...stageData,
      order: stages.length + 1
    };
    setStages([...stages, newStage]);
    setIsAddingNew(false);
  };

  const handleEditStage = (stage: ApplicationStageType) => {
    setEditingStage(stage);
  };

  const handleSaveEdit = (
    stageData: Omit<ApplicationStageType, 'id' | 'order'>
  ) => {
    if (editingStage) {
      setStages(
        stages.map((stage) =>
          stage.id === editingStage.id ? { ...stage, ...stageData } : stage
        )
      );
      setEditingStage(null);
    }
  };

  const handleDeleteStage = (id: string) => {
    setStages(stages.filter((stage) => stage.id !== id));
  };

  const handleCancel = () => {
    setEditingStage(null);
    setIsAddingNew(false);
  };

  return {
    stages,
    editingStage,
    isAddingNew,
    isOpen,
    sensors,
    setIsOpen,
    setIsAddingNew,
    handleDragEnd,
    handleAddStage,
    handleEditStage,
    handleSaveEdit,
    handleDeleteStage,
    handleCancel
  };
}
