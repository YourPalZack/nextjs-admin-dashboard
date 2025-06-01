import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Colorado Job Board',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Job Postings')
              .child(
                S.documentList()
                  .title('Job Postings')
                  .filter('_type == "jobPosting"')
              ),
            S.listItem()
              .title('Applications')
              .child(
                S.documentList()
                  .title('Applications')
                  .filter('_type == "jobApplication"')
              ),
            S.listItem()
              .title('Companies')
              .child(
                S.documentList()
                  .title('Companies')
                  .filter('_type == "company"')
              ),
            S.listItem()
              .title('Categories')
              .child(
                S.documentList()
                  .title('Job Categories')
                  .filter('_type == "jobCategory"')
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})