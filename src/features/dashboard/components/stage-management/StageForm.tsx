import React, { useMemo, useState } from 'react';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PREDEFINED_STAGE_COLORS } from '@/features/dashboard/dashboard.constants';
import type { ApplicationStageType } from '@/features/dashboard/dashboard.types';
import { cn } from '@/lib/utils';

interface StageFormProps {
  stage?: ApplicationStageType;
  onSave: (
    stage: Omit<ApplicationStageType, 'id' | 'order'>,
    changes?: {
      hasChanges: boolean;
      changedFields: Partial<Omit<ApplicationStageType, 'id' | 'order'>>;
    }
  ) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function StageForm({
  stage,
  onSave,
  onCancel,
  loading = false
}: StageFormProps) {
  const [name, setName] = useState(stage?.name || '');
  const [description, setDescription] = useState(stage?.description || '');
  const [color, setColor] = useState(stage?.color || '');

  // Track changes for editing mode
  const hasChanges = useMemo(() => {
    if (!stage) return true; // For new stages, always consider as having changes

    const currentData = {
      name: name.trim(),
      description: description.trim() || '',
      color: color.trim() || undefined
    };

    const originalData = {
      name: stage.name,
      description: stage.description || '',
      color: stage.color || undefined
    };

    return (
      currentData.name !== originalData.name ||
      currentData.description !== originalData.description ||
      currentData.color !== originalData.color
    );
  }, [stage, name, description, color]);

  // Calculate only the changed fields
  const changedFields = useMemo(() => {
    if (!stage) return {}; // For new stages, we'll send all data

    const changes: Partial<Omit<ApplicationStageType, 'id' | 'order'>> = {};

    const currentName = name.trim();
    const currentDescription = description.trim() || '';
    const currentColor = color.trim() || undefined;

    if (currentName !== stage.name) {
      changes.name = currentName;
    }

    if (currentDescription !== (stage.description || '')) {
      changes.description = currentDescription;
    }

    if (currentColor !== (stage.color || undefined)) {
      changes.color = currentColor;
    }

    return changes;
  }, [stage, name, description, color]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow typing # and hex characters, convert to uppercase for consistency
    if (value === '' || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      setColor(value.toUpperCase());
    }
  };

  const handleHexInputBlur = () => {
    // If empty, keep it empty (user wants no color)
    if (!color.trim()) {
      setColor('');
      return;
    }

    let newColor = color;

    // Add # if missing
    if (newColor && !newColor.startsWith('#')) {
      newColor = '#' + newColor;
    }

    // Pad with zeros if incomplete (e.g., #F -> #F00000, #FF -> #FF0000)
    if (newColor && newColor.length > 1 && newColor.length < 7) {
      const hex = newColor.slice(1);
      if (hex.length <= 6) {
        newColor = '#' + hex.padEnd(6, '0');
      }
    }

    // If invalid hex, clear the color (user can choose to set a valid one or leave empty)
    if (newColor && !/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      setColor('');
      return;
    }

    setColor(newColor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const stageData = {
        name: name.trim(),
        description: description.trim() || '',
        color: color.trim() || undefined // Send undefined if no color
      };

      // For editing existing stages, pass change tracking info
      // For new stages, don't pass the second parameter
      if (stage) {
        onSave(stageData, { hasChanges, changedFields });
      } else {
        onSave(stageData);
      }
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
        <div className="space-y-3">
          {/* Color picker and hex input row */}
          <div className="flex items-center justify-end gap-2">
            {color && /^#[0-9A-Fa-f]{6}$/.test(color) && (
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="size-9 rounded border cursor-pointer"
              />
            )}
            <div className="relative">
              <Input
                value={color}
                onChange={handleHexInputChange}
                onBlur={handleHexInputBlur}
                placeholder="No color"
                className="font-mono text-sm w-28 pr-8"
                maxLength={7}
              />
              {color && (
                <button
                  type="button"
                  onClick={() => setColor('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title="Remove color"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Predefined color swatches */}
          <div className="flex justify-end gap-1">
            {PREDEFINED_STAGE_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={cn(
                  'w-6 h-6 rounded border-2 cursor-pointer transition-all hover:scale-110',
                  color === presetColor ? 'border-ring' : 'border-border'
                )}
                style={{ backgroundColor: presetColor }}
                title={presetColor}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          size="sm"
          disabled={loading || (stage && !hasChanges)}
        >
          {stage ? 'Save Changes' : 'Add Stage'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
