import { usePreferredSystems, useAddPreferredSystem, useUpdatePreferredSystem, useDeletePreferredSystem } from '@/hooks/useOptions';
import { OptionPage } from './OptionPage';

export function PreferredSystems() {
  const { data: items = [], isLoading } = usePreferredSystems();
  const add = useAddPreferredSystem();
  const update = useUpdatePreferredSystem();
  const remove = useDeletePreferredSystem();

  return (
    <OptionPage
      title="Preferred Systems"
      subtitle="configured"
      items={items}
      isLoading={isLoading}
      onAdd={(data) => add.mutateAsync(data)}
      onUpdate={(id, data) => update.mutateAsync({ id, data })}
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}
