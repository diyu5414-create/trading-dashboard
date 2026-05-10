import { ConnectionStatus } from '../types';

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: 'Connecting…',
  connected: 'Live',
  disconnected: 'Reconnecting…',
  error: 'Disconnected',
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span className={`connection-badge ${status}`}>
      <span className="badge-dot" />
      {STATUS_LABEL[status]}
    </span>
  );
}
