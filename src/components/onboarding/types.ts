export type DashboardEmptyState =
  | 'NO_INTEGRATIONS'               // State 1: No integrations connected
  | 'INTEGRATION_CONNECTED_NO_EVENTS' // State 2: Integration connected, but no events received
  | 'EVENTS_NO_ACTIVE_INCIDENTS'     // State 3: Events received, but no active incidents
  | 'ACTIVE_DATA';                  // State 4: Active incidents present

export interface ChecklistStep {
  id: string;
  number: number;
  title: string;
  description: string;
  isComplete: boolean;
  actionText: string;
  actionType: 'connect' | 'status' | 'test' | 'view_intelligence';
}
