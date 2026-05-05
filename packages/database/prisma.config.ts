import { defineConfig } from '@prisma/config'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local files
dotenv.config({ path: path.resolve(__dirname, '.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

export default defineConfig({
  schema: './prisma/schema.prisma',
})