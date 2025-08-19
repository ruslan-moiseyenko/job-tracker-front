import { Switch } from '@/components/ui/switch';

interface CompanyStatusSwitchersProps {
  isBlacklisted: boolean;
  isFavorite: boolean;
  onBlacklistChange: (checked: boolean) => void;
  onFavoriteChange: (checked: boolean) => void;
}

export const CompanyStatusSwitchers = ({
  isBlacklisted,
  isFavorite,
  onBlacklistChange,
  onFavoriteChange
}: CompanyStatusSwitchersProps) => {
  const handleBlacklistToggle = (checked: boolean) => {
    onBlacklistChange(checked);
    // If blacklisted becomes true, favorite should become false
    if (checked && isFavorite) {
      onFavoriteChange(false);
    }
  };

  const handleFavoriteToggle = (checked: boolean) => {
    onFavoriteChange(checked);
    // If favorite becomes true, blacklisted should become false
    if (checked && isBlacklisted) {
      onBlacklistChange(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Company Status</h3>
        <p className="text-xs text-muted-foreground">
          Manage this company&apos;s status and preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Blacklisted</label>
            <p className="text-xs text-muted-foreground">
              Mark this company as blacklisted
            </p>
          </div>
          <Switch
            checked={isBlacklisted}
            onCheckedChange={handleBlacklistToggle}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Favorite</label>
            <p className="text-xs text-muted-foreground">
              Mark this company as a favorite
            </p>
          </div>
          <Switch checked={isFavorite} onCheckedChange={handleFavoriteToggle} />
        </div>
      </div>
    </div>
  );
};
