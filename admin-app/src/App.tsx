import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import EnterpriseList from './pages/enterprise/EnterpriseList';
import EnterpriseDetail from './pages/enterprise/EnterpriseDetail';
import OrderList from './pages/orders/OrderList';
import DriverOrderList from './pages/orders/DriverOrderList';
import VehicleList from './pages/vehicles/VehicleList';
import DriverList from './pages/drivers/DriverList';
import FinanceList from './pages/finance/FinanceList';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/enterprise" element={<EnterpriseList />} />
          <Route path="/enterprise/:id" element={<EnterpriseDetail />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/driver-orders" element={<DriverOrderList />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/drivers" element={<DriverList />} />
          <Route path="/finance" element={<FinanceList />} />
          <Route path="/config" element={<Placeholder module="config" />} />
          <Route path="/analytics" element={<Placeholder module="analytics" />} />
          <Route path="/system" element={<Placeholder module="system" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
