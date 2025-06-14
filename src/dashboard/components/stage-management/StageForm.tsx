import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PREDEFINED_STAGE_COLORS } from '@/dashboard/dashboard.constants';
import type { ApplicationStageType } from '@/dashboard/dashboard.types';
import { cn } from '@/lib/utils';

interface StageFormProps {
  stage?: ApplicationStageType;
  onSave: (stage: Omit<ApplicationStageType, 'id' | 'order'>) => void;
  onCancel: () => void;
}

export function StageForm({ stage, onSave, onCancel }: StageFormProps) {
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
