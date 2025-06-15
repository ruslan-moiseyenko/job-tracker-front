import React, { useEffect, useState } from 'react';

import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Edit2, GripVertical, Plus, Settings, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PREDEFINED_STAGE_COLORS } from '@/dashboard/dashboard.constants';
import type { ApplicationStageType } from '@/dashboard/dashboard.types';
import { useGetStages } from '@/dashboard/hooks/useGetStages';
import { cn } from '@/lib/utils';

type Stage = ApplicationStageType;

interface StageItemProps {
  stage: Stage;
  onEdit: (stage: Stage) => void;
  onDelete: (id: string) => void;
  isEditingDisabled: boolean;
}

function SortableStageItem({
  stage,
  onEdit,
  onDelete,
  isEditingDisabled
}: StageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: stage.id });

  const combinedStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(stage.color && {
      borderLeftColor: stage.color,
      boxShadow: `inset 3px 0 0 ${stage.color}`
    })
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className={cn(
        'flex items-center gap-3 p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow',
        isDragging && 'opacity-50',
        stage.color && 'border-l-4'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'cursor-grab hover:cursor-grabbing flex-shrink-0',
          isEditingDisabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {stage.color && (
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: stage.color }}
            />
          )}
          <h4 className="font-medium text-sm">{stage.name}</h4>
        </div>
        {stage.description && stage.description.trim() && (
          <p className="text-xs text-muted-foreground mt-1">
            {stage.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(stage)}
          className={cn(
            'h-8 w-8 p-0',
            isEditingDisabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={isEditingDisabled}
        >
          <Edit2 className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0 text-destructive hover:text-destructive',
                isEditingDisabled && 'opacity-50 cursor-not-allowed'
              )}
              disabled={isEditingDisabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Stage</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the &ldquo;{stage.name}&rdquo;
                stage? This action cannot be undone and may affect existing job
                applications.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(stage.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Stage
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

interface StageFormProps {
  stage?: Stage;
  onSave: (stage: Omit<Stage, 'id' | 'order'>) => void;
  onCancel: () => void;
}

function StageForm({ stage, onSave, onCancel }: StageFormProps) {
  const [name, setName] = useState(stage?.name || '');
  const [description, setDescription] = useState(stage?.description || '');
  const [color, setColor] = useState(stage?.color || '#6366f1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        name: name.trim(),
        description: description.trim() || '',
        color
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stage-name">Stage Name *</Label>
        <Input
          id="stage-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Phone Screen"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stage-description">Description</Label>
        <Textarea
          id="stage-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., HR phone screening"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded border cursor-pointer"
          />
          <div className="flex gap-1">
            {PREDEFINED_STAGE_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={cn(
                  'w-6 h-6 rounded border-2 cursor-pointer',
                  color === presetColor ? 'border-ring' : 'border-border'
                )}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm">
          {stage ? 'Save Changes' : 'Add Stage'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function StageManagementDialog() {
  const { stages: apiStages, loading: _stagesLoading } = useGetStages();

  const [stages, setStages] = useState<Stage[]>([]);

  // Synchronies with API
  useEffect(() => {
    if (apiStages.length > 0) {
      setStages([...apiStages].sort((a, b) => a.order - b.order));
    }
  }, [apiStages]);

  const [editingStage, setEditingStage] = useState<Stage | null>(null);
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

  const handleAddStage = (stageData: Omit<Stage, 'id' | 'order'>) => {
    const newStage: Stage = {
      id: Date.now().toString(),
      ...stageData,
      order: stages.length + 1
    };
    setStages([...stages, newStage]);
    setIsAddingNew(false);
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
  };

  const handleSaveEdit = (stageData: Omit<Stage, 'id' | 'order'>) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Settings className="h-4 w-4 mr-2" />
          Manage Stages
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Application Stages</DialogTitle>
          <DialogDescription>
            Add, edit, or reorder your application stages. Drag and drop to
            change the order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new stage button */}
          {!isAddingNew && !editingStage && (
            <Button
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="w-full border-2 border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Stage
            </Button>
          )}

          {/* Add new stage form */}
          {isAddingNew && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3">Add New Stage</h4>
              <StageForm onSave={handleAddStage} onCancel={handleCancel} />
            </div>
          )}

          {/* Edit stage form */}
          {editingStage && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3">Edit Stage</h4>
              <StageForm
                stage={editingStage}
                onSave={handleSaveEdit}
                onCancel={handleCancel}
              />
            </div>
          )}

          {/* Existing stages with drag & drop */}
          <div className="space-y-3">
            {stages.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Current Stages (drag to reorder)
              </div>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stages}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {stages.map((stage) => (
                    <SortableStageItem
                      key={stage.id}
                      stage={stage}
                      onEdit={handleEditStage}
                      onDelete={handleDeleteStage}
                      isEditingDisabled={!!editingStage || isAddingNew}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
