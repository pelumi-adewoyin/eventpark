import { useAuth } from '../../context/AuthContext';
import DashboardEvents from './DashboardEvents';
import CorporateEvents from './corporate/CorporateEvents';

/**
 * Workspace-aware events list: renders corporate or personal events page.
 */
export default function WorkspaceEvents() {
  const { activeWorkspace } = useAuth();
  if (activeWorkspace?.type === 'corporate') return <CorporateEvents />;
  return <DashboardEvents />;
}
