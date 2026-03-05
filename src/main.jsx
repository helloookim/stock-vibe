import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './i18n'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'

// Initialize theme from localStorage before render to prevent flash
const savedTheme = localStorage.getItem('theme') || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)

// Lazy load all page components
const Home = React.lazy(() => import('./pages/Home.jsx'))
const App = React.lazy(() => import('./App.jsx'))
const UsStockPage = React.lazy(() => import('./pages/UsStockPage.jsx'))
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy.jsx'))
const Terms = React.lazy(() => import('./pages/Terms.jsx'))
const Contact = React.lazy(() => import('./pages/Contact.jsx'))
const BlogList = React.lazy(() => import('./pages/BlogList.jsx'))
const NotFound = React.lazy(() => import('./pages/NotFound.jsx'))
const SamsungElectronics = React.lazy(() => import('./pages/blog/SamsungElectronics.jsx'))
const SKHynix = React.lazy(() => import('./pages/blog/SKHynix.jsx'))
const HyundaiMotor = React.lazy(() => import('./pages/blog/HyundaiMotor.jsx'))
const LGEnergySolution = React.lazy(() => import('./pages/blog/LGEnergySolution.jsx'))
const SamsungBiologics = React.lazy(() => import('./pages/blog/SamsungBiologics.jsx'))
const HanwhaAerospace = React.lazy(() => import('./pages/blog/HanwhaAerospace.jsx'))
const Kia = React.lazy(() => import('./pages/blog/Kia.jsx'))
const Naver = React.lazy(() => import('./pages/blog/Naver.jsx'))
const Kakao = React.lazy(() => import('./pages/blog/Kakao.jsx'))

const LoadingFallback = () => (
    <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)', fontSize: '0.9rem'
    }}>
        Loading...
    </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
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
                        <Route path="/blogs" element={<BlogList />} />
                        <Route path="/stocks/:stockCode" element={<App />} />
                        <Route path="/us-stocks/:ticker" element={<UsStockPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>,
)
