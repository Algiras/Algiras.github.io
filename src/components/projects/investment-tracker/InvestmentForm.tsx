import {
  Button, Group, Modal, NumberInput, Select, Stack, TextInput, 
  Textarea, Text, Grid, Badge, Card, Divider, ActionIcon
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Calculator, X, Save } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

import { 
  Investment, 
  InvestmentType, 
  InvestmentStatus, 
  Currency,
  Platform,
  INVESTMENT_CATEGORIES 
} from './types';
import { calculateReturn, calculateAnnualizedReturn, formatCurrency, formatPercentage } from './calculations';

interface InvestmentFormProps {
  investment?: Investment | null;
  opened: boolean;
  onClose: () => void;
  onSave: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  mode: 'add' | 'edit' | 'view';
  platforms: Platform[];
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  investment,
  opened,
  onClose,
  onSave,
  mode,
  platforms
}) => {
  const form = useForm({
    initialValues: {
      type: 'P2P' as InvestmentType,
      platformId: '',
      assetName: '',
      purchaseDate: new Date(),
      purchasePrice: 0,
      currentValue: 0,
      quantity: 1,
      currency: 'EUR' as Currency,
      status: 'Active' as InvestmentStatus,
      notes: '',
      expectedReturn: 10,
      fees: 0,
      dividends: 0,
      tags: '',
    },
    validate: {
      assetName: (value: string) => value.length < 2 ? 'Asset name must be at least 2 characters' : null,
      purchasePrice: (value: number) => value <= 0 ? 'Purchase price must be greater than 0' : null,
      currentValue: (value: number) => value < 0 ? 'Current value cannot be negative' : null,
      quantity: (value: number) => value <= 0 ? 'Quantity must be greater than 0' : null,
      platformId: (value: string) => !value ? 'Please select a platform' : null,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (investment && (mode === 'edit' || mode === 'view')) {
      form.setValues({
        type: investment.type,
        platformId: investment.platform.id,
        assetName: investment.assetName,
        purchaseDate: new Date(investment.purchaseDate),
        purchasePrice: investment.purchasePrice,
        currentValue: investment.currentValue,
        quantity: investment.quantity,
        currency: investment.currency,
        status: investment.status,
        notes: investment.notes || '',
        expectedReturn: investment.expectedReturn,
        fees: investment.fees,
        dividends: investment.dividends,
        tags: investment.tags.join(', '),
      });
    } else if (mode === 'add') {
      form.reset();
    }
  }, [investment, mode, opened]);

  const selectedPlatform = useMemo(() => 
    platforms.find(p => p.id === form.values.platformId),
    [form.values.platformId, platforms]
  );

  const availablePlatforms = useMemo(() => 
    platforms.filter(p => p.type.includes(form.values.type)),
    [form.values.type, platforms]
  );

  // Calculate real-time metrics
  const calculatedReturn = useMemo(() => {
    if (form.values.purchasePrice > 0 && form.values.quantity > 0) {
      const mockInvestment: Investment = {
        ...investment!,
        purchasePrice: form.values.purchasePrice,
        currentValue: form.values.currentValue,
        quantity: form.values.quantity,
        fees: form.values.fees,
        dividends: form.values.dividends,
        purchaseDate: form.values.purchaseDate,
      };
      return {
        totalReturn: calculateReturn(mockInvestment),
        annualizedReturn: calculateAnnualizedReturn(mockInvestment),
      };
    }
    return { totalReturn: 0, annualizedReturn: 0 };
  }, [form.values.purchasePrice, form.values.currentValue, form.values.quantity, form.values.fees, form.values.dividends, form.values.purchaseDate]);

  const handleSubmit = (values: typeof form.values) => {
    const platform = platforms.find(p => p.id === values.platformId);
    if (!platform) {
      notifications.show({
        title: 'Error',
        message: 'Please select a valid platform',
        color: 'red',
      });
      return;
    }

    const investmentData: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'> = {
      type: values.type,
      platform,
      assetName: values.assetName,
      purchaseDate: values.purchaseDate,
      purchasePrice: values.purchasePrice,
      currentValue: values.currentValue,
      quantity: values.quantity,
      currency: values.currency,
      status: values.status,
      notes: values.notes,
      expectedReturn: values.expectedReturn,
      actualReturn: calculatedReturn.totalReturn,
      fees: values.fees,
      dividends: values.dividends,
      tags: values.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0),
    };

    onSave(investmentData);
    
    notifications.show({
      title: 'Success',
      message: `Investment ${mode === 'add' ? 'added' : 'updated'} successfully`,
      color: 'green',
    });

    onClose();
  };

  const isReadonly = mode === 'view';
  const title = mode === 'add' ? 'Add New Investment' : mode === 'edit' ? 'Edit Investment' : 'View Investment';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>{title}</Text>}
      size="lg"
      centered
      overlayProps={{ opacity: 0.4 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Investment Type and Platform */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Investment Type"
                placeholder="Select type"
                data={Object.entries(INVESTMENT_CATEGORIES).map(([key, value]) => ({
                  value: key,
                  label: value.label,
                }))}
                readOnly={isReadonly}
                {...form.getInputProps('type')}
                onChange={(value) => {
                  form.setFieldValue('type', value as InvestmentType);
                  form.setFieldValue('platformId', ''); // Reset platform when type changes
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Platform"
                placeholder="Select platform"
                data={availablePlatforms.map(platform => ({
                  value: platform.id,
                  label: `${platform.name} • ${platform.country} • ${platform.type.join(', ')}`,
                  disabled: platform.status === 'Closed' || platform.status === 'Avoiding',
                }))}
                readOnly={isReadonly}
                {...form.getInputProps('platformId')}
              />
            </Grid.Col>
          </Grid>

          {/* Platform Info */}
          {selectedPlatform && (
            <Card withBorder p="sm" bg="var(--mantine-color-default-hover)">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="sm" fw={500}>{selectedPlatform.name}</Text>
                  <Text size="xs">
                    {selectedPlatform.country} • {selectedPlatform.type.join(', ')}
                  </Text>
                  {selectedPlatform.notes && (
                    <Text size="xs" c="yellow" mt="xs">
                      ⚠️ {selectedPlatform.notes}
                    </Text>
                  )}
                </div>
                <Badge
                  color={selectedPlatform.status === 'Active' ? 'green' : 
                         selectedPlatform.status === 'Avoiding' ? 'red' : 'gray'}
                  variant="light"
                  size="sm"
                >
                  {selectedPlatform.status}
                </Badge>
              </Group>
            </Card>
          )}

          {/* Asset Details */}
          <TextInput
            label="Asset Name"
            placeholder="e.g., Apple Inc., Business Loan Portfolio"
            readOnly={isReadonly}
            {...form.getInputProps('assetName')}
          />

          {/* Financial Details */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Purchase Date"
                type="date"
                readOnly={isReadonly}
                {...form.getInputProps('purchaseDate')}
                value={form.values.purchaseDate instanceof Date 
                  ? form.values.purchaseDate.toISOString().split('T')[0] 
                  : form.values.purchaseDate}
                onChange={(event) => form.setFieldValue('purchaseDate', new Date(event.currentTarget.value))}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Currency"
                data={[
                  { value: 'EUR', label: '🇪🇺 EUR' },
                  { value: 'USD', label: '🇺🇸 USD' },
                  { value: 'GBP', label: '🇬🇧 GBP' },
                  { value: 'BTC', label: '₿ BTC' },
                  { value: 'ETH', label: 'Ξ ETH' },
                ]}
                readOnly={isReadonly}
                {...form.getInputProps('currency')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Purchase Price"
                placeholder="0.00"
                min={0}
                step={0.01}
                decimalScale={2}
                readOnly={isReadonly}
                {...form.getInputProps('purchasePrice')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Quantity"
                placeholder="1"
                min={0}
                step={0.01}
                decimalScale={4}
                readOnly={isReadonly}
                {...form.getInputProps('quantity')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Current Value"
                placeholder="0.00"
                min={0}
                step={0.01}
                decimalScale={2}
                readOnly={isReadonly}
                {...form.getInputProps('currentValue')}
              />
            </Grid.Col>
          </Grid>

          {/* Additional Financial Details */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Fees"
                placeholder="0.00"
                min={0}
                step={0.01}
                decimalScale={2}
                readOnly={isReadonly}
                {...form.getInputProps('fees')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Dividends"
                placeholder="0.00"
                min={0}
                step={0.01}
                decimalScale={2}
                readOnly={isReadonly}
                {...form.getInputProps('dividends')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Expected Return %"
                placeholder="10"
                min={-100}
                max={1000}
                step={0.1}
                decimalScale={1}
                readOnly={isReadonly}
                {...form.getInputProps('expectedReturn')}
              />
            </Grid.Col>
          </Grid>

          {/* Calculated Metrics */}
          {(form.values.purchasePrice > 0 && form.values.currentValue > 0) && (
            <Card withBorder p="sm" bg="var(--mantine-color-default-hover)">
              <Group justify="space-between">
                <div>
                  <Text size="sm" fw={600} className="animate-gradient-text">📊 Calculated Returns</Text>
                  <Group gap="lg" mt="xs">
                    <div>
                      <Text size="xs" c="dimmed">Total Return</Text>
                      <Text size="sm" fw={500} c={calculatedReturn.totalReturn >= 0 ? 'green' : 'red'}>
                        {formatPercentage(calculatedReturn.totalReturn)}
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">Annualized</Text>
                      <Text size="sm" fw={500} c={calculatedReturn.annualizedReturn >= 0 ? 'green' : 'red'}>
                        {formatPercentage(calculatedReturn.annualizedReturn)}
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">Total Investment</Text>
                      <Text size="sm" fw={500}>
                        {formatCurrency(form.values.purchasePrice * form.values.quantity + form.values.fees)}
                      </Text>
                    </div>
                  </Group>
                </div>
                <ActionIcon variant="light" color="blue">
                  <Calculator size={16} />
                </ActionIcon>
              </Group>
            </Card>
          )}

          {/* Status and Tags */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Status"
                data={[
                  { value: 'Active', label: '🟢 Active' },
                  { value: 'Sold', label: '💰 Sold' },
                  { value: 'Closed', label: '🔒 Closed' },
                  { value: 'Paused', label: '⏸️ Paused' },
                ]}
                readOnly={isReadonly}
                {...form.getInputProps('status')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Tags"
                placeholder="e.g., high-risk, long-term, dividend"
                description="Comma-separated tags"
                readOnly={isReadonly}
                {...form.getInputProps('tags')}
              />
            </Grid.Col>
          </Grid>

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Additional notes about this investment..."
            minRows={3}
            readOnly={isReadonly}
            {...form.getInputProps('notes')}
          />

          {/* Action Buttons */}
          <Divider />
          <Group justify="space-between">
            <Button variant="light" onClick={onClose} leftSection={<X size={16} />}>
              {isReadonly ? 'Close' : 'Cancel'}
            </Button>
            
            {!isReadonly && (
              <Button type="submit" leftSection={<Save size={16} />}>
                {mode === 'add' ? 'Add Investment' : 'Update Investment'}
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default InvestmentForm;