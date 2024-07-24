import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Banks from '../pages/Banks'
import Calc from '../pages/Calc'
import PatternsDemo from '../pages/PatternsDemo'

function AppRoutes() {

    return (
        <Routes>
            <Route path='/' element={<Home/>}  exact/>
            <Route 
                path='/calc'
                element={<Calc />}
            />
            <Route 
                path='/banks'
                element={
                    <Banks />
                }
            />
            <Route 
                path='/patterns'
                element={<PatternsDemo />}
            />
        </Routes>
    )
}

export default AppRoutes