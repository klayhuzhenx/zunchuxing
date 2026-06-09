import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import EnterpriseLayout from './layouts/EnterpriseLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import OrderList from './pages/orders/OrderList';
import QuotaPage from './pages/quota/QuotaPage';
import BillingPage from './pages/billing/BillingPage';
import InvoicePage from './pages/invoice/InvoicePage';
import EnterpriseInfoPage from './pages/enterprise-info/EnterpriseInfoPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<EnterpriseLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/quota" element={<QuotaPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/invoice" element={<InvoicePage />} />
          <Route path="/enterprise-info" element={<EnterpriseInfoPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
