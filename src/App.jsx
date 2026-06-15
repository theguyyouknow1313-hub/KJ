import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'

// Import Flat-File Component Page Layouts from your current root directory
import Landing from './Landing'
import Register from './Register'
import Profile from './Profile'
import AdminPage from './AdminPage'
import IntakePage from './IntakePage'
import QuizPage from './QuizPage'
import ResultsPage from './ResultsPage'
import LoadingScreen from './LoadingScreen'

// Import Framework Business Calculations & Algorithms
import { calcDropoutRisk, assignPersonalityType } from './lib/framework'

// Initialize Routing Context Engine Hook Providers
export const AppContext = createContext(null)
export function useApp() { return useContext(AppContext) }

// --- CORE ROUTING WRAPPER PAGES ---

// Renders either IntakePage or channels directly into the Live Assessment Quiz
function QuizRouteWrapper() {
    const { user } = useApp()
    const navigate = useNavigate()
    const [stage, setStage] = useState('intake') // 'intake', 'quiz', 'processing', 'results'
    const [answers, setAnswers] = useState(null)
    const [scores, setScores] = useState(null)
    const [archetypeKey, setArchetypeKey] = useState(null)
    const [submissionId, setSubmissionId] = useState(null)
    const [adminConfig, setAdminConfig] = useState({})

    // Fetch admin settings payload dynamically on mount
    useEffect(() => {
        async function fetchConfig() {
            try {
                const { data } = await supabase.from('sakha_config').select('*')
                if (data) {
                    const cfg = {}
                    data.forEach(item => { cfg[item.key] = item.value })
                    setAdminConfig(cfg)
                }
            } catch (e) {
                console.error('Failed to read configurations:', e)
            }
        }
        fetchConfig()
    }, [stage])

    async function handleIntakeSubmit() {
        setStage('quiz')
    }

    async function handleQuizComplete(quizAnswers) {
        setAnswers(quizAnswers)
        setStage('processing')

        // Evaluate scoring criteria vectors & overall dropout statistics
        const calculatedScores = calcDropoutRisk(quizAnswers)
        const assignedArchetype = assignPersonalityType(calculatedScores)

        setScores(calculatedScores)
        setArchetypeKey(assignedArchetype)

        try {
            // Step 1: Save submission log safely inside Supabase PostgreSQL clusters
            const { data: subData, error: subErr } = await supabase
                .from('sakha_submissions')
                .insert({
                    user_id: user.id,
                    answers: quizAnswers,
                    scores: {
                        overall: calculatedScores.overallRisk,
                        integration: calculatedScores.integrationIndex
                    },
                    personality_type: assignedArchetype,
                    overall_risk: calculatedScores.overallRisk,
                    layer_scores: calculatedScores.layerRisk,
                    dim_scores: calculatedScores.dimRisk,
                    is_paid: false
                })
                .select()
                .single()

            if (subErr) throw subErr
            setSubmissionId(subData.id)

            // Step 2: Cache active assessment locally for persistence retrieval fallbacks
            const fullResult = { ...calculatedScores, personalityType: assignedArchetype, insight: '' }
            localStorage.setItem('sakha_assessment', JSON.stringify(fullResult))
        } catch (err) {
            console.error('Supabase Transaction Error:', err)
        }

        // Processing animation timeout buffer
        setTimeout(() => {
            setStage('results')
        }, 1500)
    }

    function handleReset() {
        localStorage.removeItem('sakha_assessment')
        setAnswers(null)
        setScores(null)
        setArchetypeKey(null)
        setSubmissionId(null)
        setStage('intake')
        navigate('/')
    }

    if (stage === 'intake')     return <IntakePage onSubmit={handleIntakeSubmit} />
    if (stage === 'quiz')       return <QuizPage onComplete={handleQuizComplete} />
    if (stage === 'processing') return <LoadingScreen message="Analyzing your patterns..." />
    if (stage === 'results')    return <ResultsPage scores={scores} archetypeKey={archetypeKey} user={user} submissionId={submissionId} config={adminConfig} onReset={handleReset} />

    return null
}

// Separate standard Wrapper layer to safely initialize ResultsPage dynamically from LocalStorage Cache
function ResultRouteWrapper() {
    const { user } = useApp()
    const navigate = useNavigate()
    const [cachedData, setCachedData] = useState(null)
    const [adminConfig, setAdminConfig] = useState({})

    useEffect(() => {
        const saved = localStorage.getItem('sakha_assessment')
        if (!saved) {
            navigate('/quiz')
            return
        }
        try {
            const parsed = JSON.parse(saved)
            // Standardize payload keys matching expected architecture fields
            if (parsed && !parsed.overallRisk && parsed.overall !== undefined) {
                parsed.overallRisk = parsed.overall
                parsed.layerRisk = parsed.layer_scores || parsed.byLayer
                parsed.dimRisk = parsed.dim_scores || parsed.byDim
                parsed.integrationIndex = parsed.integrationIndex || parsed.scores?.integration
            }
            setCachedData(parsed)
        } catch (e) {
            navigate('/quiz')
        }

        async function fetchConfig() {
            const { data } = await supabase.from('sakha_config').select('*')
            if (data) {
                const cfg = {}
                data.forEach(item => { cfg[item.key] = item.value })
                setAdminConfig(cfg)
            }
        }
        fetchConfig()
    }, [navigate])

    if (!cachedData) return <LoadingScreen message="Loading diagnostic metrics..." />

    return (
        <ResultsPage
            scores={cachedData}
            archetypeKey={cachedData.personalityType}
            user={user}
            submissionId={null}
            config={adminConfig}
            onReset={() => {
                localStorage.removeItem('sakha_assessment')
                navigate('/quiz')
            }}
        />
    )
}

// Wrapper for AdminPage mapping onBack navigation cleanly
function AdminRouteWrapper() {
    const navigate = useNavigate()
    return <AdminPage onBack={() => navigate('/')} />
}

// --- MAIN STAGE ORCHESTRATOR APP ---

export default function App() {
    const [user, setUser] = useState(null)
    const [config, setConfig] = useState({ report_price: 49, report_free: false })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Read centralized pricing variables and configuration flags
        supabase.from('admin_config').select('*').eq('id', 'singleton').single()
            .then(({ data }) => { if (data) setConfig(data) }).catch(() => {})

        const saved = localStorage.getItem('sakha_user')
        if (saved) {
            try { setUser(JSON.parse(saved)) } catch(e) {}
        }
        setLoading(false)
    }, [])

    function loginUser(userData) {
        setUser(userData)
        localStorage.setItem('sakha_user', JSON.stringify(userData))
    }

    function logoutUser() {
        setUser(null)
        localStorage.removeItem('sakha_user')
        localStorage.removeItem('sakha_assessment')
    }

    if (loading) {
        return <LoadingScreen message="Loading Sakha application layout..." />
    }

    return (
        <AppContext.Provider value={{ user, config, loginUser, logoutUser }}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={user ? <Navigate to="/quiz" /> : <Register />} />

                    {/* Main Assessment quiz trajectory pipeline */}
                    <Route path="/quiz" element={user ? <QuizRouteWrapper /> : <Navigate to="/register" />} />

                    {/* Static View History and Dashboard parameters */}
                    <Route path="/result" element={user ? <ResultRouteWrapper /> : <Navigate to="/register" />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/register" />} />

                    {/* Platform Settings Panel Controls */}
                    <Route path="/admin" element={<AdminRouteWrapper />} />

                    {/* Fallback Wildcard Navigation Route redirect */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AppContext.Provider>
    )
}