import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await authAPI.verifyToken(token)
      if (response.data.success) {
        setUser(response.data.data.user)
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      
      if (response.data.success) {
        setUser(response.data.data.user)
        localStorage.setItem('token', response.data.data.token)
        toast.success('Login successful!')
        return { success: true }
      } else {
        toast.error(response.data.message || 'Login failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const signup = async (email, password) => {
    try {
      const response = await authAPI.signup(email, password)
      
      if (response.data.success) {
        setUser(response.data.data.user)
        localStorage.setItem('token', response.data.data.token)
        toast.success('Account created successfully!')
        return { success: true }
      } else {
        toast.error(response.data.message || 'Signup failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
