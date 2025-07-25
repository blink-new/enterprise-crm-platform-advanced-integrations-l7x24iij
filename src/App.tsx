import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import Contacts from '@/pages/Contacts'
import Leads from '@/pages/Leads'
import Opportunities from '@/pages/Opportunities'
import Contracts from '@/pages/Contracts'
import Integrations from '@/pages/Integrations'
import { blink } from '@/blink/client'
import { Toaster } from '@/components/ui/toaster'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">CRM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enterprise CRM</h1>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">CRM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enterprise CRM</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your CRM workspace</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="leads" element={<Leads />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="companies" element={<div className="p-6"><h1 className="text-2xl font-bold">Companies</h1><p className="text-gray-600">Company management coming soon...</p></div>} />
            <Route path="tasks" element={<div className="p-6"><h1 className="text-2xl font-bold">Tasks</h1><p className="text-gray-600">Task management coming soon...</p></div>} />
            <Route path="calendar" element={<div className="p-6"><h1 className="text-2xl font-bold">Calendar</h1><p className="text-gray-600">Calendar integration coming soon...</p></div>} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p className="text-gray-600">Advanced reporting coming soon...</p></div>} />
            <Route path="marketing" element={<div className="p-6"><h1 className="text-2xl font-bold">Marketing</h1><p className="text-gray-600">Marketing automation coming soon...</p></div>} />
            <Route path="billing" element={<div className="p-6"><h1 className="text-2xl font-bold">Billing</h1><p className="text-gray-600">Billing management coming soon...</p></div>} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600">System settings coming soon...</p></div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App