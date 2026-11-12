export interface Variant { label: string; colorHex?: string; size?: string; price?: number | null; stock: number }
export interface Product {
  id: number; name: string; description?: string; price: number | null; categoryId: number; categoryName: string; categorySlug: string
  color?: string; colorHex?: string; size?: string; pattern?: string; design?: string; stock: number; inStock: boolean
  featured: boolean; newArrival: boolean; popular: boolean; demo: boolean; imageIds: number[]; variants: Variant[]
}
export interface ProductPage { items: Product[]; total: number; page: number; pages: number }
export interface Category { id: number; slug: string; name: string; group: string; description?: string; accentColor: string; imageId?: number | null; sortOrder: number; productCount: number }
export interface Filters { colors: string[]; patterns: string[]; sizes: string[]; designs: string[] }
export interface Suggestion { type: 'product' | 'category'; label: string; id: number; slug?: string }
export interface Template { id: number; kind: string; name: string; mediaId: number; maskJson?: string; active: boolean }
export interface CustomerUser {
  id: number; username: string; status: 'ACTIVE' | 'EXPIRED' | 'DISABLED' | 'SCHEDULED'; enabled: boolean
  activeFrom?: string; expiresAt?: string; effectiveExpiry?: string; usageMinutes?: number | null
  firstLoginAt?: string; lastLoginAt?: string; note?: string; createdAt: string; remainingSeconds?: number | null
}
export interface Issued { user: CustomerUser; username: string; password: string }
export type Settings = Record<string, string>