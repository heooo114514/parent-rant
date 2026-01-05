import { Post, Comment } from '@/types'

export const mockComments: Comment[] = [
  {
    id: 'c1',
    post_id: '1',
    content: '太真实了！我也经常被气得怀疑人生。',
    nickname: '路过家长A',
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: 'c2',
    post_id: '1',
    content: '现在的题确实难，有时候我都不会做。',
    nickname: '学渣家长',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'c3',
    post_id: '2',
    content: '我家也是，买回来就不玩了，全是智商税。',
    nickname: '心痛的钱包',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  }
]

export const mockPosts: Post[] = [
  {
    id: '1',
    content: '现在的作业太难了，不仅考孩子，还考家长！昨天那道数学题我想了半小时才做出来，结果孩子说老师讲的方法跟我不一样...',
    nickname: '崩溃的数学课代表',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    likes: 42,
    color: 'blue',
    category: 'homework',
    comment_count: 2
  },
  {
    id: '2',
    content: '带娃去超市，非要买那个巨贵的奥特曼，不买就地打滚。最后还是买了，回家玩了五分钟就扔一边了。我的钱啊！',
    nickname: '奥特曼之父',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    likes: 128,
    color: 'orange',
    category: 'relationship',
    comment_count: 1
  },
  {
    id: '3',
    content: '辅导作业时的我 vs 平时的我，完全是两个人格。平常温文尔雅，一辅导作业就变成了喷火龙。',
    nickname: '双面家长',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    likes: 256,
    color: 'purple',
    category: 'homework',
    comment_count: 0
  },
  {
    id: '4',
    content: '有没有同款娃？吃饭像吃药，吃零食像饿狼。一到饭点就肚子疼，一说吃冰淇淋立马生龙活虎。',
    nickname: '干饭人他妈',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    likes: 89,
    color: 'green',
    category: 'funny',
    comment_count: 0
  },
  {
    id: '5',
    content: '今天老师在群里点名表扬了，虽然不是我家娃，但我也跟着激动了半天。卑微家长的日常。',
    nickname: '潜水员',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    likes: 15,
    color: 'gray',
    category: 'school',
    comment_count: 0
  }
]
