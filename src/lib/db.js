import { supabase } from './supabase'

/**
 * Fetch the application configuration parameters from Supabase
 */
export async function getConfig() {
    try {
        const { data, error } = await supabase
            .from('sakha_config')
            .select('*')

        if (error) throw error

        // Map array format down into a standard flat key/value object dictionary
        const configObj = {}
        if (data) {
            data.forEach(item => {
                configObj[item.key] = item.value
            })
        }
        return configObj
    } catch (err) {
        console.error('Failed to get configurations:', err)
        return {}
    }
}

/**
 * Update individual configuration variable settings key pairs
 */
export async function updateConfig(key, value) {
    try {
        const { data, error } = await supabase
            .from('sakha_config')
            .upsert({ key, value }, { onConflict: 'key' })
            .select()

        if (error) throw error
        return true
    } catch (err) {
        console.error(`Failed to update config parameter [${key}]:`, err)
        return false
    }
}

/**
 * Compile analytical metric counts from registered user submission records
 */
export async function getAdminStats() {
    try {
        // Read user counts
        const { count: totalUsers, error: userErr } = await supabase
            .from('sakha_users')
            .select('*', { count: 'exact', head: true })

        if (userErr) throw userErr

        // Read total submissions metrics
        const { data: subs, error: subErr } = await supabase
            .from('sakha_submissions')
            .select('overall_risk, is_paid')

        if (subErr) throw subErr

        const totalSubmissions = subs ? subs.length : 0
        const totalPaid = subs ? subs.filter(s => s.is_paid).length : 0

        // Calculate accurate mean risk average points
        let avgRisk = 0
        if (totalSubmissions > 0) {
            const sum = subs.reduce((acc, current) => acc + (current.overall_risk || 0), 0)
            avgRisk = Math.round(sum / totalSubmissions)
        }

        return {
            totalUsers: totalUsers || 0,
            totalAssessments: totalSubmissions,
            revenue: totalPaid * 49, // Tracking matching standard pricing bounds
            averageRisk: avgRisk
        }
    } catch (err) {
        console.error('Failed compiling administrative database metrics:', err)
        return { totalUsers: 0, totalAssessments: 0, revenue: 0, averageRisk: 0 }
    }
}

/**
 * Read historical diagnostics assessment logs complete with user records
 */
export async function getAllSubmissions() {
    try {
        const { data, error } = await supabase
            .from('sakha_submissions')
            .select(`
        id,
        created_at,
        overall_risk,
        personality_type,
        is_paid,
        sakha_users (
          name,
          email,
          phone,
          language_preference
        )
      `)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Transform joined structural items flat to feed clean rows to AdminPage UI tables
        return (data || []).map(row => ({
            id: row.id,
            timestamp: row.created_at,
            riskScore: row.overall_risk,
            archetype: row.personality_type,
            isPaid: row.is_paid,
            userName: row.sakha_users?.name || 'Anonymous User',
            userEmail: row.sakha_users?.email || 'N/A',
            userPhone: row.sakha_users?.phone || 'N/A',
            lang: row.sakha_users?.language_preference || 'english'
        }))
    } catch (err) {
        console.error('Failed reading submissions log history:', err)
        return []
    }
}