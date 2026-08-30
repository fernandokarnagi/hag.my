import { usePhases, useAddPhase, useUpdatePhase, useDeletePhase } from '@/hooks/useOptions';
import { OptionPage } from './OptionPage';

export function Phases() {
  const { data: items = [], isLoading } = usePhases();
  const add = useAddPhase();
  const update = useUpdatePhase();
  const remove = useDeletePhase();

  return (
    <OptionPage
      title="Phases"
      subtitle="configured"
      items={items}
      isLoading={isLoading}
      onAdd={(data) => add.mutateAsync(data)}
      onUpdate={(id, data) => update.mutateAsync({ id, data })}
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}
