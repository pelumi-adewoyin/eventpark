import { useAuth } from '../../context/AuthContext';
import DashboardBudget from './DashboardBudget';
import CorporateBudget from './corporate/CorporateBudget';

export default function WorkspaceBudget() {
  const { activeWorkspace } = useAuth();
  if (activeWorkspace?.type === 'corporate') return <CorporateBudget />;
  return <DashboardBudget />;
}
