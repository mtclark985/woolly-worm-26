import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PasswordGate from './components/PasswordGate'
import Layout from './components/Layout'
import FamilyPicker from './components/FamilyPicker'
import { getFamily, setFamily } from './lib/family'

import Landing from './pages/Landing'
import Itinerary from './pages/Itinerary'
import Meals from './pages/Meals'
import House from './pages/House'
import Packing from './pages/Packing'
import Weather from './pages/Weather'
import Travel from './pages/Travel'
import MapPage from './pages/MapPage'
import Board from './pages/Board'
import Gallery from './pages/Gallery'

export default function App() {
  const [family, setFamilyState] = useState(getFamily)
  const [showPicker, setShowPicker] = useState(!getFamily())

  function handlePickFamily(name) {
    setFamily(name)
    setFamilyState(name)
    setShowPicker(false)
  }

  function handleSwitchFamily() {
    setFamilyState(null)
    setShowPicker(true)
  }

  return (
    <PasswordGate>
      <BrowserRouter>
        {showPicker && <FamilyPicker onPick={handlePickFamily} />}
        <Layout family={family} onSwitchFamily={handleSwitchFamily}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/house" element={<House />} />
            <Route path="/packing" element={<Packing />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/board" element={<Board />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </PasswordGate>
  )
}
