import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login'
import Register from './Pages/Register'
import ForgotPassword from './Pages/ForgotPassword'
import VerifyEmail from './Pages/VerifyEmail'
import Dashboard from './Pages/Dashboard'
import RiskQuestionnaire from './Pages/RiskQuestionnaire'
import Portfolio from './Pages/Portfolio'
import Recommendations from './Pages/Recommendations'
import Calculators from './Pages/Calculators'
import Watchlist from './Pages/Watchlist'
import StockCompare from './Pages/StockCompare'
import RiskAnalyzer from './Pages/RiskAnalyzer'
import News from './Pages/News'
import Alerts from './Pages/Alerts'
import Transactions from './Pages/Transactions'
import AdminDashboard from './Pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/verify-email' element={<VerifyEmail />} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><RiskQuestionnaire /></ProtectedRoute>} />
          <Route path='/portfolio' element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path='/recommendations' element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path='/calculators' element={<ProtectedRoute><Calculators /></ProtectedRoute>} />
          <Route path='/watchlist' element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
          <Route path='/compare' element={<ProtectedRoute><StockCompare /></ProtectedRoute>} />
          <Route path='/risk-analyzer' element={<ProtectedRoute><RiskAnalyzer /></ProtectedRoute>} />
          <Route path='/news' element={<ProtectedRoute><News /></ProtectedRoute>} />
          <Route path='/alerts' element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path='/transactions' element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path='/admin' element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
