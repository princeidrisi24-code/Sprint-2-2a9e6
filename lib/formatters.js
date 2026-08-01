/**
 * Format number as Indian Rupee currency
 */
export function formatCurrency(amount, compact = false) {
  if (amount === null || amount === undefined) return '₹0'
  const num = Number(amount)
  if (compact) {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format a date nicely
 */
export function formatDate(date, options = {}) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

/**
 * Format date as short (e.g., "Aug 1")
 */
export function formatDateShort(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/**
 * Get current month string e.g. "2026-08"
 */
export function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Calculate days remaining until a date
 */
export function daysUntil(dateStr) {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return diff
}

/**
 * Get percentage (safe division)
 */
export function getPct(value, total) {
  if (!total || total === 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return 'U'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

/**
 * Get greeting based on time of day
 */
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Get score color class
 */
export function getScoreColor(score) {
  if (score >= 70) return 'var(--color-accent)'
  if (score >= 40) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

/**
 * Get score label
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Fair'
  if (score >= 40) return 'Needs Work'
  return 'At Risk'
}

/**
 * Category icons map
 */
export const CATEGORY_ICONS = {
  food: '🍔',
  shopping: '🛍️',
  transport: '🚗',
  health: '🏥',
  entertainment: '🎬',
  utilities: '💡',
  housing: '🏠',
  education: '📚',
  savings: '💰',
  investment: '📈',
  debt: '💳',
  salary: '💼',
  other: '📦',
}

/**
 * Life stage options
 */
export const LIFE_STAGES = [
  { value: 'student', label: 'Student', emoji: '🎓' },
  { value: 'early_career', label: 'Early Career (20s)', emoji: '🚀' },
  { value: 'mid_career', label: 'Mid Career (30s)', emoji: '💼' },
  { value: 'family', label: 'Family & Growing', emoji: '👨👩👧' },
  { value: 'pre_retirement', label: 'Pre-Retirement (50s)', emoji: '🌅' },
]

/**
 * Expense categories
 */
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Dining', emoji: '🍔', color: '#F59E0B' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#EC4899' },
  { value: 'transport', label: 'Transport', emoji: '🚗', color: '#3B82F6' },
  { value: 'health', label: 'Health', emoji: '🏥', color: '#10B981' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#A855F7' },
  { value: 'utilities', label: 'Utilities', emoji: '💡', color: '#6366F1' },
  { value: 'housing', label: 'Housing / Rent', emoji: '🏠', color: '#F97316' },
  { value: 'education', label: 'Education', emoji: '📚', color: '#14B8A6' },
  { value: 'other', label: 'Other', emoji: '📦', color: '#6B7280' },
]

/**
 * Goal templates
 */
export const GOAL_TEMPLATES = [
  { name: 'Emergency Fund', emoji: '🆘', description: '3–6 months of expenses saved' },
  { name: 'Home Down Payment', emoji: '🏠', description: 'Save for your dream home' },
  { name: 'Vacation', emoji: '✈️', description: 'Fund your next adventure' },
  { name: 'New Car', emoji: '🚗', description: 'Drive away your goals' },
  { name: 'Wedding', emoji: '💍', description: 'Make your special day perfect' },
  { name: 'Education', emoji: '🎓', description: 'Invest in your future' },
  { name: 'Retirement', emoji: '🌅', description: 'Build long-term security' },
  { name: 'Gadget / Tech', emoji: '💻', description: 'Save up for your next device' },
  { name: 'Investment Fund', emoji: '📈', description: 'Grow your wealth' },
  { name: 'Custom Goal', emoji: '🎯', description: 'Define your own goal' },
]
