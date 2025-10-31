const axios = require('axios');

/**
 * Twitter API integration via RapidAPI Twitter154
 * Polls @mentions of the XFundDex handle
 */

/**
 * Fetch mentions of @XFundDex handle
 * sinceId: only return tweets newer than this ID
 * Returns: array of tweet objects
 */
async function fetchMentions(sinceId = null) {
  const handle = process.env.TWITTER_HANDLE || 'XFundDex';
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST;

  if (!apiKey || !apiHost) {
    throw new Error('Twitter API credentials not configured');
  }

  try {
    // Note: You may need to adjust the endpoint based on Twitter154 API documentation
    // This is a template - verify the actual endpoint structure
    const options = {
      method: 'GET',
      url: `https://${apiHost}/search/search`,
      params: {
        query: `@${handle}`,
        section: 'latest',
        limit: '50'
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };

    const response = await axios.request(options);

    // Extract tweets from response
    // This structure may need adjustment based on actual API response
    const tweets = response.data?.results || [];

    // Filter by sinceId if provided
    let filteredTweets = tweets;
    if (sinceId) {
      filteredTweets = tweets.filter(tweet => {
        const tweetId = tweet.tweet_id || tweet.id;
        return BigInt(tweetId) > BigInt(sinceId);
      });
    }

    // Normalize tweet structure
    return filteredTweets.map(tweet => ({
      id: tweet.tweet_id || tweet.id,
      text: tweet.text || tweet.full_text,
      author: {
        username: tweet.user?.username || tweet.user?.screen_name,
        id: tweet.user?.id_str || tweet.user?.id
      },
      created_at: tweet.creation_date || tweet.created_at
    }));

  } catch (error) {
    console.error('Error fetching mentions:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Get user info by username (for verification)
 */
async function getUserByUsername(username) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST;

  try {
    const options = {
      method: 'GET',
      url: `https://${apiHost}/user/details`,
      params: {
        username: username.replace('@', '')
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };

    const response = await axios.request(options);
    return response.data;

  } catch (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
}

module.exports = {
  fetchMentions,
  getUserByUsername
};
