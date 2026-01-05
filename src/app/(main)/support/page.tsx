'use client'

import { Coffee, Heart } from 'lucide-react'

export default function SupportPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Coffee size={32} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">支持我们</h1>
        <p className="mt-4 text-lg text-slate-600">
          如果您喜欢 ParentRant，欢迎请开发者喝杯咖啡，这将支持我们持续维护和更新。
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* WeChat Pay */}
        <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="mb-6 rounded-lg bg-[#2aad67] p-3 text-white">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.9 15.6c.3-.8.4-1.6.4-2.5 0-3.6-3.4-6.6-7.6-6.6-4.2 0-7.6 3-7.6 6.6 0 3.6 3.4 6.6 7.6 6.6.9 0 1.8-.1 2.6-.4.2.1.6.3 1.5.8.5.3 1 .4 1.1.4.1-.1.1-.3 0-.4-.1-.4-.3-1-.5-1.5zM8.8 11.2c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zm4.8 0c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zM7.5 7.6c-2.9 0-5.3-2.1-5.3-4.7s2.4-4.7 5.3-4.7c2.9 0 5.3 2.1 5.3 4.7.1 2.6-2.3 4.7-5.3 4.7zm-1.8-5.8c-.4 0-.8.3-.8.7s.3.7.8.7.8-.3.8-.7-.4-.7-.8-.7zm3.7 0c-.4 0-.8.3-.8.7s.3.7.8.7.8-.3.8-.7-.4-.7-.8-.7z"/>
            </svg>
          </div>
          <h3 className="mb-6 text-xl font-bold text-slate-900">微信支付</h3>
          <div className="aspect-square w-64 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden relative group">
            {/* 
              Use a real image path. Users should place their QR codes in public/images/ 
              Example: public/images/wechat-pay.jpg
            */}
            <img 
              src="/images/wechat-pay.jpg" 
              alt="微信收款码" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-slate-400 font-medium absolute text-center px-4">
              暂未配置收款码
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-500">打开微信扫一扫</p>
        </div>

        {/* Alipay */}
        <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="mb-6 rounded-lg bg-[#1677ff] p-3 text-white">
            <svg className="h-8 w-8" viewBox="0 0 1024 1024" fill="currentColor">
              <path d="M512 0C229.23 0 0 229.23 0 512s229.23 512 512 512 512-229.23 512-512S794.77 0 512 0zm267.3 334.4c-12.8 0-25.6-1.6-38.4-3.2-6.4-1.6-12.8-1.6-19.2-3.2-12.8-1.6-25.6-3.2-38.4-4.8l-1.6 44.8c62.4 6.4 126.4 14.4 188.8 24l-8 44.8c-28.8-4.8-59.2-9.6-88-12.8-28.8-3.2-59.2-6.4-88-9.6l-1.6 28.8c57.6 14.4 113.6 35.2 166.4 64l-24 43.2c-48-27.2-99.2-48-152-60.8l-3.2 57.6c67.2 27.2 126.4 68.8 174.4 121.6l-35.2 36.8c-43.2-48-96-84.8-155.2-108.8-33.6 72-83.2 134.4-145.6 182.4-52.8 40-112 60.8-172.8 60.8-54.4 0-104-16-144-46.4-36.8-28.8-57.6-67.2-57.6-108.8 0-46.4 20.8-89.6 59.2-120 41.6-33.6 96-51.2 153.6-51.2 46.4 0 91.2 11.2 132.8 33.6l3.2-52.8c-52.8-4.8-105.6-8-158.4-11.2l6.4-44.8c54.4 3.2 108.8 6.4 160 11.2l1.6-30.4c-52.8-4.8-107.2-8-160-9.6L328 264c67.2 1.6 134.4 4.8 201.6 11.2l1.6-43.2H254.4v-48h302.4v44.8l1.6 32c12.8 1.6 25.6 1.6 38.4 3.2 12.8 1.6 25.6 1.6 38.4 3.2l-1.6 44.8c-12.8-1.6-25.6-3.2-38.4-3.2-12.8-1.6-25.6-3.2-38.4-3.2l-3.2 60.8c25.6 1.6 51.2 4.8 75.2 8 25.6 3.2 51.2 6.4 75.2 9.6l-1.6 46.4zM326.4 766.4c46.4 0 91.2-16 131.2-46.4 49.6-36.8 89.6-86.4 116.8-144-80 17.6-166.4 16-248-6.4-43.2 0-83.2 12.8-113.6 36.8-27.2 22.4-43.2 52.8-43.2 86.4 0 62.4 67.2 73.6 156.8 73.6z"/>
            </svg>
          </div>
          <h3 className="mb-6 text-xl font-bold text-slate-900">支付宝</h3>
          <div className="aspect-square w-64 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden relative group">
            {/* 
              Use a real image path. Users should place their QR codes in public/images/ 
              Example: public/images/alipay.jpg
            */}
            <img 
              src="/images/alipay.jpg" 
              alt="支付宝收款码" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-slate-400 font-medium absolute text-center px-4">
              暂未配置收款码
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-500">打开支付宝扫一扫</p>
        </div>
      </div>

      <div className="mt-12 rounded-xl bg-blue-50 p-8 text-center">
        <Heart className="mx-auto mb-4 text-blue-500" size={32} />
        <h2 className="mb-2 text-xl font-bold text-blue-900">感谢您的支持</h2>
        <p className="mx-auto max-w-2xl text-blue-700">
          每一份支持都是我们前进的动力。我们会继续努力，为您提供更好的吐槽体验。
          所有赞助将用于服务器维护、域名续费以及开发新的功能。
        </p>
      </div>
    </main>
  )
}
