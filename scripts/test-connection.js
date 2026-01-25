const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 尝试从 .env.local 读取配置
let url = 'https://amyvxodpkaygvnkdilzr.supabase.co';
let key = 'sb_publishable_-RnS10TEsw0OYyq7ZbIdFQ_gcn6eyHc';

try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
    if (urlMatch) url = urlMatch[1].trim();
    if (keyMatch) key = keyMatch[1].trim();
  }
} catch (e) {
  console.warn('读取 .env.local 失败，使用硬编码配置');
}

console.log('🚀 开始测试 Supabase 连接...');
console.log('🔗 URL:', url);
console.log('🔑 Key:', key.substring(0, 10) + '...');

async function test() {
  const supabase = createClient(url, key);
  
  console.log('📡 正在发起请求 (5秒超时)...');
  
  const timeout = setTimeout(() => {
    console.error('❌ 请求超时！Supabase 可能连不上，或者 Key 真的有问题。');
    process.exit(1);
  }, 5000);

  try {
    const { data, error } = await supabase.from('posts').select('id').limit(1);
    clearTimeout(timeout);

    if (error) {
      console.error('❌ 连接失败:', error.message);
      if (error.message.includes('JWT')) {
        console.error('👉 提示: 你的 Key 格式看起来不对，Supabase 需要标准的 JWT Anon Key。');
      }
    } else {
      console.log('✅ 连接成功！数据库响应正常。');
    }
  } catch (e) {
    clearTimeout(timeout);
    console.error('💥 发生意外错误:', e.message);
  }
}

test();
