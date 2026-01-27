import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'
import Contact from './pages/Contact.jsx'
import SamsungElectronics from './pages/blog/SamsungElectronics.jsx'
import SKHynix from './pages/blog/SKHynix.jsx'
import HyundaiMotor from './pages/blog/HyundaiMotor.jsx'
import LGEnergySolution from './pages/blog/LGEnergySolution.jsx'
import SamsungBiologics from './pages/blog/SamsungBiologics.jsx'
import HanwhaAerospace from './pages/blog/HanwhaAerospace.jsx'
import Kia from './pages/blog/Kia.jsx'
import Naver from './pages/blog/Naver.jsx'
import Kakao from './pages/blog/Kakao.jsx'
import NotFound from './pages/NotFound.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog/samsung-electronics" element={<SamsungElectronics />} />
                    <Route path="/blog/sk-hynix" element={<SKHynix />} />
                    <Route path="/blog/hyundai-motor" element={<HyundaiMotor />} />
                    <Route path="/blog/lg-energy-solution" element={<LGEnergySolution />} />
                    <Route path="/blog/samsung-biologics" element={<SamsungBiologics />} />
                    <Route path="/blog/hanwha-aerospace" element={<HanwhaAerospace />} />
                    <Route path="/blog/kia" element={<Kia />} />
                    <Route path="/blog/naver" element={<Naver />} />
                    <Route path="/blog/kakao" element={<Kakao />} />
                    <Route path="/stocks/:stockCode" element={<App />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>,
)
