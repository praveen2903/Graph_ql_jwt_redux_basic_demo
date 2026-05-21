import { useEffect } from 'react'
import { Provider, useSelector } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client/react'
import { client } from './gql/client'
import { store, type RootState } from './redux/store'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SkillsPage from './pages/SkillsPage'

function AppRoutes() {
  const token = useSelector((s: RootState) => s.auth.token)

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/skills" /> : <Navigate to="/login" />} />
      <Route path="/login" element={token ? <Navigate to="/skills" /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/skills" /> : <RegisterPage />} />
      <Route path="/skills" element={token ? <SkillsPage /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default function App() {
  useEffect(() => {
    document.title = 'GraphQL JWT Redux Demo'
  }, [])

  return (
    <Provider store={store}>
          <ApolloProvider client={client}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ApolloProvider>
    </Provider>

  )
}

