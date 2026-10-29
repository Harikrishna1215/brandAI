export interface BrandForm {
  brand_name: string; industry: string; objective: string; products: string; audience: string
  tones: string[]; guidelines: string; reference_posts: string; language: string; hashtags: 'none' | 'few' | 'ai'
}
export interface Tweet { id: number; category: string; text: string; rationale: string; character_count: number }
export interface BrandVoice { summary: string[]; tone: string[]; target_audience: string; content_themes: string[]; writing_style: string; analysis_basis: string }
export interface Result { brand_voice: BrandVoice; tweets: Tweet[]; warnings: string[]; basis: string }
export const emptyForm: BrandForm = { brand_name: '', industry: '', objective: '', products: '', audience: '', tones: [], guidelines: '', reference_posts: '', language: 'English', hashtags: 'ai' }
export const OBJECTIVES = ['Engagement', 'Product Promotion', 'Brand Awareness', 'Lead Generation', 'Product Launch', 'Community Building', 'Educational Content', 'Event Promotion']
export const TONES = ['Professional', 'Witty', 'Humorous', 'Premium', 'Minimal', 'Bold', 'Friendly', 'Informative', 'Inspirational', 'Playful']
export const INDUSTRIES = ['Fashion', 'Food & Beverage', 'Technology', 'Healthcare', 'Education', 'Fitness', 'Finance', 'E-commerce', 'Travel', 'Lifestyle', 'Other']
export const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Hindi', 'Japanese']
export const PRESETS: Record<string, BrandForm> = {
  UrbanVibe: { ...emptyForm, brand_name: 'UrbanVibe', industry: 'Fashion', objective: 'Product Promotion', products: 'Oversized T-shirts, hoodies, and sneakers', audience: 'Young adults interested in streetwear', tones: ['Bold', 'Humorous'] },
  'Lumina Labs': { ...emptyForm, brand_name: 'Lumina Labs', industry: 'Technology', objective: 'Brand Awareness', products: 'Productivity software and digital tools', audience: 'Professionals and creators', tones: ['Informative', 'Minimal'], guidelines: 'Innovative, calm, precise. No hype words.' },
}
