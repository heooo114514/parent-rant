import Link from 'next/link'
import { Info, Mail, MessageCircle } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Info size={24} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">关于我们</h1>
      </div>

      <div className="space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <h2 className="mb-4 text-xl font-bold text-slate-900">ParentRant 是个啥？</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              这里是个匿名吐槽的树洞。不管你是被娃气疯的家长，还是被作业压垮的学生，亦或是被奇葩家长折磨的老师，都能来这儿倒苦水。
            </p>
            <p>
              说白了，生活就是一地鸡毛。来这随便喷，别憋着！骂完你会发现——哇靠，原来大家日子都这么难过，瞬间心理平衡，明天继续苟着！
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <h2 className="mb-4 text-xl font-bold text-slate-900">这破站的规矩</h2>
          <ul className="space-y-4 text-slate-600">
            <li className="flex gap-3">
              <div className="mt-1 h-2 w-2 flex-none rounded-full bg-blue-500" />
              <div>
                <span className="font-semibold text-slate-900">关于隐私：</span>
                谁知道你是谁啊？不用注册，直接开喷。别担心被班主任请喝茶，也别怕被爸妈混合双打，主打一个安全。
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 h-2 w-2 flex-none rounded-full bg-blue-500" />
              <div>
                <span className="font-semibold text-slate-900">关于广告：</span>
                放心，没那玩意儿。没有弱智算法猜你喜欢，也没弹窗恶心你。只有最真实的崩溃瞬间，纯粹得一塌糊涂。
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 h-2 w-2 flex-none rounded-full bg-blue-500" />
              <div>
                <span className="font-semibold text-slate-900">关于喷人：</span>
                大家日子都不好过，来这就图个爽。可以吐槽老师变态、作业太多，但别搞真的网暴。咱们是以此为乐，不是来结仇的。
              </div>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <h2 className="mb-4 text-xl font-bold text-slate-900">联系我们</h2>
          <p className="mb-6 text-slate-600">
            如果您有任何建议、反馈，或者只是想找人聊聊，欢迎通过以下方式联系我们：
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a 
              href="parentsuppet@1145game.cn" 
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
            >
              <Mail size={18} />
              <span>发送邮件</span>
            </a>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-6 py-3 font-medium text-slate-700">
              <MessageCircle size={18} />
              <span>QQ群：目前还没有呢</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
