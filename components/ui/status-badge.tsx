import { Badge } from '@/components/ui/badge';
import { HStack } from '@/components/ui/stack';
import { TicketPriority, TicketStatus } from '@/types/models';
import React from 'react';

export function StatusBadge({ kind, value }: { kind: 'equipment' | 'booking' | 'ticket' | 'priority'; value: string }) {
  const v = String(value).toUpperCase();
  if (kind === 'equipment') {
    // AVAILABLE | IN_USE | UNDER_MAINTENANCE
    if (v === 'AVAILABLE') return <Badge label="Available" tone="success" />;
    if (v === 'IN_USE') return <Badge label="In use" tone="info" />;
    if (v === 'UNDER_MAINTENANCE') return <Badge label="Maintenance" tone="danger" />;
  }
  if (kind === 'booking') {
    // CONFIRMED | CANCELLED | COMPLETED
    if (v === 'CONFIRMED') return <Badge label="Confirmed" tone="info" />;
    if (v === 'COMPLETED') return <Badge label="Completed" tone="success" />;
    if (v === 'CANCELLED') return <Badge label="Cancelled" tone="danger" />;
  }
  if (kind === 'ticket') {
    // OPEN | IN_PROGRESS | RESOLVED
    if (v === 'OPEN') return <Badge label="Open" tone="warning" />;
    if (v === 'IN_PROGRESS') return <Badge label="In progress" tone="info" />;
    if (v === 'RESOLVED') return <Badge label="Resolved" tone="success" />;
  }
  if (kind === 'priority') {
    // LOW | MEDIUM | HIGH
    if (v === 'HIGH') return <Badge label="High" tone="danger" />;
    if (v === 'MEDIUM') return <Badge label="Medium" tone="warning" />;
    if (v === 'LOW') return <Badge label="Low" tone="muted" />;
  }
  return <Badge label={value} tone="muted" />;
}

export function TicketBadges({ status, priority }: { status: TicketStatus; priority: TicketPriority }) {
  return (
    <HStack gap={8}>
      <StatusBadge kind="ticket" value={status} />
      <StatusBadge kind="priority" value={priority} />
    </HStack>
  );
}
