'use client'

import { motion } from 'framer-motion'
import { Mail, Send, MapPin, Phone } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">联系我们</h1>
        <p className="text-xl font-mono font-bold">别憋着，有话直说！</p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="brutalist-card p-8 bg-black text-white"
        >
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <Mail className="text-white" />
            官方渠道
          </h2>
          
          <div className="space-y-6 font-mono">
            <div className="border-b-2 border-white pb-4">
              <p className="text-sm opacity-70 mb-1">商务合作 / 投喂</p>
              <p className="text-lg font-bold">money@parentrant.com</p>
            </div>
            
            <div className="border-b-2 border-white pb-4">
              <p className="text-sm opacity-70 mb-1">用户反馈 / 骂街</p>
              <p className="text-lg font-bold">support@parentrant.com</p>
            </div>

            <div className="pt-2">
              <p className="text-sm opacity-70 mb-1">总部地址</p>
              <div className="flex items-start gap-2">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <p className="font-bold">
                  地球<br/>
                  亚洲<br/>
                  某个被爸妈唠叨的角落
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="brutalist-card p-8 bg-yellow-300"
        >
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <Send className="text-black" />
            快速留言
          </h2>
          
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-bold mb-1 uppercase">你的大名 (可以是假名)</label>
              <input type="text" className="brutalist-input w-full" placeholder="e.g. 绝望的小李" />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-1 uppercase">联系方式</label>
              <input type="email" className="brutalist-input w-full" placeholder="email@example.com" />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-1 uppercase">你想说啥</label>
              <textarea rows={4} className="brutalist-input w-full" placeholder="请开始你的表演..."></textarea>
            </div>
            
            <button className="brutalist-btn w-full justify-center bg-black text-white hover:bg-white hover:text-black">
              发送轰炸
              <Send size={18} className="ml-2" />
            </button>
          </form>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 brutalist-card p-8 bg-white text-center"
      >
        <h3 className="text-2xl font-black uppercase mb-4">或者，直接加群对线？</h3>
        <p className="font-mono mb-6 font-bold">QQ群：1145141919 (暗号：我爱学习)</p>
        <button className="brutalist-btn text-lg px-8">
          一键加群
        </button>
      </motion.div>
    </div>
  )
}
