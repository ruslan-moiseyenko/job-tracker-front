import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Edit2, GripVertical, Trash2 } from 'lucide-react';

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
import type { ApplicationStageType } from '@/dashboard/dashboard.types';
import { cn } from '@/lib/utils';

interface StageItemProps {
  stage: ApplicationStageType;
  onEdit: (stage: ApplicationStageType) => void;
  onDelete: (id: string) => void;
  isEditingDisabled: boolean;
}

export function SortableStageItem({
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
