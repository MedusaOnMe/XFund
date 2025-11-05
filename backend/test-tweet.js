require('dotenv').config();
const { postTweet } = require('./src/lib/twitter');

async function testPost() {
  console.log('Testing X API posting...\n');

  const testMessage = 'Testing XFundDex posting functionality 🚀';

  console.log(`Attempting to post: "${testMessage}"`);

  const result = await postTweet(testMessage);

  if (result) {
    console.log('\n✅ SUCCESS! Tweet posted.');
    console.log(`Tweet ID: ${result.id}`);
    console.log(`View at: https://x.com/XFundDex/status/${result.id}`);
  } else {
    console.log('\n❌ FAILED to post tweet. Check credentials.');
  }

  process.exit(0);
}

testPost().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
