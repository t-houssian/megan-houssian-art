import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'
import schemaTypes from './schemas'
import { apiVersion, dataset, projectId } from './env'

export default defineConfig({
  basePath: '/studio',
  projectId,   // Ensure these values are valid strings
  dataset,
  schema: {
    types: schemaTypes,  // <-- This array must contain at least one document type
  },
  plugins: [
    // Use structureTool (the new API) instead of the deprecated deskTool:
    structureTool(),  
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
