export type Category = 'homework' | 'school' | 'relationship' | 'funny' | 'teacher' | 'parent' | 'student' | 'other'

export const CATEGORY_LABELS: Record<Category, string> = {
  homework: '作业辅导',
  school: '吐槽学校',
  relationship: '亲子关系',
  funny: '搞笑日常',
  teacher: '吐槽老师',
  parent: '吐槽家长',
  student: '吐槽学生',
  other: '其他吐槽'
}

export interface Comment {
  id: string
  post_id: string
  content: string
  nickname: string
  created_at: string
}

export interface Post {
  id: string
  content: string
  nickname: string
  created_at: string
  likes: number
  color: string
  category: Category
  image_url?: string
  comment_count?: number // Virtual field for display
  ip_address?: string // Admin only field
}
