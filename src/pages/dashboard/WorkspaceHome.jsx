import { useAuth } from '../../context/AuthContext';
import DashboardHome from './DashboardHome';
import CorporateHome from './corporate/CorporateHome';
import VendorHome from './vendor/VendorHome';

/**
 * Workspace-aware home: renders the correct dashboard based on active workspace type.
 * Planner users fall through to personal for now (planner dashboard is Phase 6).
 */
export default function WorkspaceHome() {
  const { activeWorkspace } = useAuth();
  if (activeWorkspace?.type === 'corporate') return <CorporateHome />;
  if (activeWorkspace?.type === 'vendor') return <VendorHome />;
  return <DashboardHome />;
}
