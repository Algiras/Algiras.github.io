import { Stack, Group, Title, Button, TextInput, Select, Table, ActionIcon, Badge, Tooltip, Modal } from '@mantine/core';
import React, { useState } from 'react';
import { Platform, InvestmentType } from './types';
import { Plus, Trash2 } from 'lucide-react';
import { notifications } from '@mantine/notifications';

interface ConfigPanelProps {
  platforms: Platform[];
  onChangePlatforms: (platforms: Platform[]) => void;
  usedPlatformIds?: string[];
}

const ALL_TYPES: InvestmentType[] = ['P2P', 'Stock', 'Fund', 'Crypto', 'RealEstate', 'Alternative', 'CFD', 'Lending'];

const ConfigPanel: React.FC<ConfigPanelProps> = ({ platforms, onChangePlatforms, usedPlatformIds = [] }) => {
  const [draft, setDraft] = useState<Platform[]>(platforms);
  React.useEffect(() => setDraft(platforms), [platforms]);

  const [addOpen, setAddOpen] = useState(false);
  const [newPlatform, setNewPlatform] = useState<Platform>({
    id: '',
    name: '',
    type: ['P2P'],
    country: 'LT',
    fees: {},
    status: 'Active',
    website: ''
  } as Platform);

  const openAdd = () => {
    setNewPlatform({ id: `custom_${Date.now()}`, name: 'New Platform', type: ['P2P'], country: 'LT', fees: {}, status: 'Active', website: '' } as Platform);
    setAddOpen(true);
  };

  const saveNewPlatform = () => {
    if (!newPlatform.id || !newPlatform.name) {
      notifications.show({ title: 'Missing data', message: 'ID and Name are required', color: 'yellow' });
      return;
    }
    if (draft.some(p => p.id === newPlatform.id)) {
      notifications.show({ title: 'Duplicate ID', message: 'Platform ID already exists', color: 'red' });
      return;
    }
    setDraft(prev => [...prev, newPlatform]);
    setAddOpen(false);
  };

  const updatePlatform = (idx: number, patch: Partial<Platform>) => setDraft(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  const removePlatform = (idx: number) => {
    const p = draft[idx];
    if (p && usedPlatformIds.includes(p.id)) {
      notifications.show({ title: 'Cannot remove', message: 'This platform is used by existing investments', color: 'yellow' });
      return;
    }
    setDraft(prev => prev.filter((_, i) => i !== idx));
  };

  const save = () => {
    onChangePlatforms(draft);
    notifications.show({ title: 'Saved', message: 'Configuration updated', color: 'green' });
  };

  const reset = () => setDraft(platforms);

  return (
    <Stack gap="xl" pt="md">
      <Group justify="space-between">
        <Title order={3}>Configuration</Title>
        <Group>
          <Button size="xs" variant="light" onClick={reset}>Reset</Button>
          <Button size="xs" onClick={save}>Save</Button>
        </Group>
      </Group>

      <Group justify="space-between">
        <Title order={5}>Platforms</Title>
        <Button size="xs" leftSection={<Plus size={14} />} onClick={openAdd}>Add Platform</Button>
      </Group>

      <Table withColumnBorders striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Country</Table.Th>
            <Table.Th>Types</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Website</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {draft.map((p, idx) => {
            const inUse = usedPlatformIds.includes(p.id);
            return (
              <Table.Tr key={p.id}>
                <Table.Td><Badge variant="light">{p.id}</Badge></Table.Td>
                <Table.Td><TextInput value={p.name} onChange={(e) => updatePlatform(idx, { name: e.currentTarget.value })} /></Table.Td>
                <Table.Td><TextInput value={p.country || ''} onChange={(e) => updatePlatform(idx, { country: e.currentTarget.value })} w={80} /></Table.Td>
                <Table.Td>
                  <Select
                    data={ALL_TYPES.map(t => ({ value: t, label: t }))}
                    value={p.type[0]}
                    onChange={(v) => updatePlatform(idx, { type: [v as InvestmentType] })}
                  />
                </Table.Td>
                <Table.Td>
                  <Select
                    data={[{ value: 'Active', label: 'Active' }, { value: 'Closed', label: 'Closed' }, { value: 'Avoiding', label: 'Avoiding' }]}
                    value={p.status}
                    onChange={(v) => updatePlatform(idx, { status: v as Platform['status'] })}
                  />
                </Table.Td>
                <Table.Td><TextInput value={p.website || ''} onChange={(e) => updatePlatform(idx, { website: e.currentTarget.value })} /></Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {inUse && <Badge color="yellow" variant="light">In use</Badge>}
                    <Tooltip label={inUse ? 'This platform is in use' : 'Remove platform'}>
                      <ActionIcon color="red" variant="light" onClick={() => removePlatform(idx)} disabled={inUse}>
                        <Trash2 size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      {/* Add Platform Modal */}
      <Modal 
        opened={addOpen} 
        onClose={() => setAddOpen(false)} 
        title={<Title order={4}>Add Platform</Title>} 
        centered
        overlayProps={{ opacity: 0.4 }}
      >
        <Stack>
          <TextInput label="ID" value={newPlatform.id} onChange={(e) => setNewPlatform({ ...newPlatform, id: e.currentTarget.value })} required />
          <TextInput label="Name" value={newPlatform.name} onChange={(e) => setNewPlatform({ ...newPlatform, name: e.currentTarget.value })} required />
          <Group grow>
            <TextInput label="Country" value={newPlatform.country || ''} onChange={(e) => setNewPlatform({ ...newPlatform, country: e.currentTarget.value })} />
            <Select label="Type" data={ALL_TYPES.map(t => ({ value: t, label: t }))} value={newPlatform.type[0]} onChange={(v) => setNewPlatform({ ...newPlatform, type: [v as InvestmentType] })} />
          </Group>
          <Select label="Status" data={[{ value: 'Active', label: 'Active' }, { value: 'Closed', label: 'Closed' }, { value: 'Avoiding', label: 'Avoiding' }]} value={newPlatform.status} onChange={(v) => setNewPlatform({ ...newPlatform, status: v as Platform['status'] })} />
          <TextInput label="Website" value={newPlatform.website || ''} onChange={(e) => setNewPlatform({ ...newPlatform, website: e.currentTarget.value })} />
          <Group justify="right">
            <Button variant="light" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={saveNewPlatform}>Add</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default ConfigPanel;

