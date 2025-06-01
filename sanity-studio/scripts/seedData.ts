// This script adds initial categories to your Sanity dataset
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'your-token', // Need write access
  useCdn: false,
})

const categories = [
  { name: 'Construction', slug: 'construction', description: 'General construction and building trades' },
  { name: 'Electrical', slug: 'electrical', description: 'Electrical installation and maintenance' },
  { name: 'Plumbing', slug: 'plumbing', description: 'Plumbing and pipefitting' },
  { name: 'HVAC', slug: 'hvac', description: 'Heating, ventilation, and air conditioning' },
  { name: 'Manufacturing', slug: 'manufacturing', description: 'Manufacturing and production' },
  { name: 'Welding', slug: 'welding', description: 'Welding and metalwork' },
  { name: 'Trucking', slug: 'trucking', description: 'Transportation and logistics' },
  { name: 'Warehouse', slug: 'warehouse', description: 'Warehouse and distribution' },
  { name: 'Landscaping', slug: 'landscaping', description: 'Landscaping and grounds maintenance' },
  { name: 'Automotive', slug: 'automotive', description: 'Auto repair and maintenance' },
]

async function seedCategories() {
  console.log('Seeding categories...')
  
  for (const category of categories) {
    try {
      await client.create({
        _type: 'jobCategory',
        name: category.name,
        slug: { current: category.slug },
        description: category.description,
      })
      console.log(`Created category: ${category.name}`)
    } catch (error) {
      console.error(`Error creating category ${category.name}:`, error)
    }
  }
  
  console.log('Seeding complete!')
}

seedCategories()