// ═══════════════════════════════════════════════════════════
// SAKHA v1 — CORE FRAMEWORK & SCORING ENGINE (framework.js)
// ═══════════════════════════════════════════════════════════

// Supporting Language Maps
export const LANGUAGES = [
    { key: 'english', label: 'English' },
    { key: 'hindi', label: 'Hindi' },
    { key: 'sanskrit', label: 'Sanskrit' }
];

// 7 Developmental Layers Matrix
export const LAYERS = [
    { id: 'M1', name: 'Foundation', desc: 'Physical/Biological Security', color: '#DC2626' },
    { id: 'M2', name: 'Vitality', desc: 'Emotional/Desire Patterns', color: '#EA580C' },
    { id: 'M3', name: 'Confidence', desc: 'Cognitive/Willpower Focus', color: '#CA8A04' },
    { id: 'M4', name: 'Connection', desc: 'Social/Empathetic Bond', color: '#16A34A' },
    { id: 'M5', name: 'Expression', desc: 'Creativity/Voice Output', color: '#2563EB' },
    { id: 'M6', name: 'Clarity', desc: 'Discrimination/Deep Vision', color: '#7C3AED' },
    { id: 'M7', name: 'Purpose', desc: 'Spiritual/Integration Layer', color: '#DB2777' }
];

// 5 PECMS Psychological Dimensions Map
export const DIMS = {
    P: 'Physical',
    E: 'Emotional',
    C: 'Cognitive',
    M: 'Moral',
    S: 'Spiritual'
};

