import Link from 'next/link'
import { Info, Mail, MessageCircle } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 font-mono">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-black text-white shadow-[4px_4px_0_0_#00ff00]">
          <Info size={24} />
        </div>
        <h1 className="text-3xl font-black text-black uppercase tracking-tighter">关于我们</h1>
      </div>

      <div className="space-y-8">
        <section className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="mb-4 text-xl font-black text-black uppercase">ParentRant 是个啥？</h2>
          <div className="space-y-4 text-black font-bold leading-relaxed">
            <p>
              这里是个匿名吐槽的树洞。不管你是被娃气疯的家长，还是被作业压垮的学生，亦或是被奇葩家长折磨的老师，都能来这儿倒苦水。
            </p>
            <p>
              说白了，生活就是一地鸡毛。来这随便喷，别憋着！骂完你会发现——哇靠，原来大家日子都这么难过，瞬间心理平衡，明天继续苟着！
            </p>
          </div>
        </section>

        <section className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="mb-4 text-xl font-black text-black uppercase">这破站的规矩</h2>
          <ul className="space-y-4 text-black">
            <li className="flex gap-3">
              <div className="mt-1 h-3 w-3 flex-none border-2 border-black bg-[#00ff00]" />
              <div>
                <span className="font-black text-black uppercase">关于隐私：</span>
                <span className="font-bold">谁知道你是谁啊？不用注册，直接开喷。别担心被班主任请喝茶，也别怕被爸妈混合双打，主打一个安全。</span>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 h-3 w-3 flex-none border-2 border-black bg-[#ffc0cb]" />
              <div>
                <span className="font-black text-black uppercase">关于广告：</span>
                <span className="font-bold">放心，没那玩意儿。没有弱智算法猜你喜欢，也没弹窗恶心你。只有最真实的崩溃瞬间，纯粹得一塌糊涂。</span>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 h-3 w-3 flex-none border-2 border-black bg-black" />
              <div>
                <span className="font-black text-black uppercase">关于喷人：</span>
                <span className="font-bold">大家日子都不好过，来这就图个爽。可以吐槽老师变态、作业太多，但别搞真的网暴。咱们是以此为乐，不是来结仇的。</span>
              </div>
            </li>
          </ul>
        </section>

        <section className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="mb-4 text-xl font-black text-black uppercase">被举报了？莫慌！</h2>
          <div className="space-y-4 text-black font-bold leading-relaxed">
            <p>
              如果你的帖子被举报了，说明你可能喷得太火爆，或者不小心踩到了某些“红线”。
            </p>
            <p>
              别急着砸键盘，如果是误伤，直接找站长申诉。咱们这儿虽然鼓励开喷，但底线还是得守：不搞人身攻击，不传谣，不搞颜色。只要你是正经吐槽，站长挺你！
            </p>
          </div>
        </section>

        <section className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="mb-4 text-xl font-black text-black uppercase">联系我们</h2>
          <p className="mb-6 text-black font-bold">
            如果您有任何建议、反馈，或者只是想找人聊聊，欢迎通过以下方式联系我们：
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a 
              href="mailto:parentsuppet@1145game.cn" 
              className="flex items-center justify-center gap-2 border-2 border-black bg-white px-6 py-3 font-black text-black transition-all hover:bg-[#00ff00] hover:shadow-[4px_4px_0_0_black] hover:-translate-y-1"
            >
              <Mail size={18} />
              <span>发送邮件</span>
            </a>
            <div className="flex items-center justify-center gap-2 border-2 border-black bg-white px-6 py-3 font-black text-black transition-all hover:bg-[#ffc0cb] hover:shadow-[4px_4px_0_0_black] hover:-translate-y-1">
              <MessageCircle size={18} />
              <span>站长QQ：3169581862</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
