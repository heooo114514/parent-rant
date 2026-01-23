const { createClient } = require('@supabase/supabase-js');

const url = 'https://amyvxodpkaygvnkdilzr.supabase.co';
const key = 'sb_publishable_-RnS10TEsw0OYyq7ZbIdFQ_gcn6eyHc';

console.log('Testing Supabase connection...');
console.log('URL:', url);
console.log('Key:', key);

try {
  const supabase = createClient(url, key);
  console.log('Client initialized. Making request...');
  
  supabase.from('posts').select('count', { count: 'exact', head: true })
    .then(({ data, error }) => {
      if (error) {
        console.error('Connection failed with error:', error);
      } else {
        console.log('Connection successful! Status: OK');
      }
    })
    .catch(err => {
        console.error('Request promise rejected:', err);
    });
} catch (e) {
  console.error('Exception during init:', e.message);
}