// 35 Mapped Diagnostic Questions (5 per layer across 7 layers)
export const QUESTIONS = [
    // Layer 1 (M1) — Foundation Questions
    { layer: 'M1', dim: 'P', focus: 'Sleep Cycles & Vital Rest', a: 'I struggle to fall asleep or wake up completely exhausted daily.', b: 'I ignore sleep entirely to work, operating on hyper-caffeinated overdrive.' },
    { layer: 'M1', dim: 'E', focus: 'Basic Nervous System Safety', a: 'I feel consistently paralyzed, numb, or fundamentally unsafe inside.', b: 'I am always hyper-vigilant, restless, or fighting imaginary threats.' },
    { layer: 'M1', dim: 'C', focus: 'Environmental Grounding', a: 'My surrounding room or routine is in absolute chaotic disarray.', b: 'I display obsessive micro-control over my physical surroundings.' },
    { layer: 'M1', dim: 'M', focus: 'Physical Instinct Accountability', a: 'I completely neglect my bodily health and basic hygiene requirements.', b: 'I treat my physical training like an aggressive, punishing battleground.' },
    { layer: 'M1', dim: 'S', focus: 'Existential Right to Exist', a: 'I feel like a ghost, fading into the background without a right to space.', b: 'I take up space forcefully, loudly masking deep internal insecurity.' },

    // Layer 2 (M2) — Vitality Questions
    { layer: 'M2', dim: 'P', focus: 'Biological Energy Flows', a: 'My energy feels entirely stagnant, heavy, and locked down.', b: 'My energy surges erratically, making me highly impulsive and volatile.' },
    { layer: 'M2', dim: 'E', focus: 'Emotional Desires & Joys', a: 'I find it impossible to enjoy anything; everything feels dry and grey.', b: 'I run from discomfort by chasing quick, intense dopamine rushes.' },
    { layer: 'M2', dim: 'C', focus: 'Creative Intuitive Sparks', a: 'My imagination feels completely dead, uninspired, and frozen.', b: 'My head is crowded with endless creative ideas but no executions.' },
    { layer: 'M2', dim: 'M', focus: 'Desire Boundaries', a: 'I submit easily to external pressures, burying what I actually want.', b: 'I run over others relentlessly to satisfy my temporary desires.' },
    { layer: 'M2', dim: 'S', focus: 'Life Spark Integration', a: 'I feel deeply disconnected from the natural rhythm of vitality.', b: 'I try to force life to move at my demanding, impatient speed.' },

    // Layer 3 (M3) — Confidence / Cognitive Power Questions
    { layer: 'M3', dim: 'P', focus: 'Sustained Execution Stamina', a: 'I give up on tasks the very second a roadblock or hardship occurs.', b: 'I push through physical exhaustion blindly, ignoring burnout signs.' },
    { layer: 'M3', dim: 'E', focus: 'Self-Worth Identity', a: 'I am trapped in a constant cycle of harsh, limiting self-doubt.', b: 'I pretend to have complete perfection, refusing to reveal errors.' },
    { layer: 'M3', dim: 'C', focus: 'Logical Strategic Planning', a: 'My thoughts are scattered; I cannot structure a simple objective.', b: 'I get stuck in endless analysis paralysis, over-calculating steps.' },
    { layer: 'M3', dim: 'M', focus: 'Agency & Personal Power', a: 'I blame luck, institutions, or fate for all my current problems.', b: 'I carry total global guilt, assuming everything is my personal fault.' },
    { layer: 'M3', dim: 'S', focus: 'Willpower Alignment', a: 'I have lost my internal pilot; I operate like a programmed robot.', b: 'I use raw willpower aggressively to dominate my immediate world.' },

    // Layer 4 (M4) — Connection Questions
    { layer: 'M4', dim: 'P', focus: 'Somatic Compassion', a: 'I am completely disconnected from the pain signals of people around me.', b: 'I absorb everybody else\'s distress, draining my physical energy.' },
    { layer: 'M4', dim: 'E', focus: 'Relational Safety & Intimacy', a: 'I build high walls around myself, preventing anyone from getting close.', b: 'I lose my identity completely trying to maintain relationship ties.' },
    { layer: 'M4', dim: 'C', focus: 'Intellectual Empathy', a: 'I instantly dismiss different perspectives as completely stupid.', b: 'I shift my core views completely depending on who is talking.' },
    { layer: 'M4', dim: 'M', focus: 'Shared Accountability', a: 'I isolate myself completely when facing critical personal problems.', b: 'I demand constant validation from external sources to function.' },
    { layer: 'M4', dim: 'S', focus: 'Universal Belonging', a: 'I feel like a total alien outsider everywhere I walk on this earth.', b: 'I adapt like a total chameleon, losing my true self to fit into groups.' },

    // Layer 5 (M5) — Expression Questions
    { layer: 'M5', dim: 'P', focus: 'Physical Vocalization', a: 'My voice gets stuck in my throat; I find it painful to speak up.', b: 'I speak aggressively and constantly, drowning out anyone else.' },
    { layer: 'M5', dim: 'E', focus: 'Emotional Truth Sharing', a: 'I completely swallow my sadness and anger until I choke on it.', b: 'I dump my raw, unedited emotional reactions on unsuspecting people.' },
    { layer: 'M5', dim: 'C', focus: 'Articulating Complex Concepts', a: 'I cannot find the words to communicate what is inside my brain.', b: 'I hide simple truths behind empty, confusing technical jargon.' },
    { layer: 'M5', dim: 'M', focus: 'Authentic Action', a: 'I act in total opposition to my true desires to keep things quiet.', b: 'I manipulate conversations to ensure I always win the argument.' },
    { layer: 'M5', dim: 'S', focus: 'Creative Flow Channeling', a: 'I completely choke my unique creative voice out of fear of review.', b: 'I use creative expression simply to get praise and build ego.' },

    // Layer 6 (M6) — Clarity / Insight Questions
    { layer: 'M6', dim: 'P', focus: 'Somatic Discrimination', a: 'I do not realize I am physically sick until my body collapses.', b: 'I hyper-analyze every tiny physical sensation as a medical emergency.' },
    { layer: 'M6', dim: 'E', focus: 'Perceptual Objectivity', a: 'I am blinded by my immediate feelings, distorting actual reality.', b: 'I emotionally detach completely, treating life like a cold math test.' },
    { layer: 'M6', dim: 'C', focus: 'Core Root Diagnosis', a: 'I am lost in minor details, unable to see the big underlying pattern.', b: 'I build massive, theoretical systems while missing basic daily steps.' },
    { layer: 'M6', dim: 'M', focus: 'Moral Vision Consistency', a: 'I adjust my ethics instantly based on whatever benefits me today.', b: 'I am rigidly judgmental, processing life into absolute black and white.' },
    { layer: 'M6', dim: 'S', focus: 'Intuitive Alignment', a: 'My internal navigation system is completely jammed and silent.', b: 'I follow random internal flashes blindly, misinterpreting them as destiny.' },

    // Layer 7 (M7) — Purpose Questions
    { layer: 'M7', dim: 'P', focus: 'Structural Harmony', a: 'My daily actions are in total conflict with my long-term survival.', b: 'I am an absolute perfectionist slave to an exhausting ideal lifestyle.' },
    { layer: 'M7', dim: 'E', focus: 'Integrated Wholeness', a: 'I feel deeply fragmented, like different people pulling apart.', b: 'I force an artificial, positive smile over deep hidden sorrow.' },
    { layer: 'M7', dim: 'C', focus: 'Transcendental Meaning', a: 'I believe life is completely meaningless, empty, and mechanical.', b: 'I get lost in grand philosophical dreams while ignoring daily work.' },
    { layer: 'M7', dim: 'M', focus: 'Destiny Integrity', a: 'I have completely abandoned my highest values to simply survive.', b: 'I am self-righteously obsessed with sacrificing myself to a cause.' },
    { layer: 'M7', dim: 'S', focus: 'Unified Oneness', a: 'I feel totally cut off from any deeper purpose or guiding force.', b: 'I claim divine authority, believing I am completely above regular rules.' }
];

