import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { handleAi } from './api/_ai.js'

/**
 * `/api/ai` in development.
 *
 * In production that path is a Vercel function; the dev server knows nothing
 * about it, and without this every AI feature would silently fall back to its
 * offline stand-in on localhost — the exact behaviour you would then chase in
 * production. It calls the same handler the deployed function does, so there is
 * one implementation to get right.
 */
function aiDevEndpoint(apiKey: string | undefined): Plugin {
  return {
    name: 'eaglish-ai-dev',
    configureServer(server) {
      server.middlewares.use('/api/ai', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'method-not-allowed' }))
          return
        }

        const chunks: Buffer[] = []
        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', async () => {
          let body: unknown
          try {
            body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'bad-json' }))
            return
          }

          const result = await handleAi(body, apiKey)
          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result.body))
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Loaded here rather than through import.meta.env: the key must stay out of
  // the client bundle, and anything VITE_-prefixed would land in it.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), aiDevEndpoint(env.GROQ_API_KEY)],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
