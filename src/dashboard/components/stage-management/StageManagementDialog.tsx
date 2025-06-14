import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import { StageForm } from './StageForm';
import { StageList } from './StageList';
import { useStageManagement } from './useStageManagement';

export function StageManagementDialog() {
  const {
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
  } = useStageManagement();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Plus className="h-4 w-4 mr-2" />
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
          <StageList
            stages={stages}
            sensors={sensors}
            isEditingDisabled={!!editingStage || isAddingNew}
            onEdit={handleEditStage}
            onDelete={handleDeleteStage}
            onDragEnd={handleDragEnd}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