// 8 Multilingual Personality Archetypes Config
export const ARCHETYPES = {
    SURVIVOR: {
        key: 'SURVIVOR',
        emoji: '🛡️',
        color: '#DC2626',
        gradient: 'linear-gradient(135deg, #7F1D1D, #DC2626)',
        names: { english: 'Survivor', hindi: 'Yoddha', sanskrit: 'Vira' },
        tagline: { english: 'Fighting to anchor the foundations of daily life.' },
        description: { english: 'Your energy is concentrated in securing base safety and overcoming core stability vulnerabilities.' },
        strengths: ['Resilience under pressure', 'Grit', 'Survival instincts'],
        growth: ['Learning to drop defenses', 'Building safety bridges']
    },
    DREAMER: {
        key: 'DREAMER',
        emoji: '✨',
        color: '#EA580C',
        gradient: 'linear-gradient(135deg, #7C2D12, #EA580C)',
        names: { english: 'Dreamer', hindi: 'Sapnadrishta', sanskrit: 'Svapnadrishti' },
        tagline: { english: 'Navigating grand visions and high-activation aspirations.' },
        description: { english: 'You contain intense, active aspirational energy that requires grounded logical architectures to manifest.' },
        strengths: ['Vivid imagination', 'High ambition', 'Creative sparks'],
        growth: ['Grounding ideas into real work', 'Overcoming distraction loops']
    },
    BUILDER: {
        key: 'BUILDER',
        emoji: '🔨',
        color: '#CA8A04',
        gradient: 'linear-gradient(135deg, #713F12, #CA8A04)',
        names: { english: 'Builder', hindi: 'Nirmata', sanskrit: 'Rachayita' },
        tagline: { english: 'Executing strategies with powerful willpower and focus.' },
        description: { english: 'You excel at applying structured cognitive logic and direct mental force to finish execution benchmarks.' },
        strengths: ['High execution power', 'Logical clarity', 'Willpower'],
        growth: ['Avoiding absolute burnout', 'Softening rigid expectations']
    },
    CONNECTOR: {
        key: 'CONNECTOR',
        emoji: '🤝',
        color: '#16A34A',
        gradient: 'linear-gradient(135deg, #14532D, #16A34A)',
        names: { english: 'Connector', hindi: 'Sangathi', sanskrit: 'Sahayogi' },
        tagline: { english: 'Weaving bridges of mutual empathy and shared meaning.' },
        description: { english: 'Your focus is anchored in relationships, relational integration, and group safe spaces.' },
        strengths: ['Deep empathy', 'Relational intelligence', 'Collaboration'],
        growth: ['Setting personal boundaries', 'Preventing identity loss']
    },
    VOICE: {
        key: 'VOICE',
        emoji: '📣',
        color: '#2563EB',
        gradient: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
        names: { english: 'Voice', hindi: 'Awaaz', sanskrit: 'Vakta' },
        tagline: { english: 'Expressing truth cleanly with creative impact.' },
        description: { english: 'You are designed to give form to concepts through transparent, clear vocalization and authentic action.' },
        strengths: ['Clear communication', 'Creative projection', 'Authenticity'],
        growth: ['Listening to alternative views', 'Avoiding verbal manipulation']
    },
    SEEKER: {
        key: 'SEEKER',
        emoji: '🔍',
        color: '#7C3AED',
        gradient: 'linear-gradient(135deg, #3B0764, #7C3AED)',
        names: { english: 'Seeker', hindi: 'Jigyasu', sanskrit: 'Anvesha' },
        tagline: { english: 'Sifting details to extract timeless structural clarity.' },
        description: { english: 'You look past symptoms to map underlying root problems, pursuing ultimate wisdom.' },
        strengths: ['Root cause diagnosis', 'Perceptual objectivity', 'Discrimination'],
        growth: ['Stepping out of over-analysis', 'Connecting with daily realities']
    },
    GUARDIAN: {
        key: 'GUARDIAN',
        emoji: '⚖️',
        color: '#06B6D4',
        gradient: 'linear-gradient(135deg, #164E63, #06B6D4)',
        names: { english: 'Guardian', hindi: 'Rakshak', sanskrit: 'Dharmapalaka' },
        tagline: { english: 'Protecting universal moral values and community structures.' },
        description: { english: 'You prioritize moral principles, consistency, and protective custody over systemic vulnerabilities.' },
        strengths: ['High ethical standard', 'Accountability', 'Systemic duty'],
        growth: ['Releasing judgmental rigidity', 'Accepting life\'s gray zones']
    },
    WANDERER: {
        key: 'WANDERER',
        emoji: '🍃',
        color: '#DB2777',
        gradient: 'linear-gradient(135deg, #50072B, #DB2777)',
        names: { english: 'Wanderer', hindi: 'Raahi', sanskrit: 'Pathika' },
        tagline: { english: 'Moving across multi-layer changes to find true alignment.' },
        description: { english: 'Your pattern is navigating deep adjustments across multiple horizons to re-anchor your inner compass.' },
        strengths: ['Adaptability', 'Broad perspective', 'Transformation capability'],
        growth: ['Re-anchoring scattered energy', 'Rebuilding structural habits']
    }
};

