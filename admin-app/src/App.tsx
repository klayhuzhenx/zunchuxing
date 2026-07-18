import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import EnterpriseList from './pages/enterprise/EnterpriseList';
import EnterpriseDetail from './pages/enterprise/EnterpriseDetail';
import LeadList from './pages/enterprise/LeadList';
import OrderList from './pages/orders/OrderList';
import DriverOrderList from './pages/orders/DriverOrderList';
import VehicleList from './pages/vehicles/VehicleList';
import DriverList from './pages/drivers/DriverList';
import BillList from './pages/finance/BillList';
import InvoiceList from './pages/finance/InvoiceList';
import PaymentList from './pages/finance/PaymentList';
import TransactionList from './pages/finance/TransactionList';
import ConfigPage from './pages/ConfigPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SystemPage, {
  AccountsPage, RolesPage, LoginLogsPage, OperationLogsPage, OnlineUsersPage, MenusPage,
} from './pages/SystemPage';

export default function App() {
  return (
    <BrowserRouter basename="/zun/yyd">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/enterprise/leads" element={<LeadList />} />
          <Route path="/enterprise" element={<EnterpriseList />} />
          <Route path="/enterprise/:id" element={<EnterpriseDetail />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/driver-orders" element={<DriverOrderList />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/drivers" element={<DriverList />} />
          <Route path="/finance" element={<Navigate to="/finance/bills" replace />} />
          <Route path="/finance/bills" element={<BillList />} />
          <Route path="/finance/invoices" element={<InvoiceList />} />
          <Route path="/finance/payments" element={<PaymentList />} />
          <Route path="/finance/transactions" element={<TransactionList />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/system" element={<SystemPage />}>
            <Route index element={<Navigate to="/system/accounts" replace />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="login-logs" element={<LoginLogsPage />} />
            <Route path="op-logs" element={<OperationLogsPage />} />
            <Route path="online" element={<OnlineUsersPage />} />
            <Route path="menus" element={<MenusPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
