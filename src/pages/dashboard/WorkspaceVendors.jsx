import { useAuth } from '../../context/AuthContext';
import DashboardVendors from './DashboardVendors';
import CorporateVendors from './corporate/CorporateVendors';

export default function WorkspaceVendors() {
  const { activeWorkspace } = useAuth();
  if (activeWorkspace?.type === 'corporate') return <CorporateVendors />;
  return <DashboardVendors />;
}
