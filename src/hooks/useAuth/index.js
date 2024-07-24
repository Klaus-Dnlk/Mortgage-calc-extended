import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext/index'

function useAuth() {
  return useContext(AuthContext)
}

export default useAuth
