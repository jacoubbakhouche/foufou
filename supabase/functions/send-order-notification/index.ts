// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'

console.log("Hello from Functions!")

// Get Service Account from Supabase Secrets
// You need to set FIREBASE_SERVICE_ACCOUNT secret in Supabase Dashboard
const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')

const getAccessToken = async ({ clientEmail, privateKey }: { clientEmail: string, privateKey: string }) => {
    const now = Math.floor(Date.now() / 1000)
    const hour = 3600

    const jwt = await new jose.SignJWT({
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + hour,
        iat: now,
    })
        .setProtectedHeader({ alg: 'RS256' })
        .sign(await jose.importPKCS8(privateKey, 'RS256'))

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    })

    const data = await res.json()
    return data.access_token
}

serve(async (req) => {
    try {
        const { orderId, customerName, total } = await req.json()

        // 1. Initialize Supabase Client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Fetch Admin Tokens
        // 2. Fetch All Tokens (Since only Admins register in Admin.tsx now)
        const { data: tokens, error: tokenError } = await supabaseClient
            .from('fcm_tokens')
            .select('token')

        // Removed explicit admin role check as requested AND enforced via frontend registration logic

        if (tokenError) throw tokenError

        if (!tokens || tokens.length === 0) {
            return new Response(JSON.stringify({ message: 'No admin tokens found' }), { headers: { 'Content-Type': 'application/json' } })
        }

        // 3. Get Firebase Access Token
        const accessToken = await getAccessToken({
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key,
        })

        if (!serviceAccount.project_id) {
            throw new Error('Missing FIREBASE_SERVICE_ACCOUNT or invalid format')
        }

        // 4. Send Notifications via FCM HTTP v1 API
        const projectId = serviceAccount.project_id
        const deviceTokens = tokens.map((t: any) => t.token)

        // We send individually or batch (FCM v1 recommends individual or small batches)
        const results = await Promise.all(deviceTokens.map(async (token: string) => {
            const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: {
                        token: token,
                        notification: {
                            title: 'طلب جديد! 🎉',
                            body: `طلب جديد من ${customerName} بقيمة ${total} د.ج`,
                        },
                        data: {
                            orderId: orderId,
                            type: 'new_order'
                        }
                    }
                })
            })
            return res.json()
        }))

        return new Response(
            JSON.stringify(results),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }
})