// Dropout Risk Evaluator Level Labels Converter
export function getRiskLevel(pct) {
    if (pct >= 70) return { label: 'Critical Risk', emoji: '🚨', color: '#DC2626', bg: '#DC2626' };
    if (pct >= 50) return { label: 'High Risk', emoji: '⚠️', color: '#EA580C', bg: '#EA580C' };
    if (pct >= 30) return { label: 'Moderate Deviation', emoji: '📊', color: '#CA8A04', bg: '#CA8A04' };
    return { label: 'Healthy Balance', emoji: '✓', color: '#16A34A', bg: '#16A34A' };
}

// ──────────────────────────────────────────────────────────
// CORE ENGINE ENGINE CALCULATION INTERFACES
// ──────────────────────────────────────────────────────────

export function calcDropoutRisk(answers) {
    // Initialize scoring vectors
    const layerRisk = {};
    LAYERS.forEach(l => { layerRisk[l.id] = { points: 0, max: 0, nodes: [] }; });

    const dimRisk = {};
    Object.keys(DIMS).forEach(d => { dimRisk[d] = { points: 0, max: 0 }; });

    let totalRiskPoints = 0;
    let maxPossiblePoints = 0;
    let integrationIndex = 0;

    // Process answers dictionary mapping { "0": -2, "1": 0, ... }
    QUESTIONS.forEach((q, index) => {
        const val = answers[index] !== undefined ? answers[index] : 0;

        // Weighting Logic Engine Matrix
        // Score -2 (Strongly A) = 3.0 risk points (Critical dropout shutdown signal)
        // Score -1 (Mostly A)   = 1.5 risk points
        // Score  0 (Balanced)   = 0.0 risk points
        // Score +1 (Mostly B)   = 0.5 risk points
        // Score +2 (Strongly B) = 1.0 risk points
        let points = 0;
        if (val === -2) points = 3.0;
        else if (val === -1) points = 1.5;
        else if (val === 0)  points = 0.0;
        else if (val === 1)  points = 0.5;
        else if (val === 2)  points = 1.0;

        if (val === 0) {
            integrationIndex += 1;
        }

        const maxNodeRisk = 3.0;

        // Update Layer Vectors
        layerRisk[q.layer].points += points;
        layerRisk[q.layer].max += maxNodeRisk;
        layerRisk[q.layer].nodes.push({ id: index, focus: q.focus, score: val, a: q.a, b: q.b, layer: q.layer });

        // Update Dimension Vectors
        dimRisk[q.dim].points += points;
        dimRisk[q.dim].max += maxNodeRisk;

        totalRiskPoints += points;
        maxPossiblePoints += maxNodeRisk;
    });

    // Calculate Overall Risk Percentage
    const overallRisk = Math.round((totalRiskPoints / maxPossiblePoints) * 100);

    return {
        overallRisk,
        integrationIndex,
        layerRisk,
        dimRisk,
        answers
    };
}

export function assignPersonalityType(scores) {
    // Rule 1: If 4 or more layers have critical risk (> 60%), mark as WANDERER
    let criticalLayersCount = 0;
    Object.entries(scores.layerRisk).forEach(([layerId, data]) => {
        const layerPct = (data.points / data.max) * 100;
        if (layerPct > 60) {
            criticalLayersCount += 1;
        }
    });

    if (criticalLayersCount >= 4) {
        return 'WANDERER';
    }

    // Rule 2: Identify dominant highest risk layer
    let highestRiskLayer = 'M1';
    let maxLayerPct = -1;

    Object.entries(scores.layerRisk).forEach(([layerId, data]) => {
        const layerPct = (data.points / data.max) * 100;
        if (layerPct > maxLayerPct) {
            maxLayerPct = layerPct;
            highestRiskLayer = layerId;
        }
    });

    // Map highest risk layer directly to associated dominant archetype archetype key
    const layerToArchetypeMap = {
        M1: 'SURVIVOR',
        M2: 'DREAMER',
        M3: 'BUILDER',
        M4: 'CONNECTOR',
        M5: 'VOICE',
        M6: 'SEEKER',
        M7: 'GUARDIAN'
    };

    return layerToArchetypeMap[highestRiskLayer] || 'SEEKER';
}