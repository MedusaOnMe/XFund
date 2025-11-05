const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');

/**
 * Twitter API integration
 * - RapidAPI Twitter154 for reading mentions
 * - Official X API v2 for posting tweets
 */

/**
 * Get Official X API v2 client for posting
 */
let twitterClient;

function getTwitterClient() {
  if (!twitterClient) {
    const appKey = process.env.X_API_KEY;
    const appSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      console.warn('Official X API credentials not configured - posting disabled');
      return null;
    }

    twitterClient = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });
  }

  return twitterClient;
}

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
        section: 'top',
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
    return filteredTweets.map(tweet => {
      // Extract media from multiple possible locations
      let media = [];

      // Check various locations where media might be stored
      if (tweet.media && Array.isArray(tweet.media)) {
        media = tweet.media;
      } else if (tweet.entities?.media && Array.isArray(tweet.entities.media)) {
        media = tweet.entities.media;
      } else if (tweet.extended_entities?.media && Array.isArray(tweet.extended_entities.media)) {
        media = tweet.extended_entities.media;
      } else if (tweet.mediaDetails && Array.isArray(tweet.mediaDetails)) {
        media = tweet.mediaDetails;
      } else if (tweet.photos && Array.isArray(tweet.photos)) {
        // Some APIs return photos separately
        media = tweet.photos.map(photo => ({
          type: 'photo',
          url: photo.url || photo.media_url_https || photo.media_url,
          media_url_https: photo.url || photo.media_url_https || photo.media_url
        }));
      }


      return {
        id: tweet.tweet_id || tweet.id,
        text: tweet.text || tweet.full_text,
        author: {
          username: tweet.user?.username || tweet.user?.screen_name,
          id: tweet.user?.id_str || tweet.user?.id
        },
        created_at: tweet.creation_date || tweet.created_at,
        media
      };
    });

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

/**
 * Post a regular tweet from @XFundDex account
 * @param {string} text - Tweet text (max 280 chars)
 * @returns {Promise<object|null>} Tweet data or null if posting disabled
 */
async function postTweet(text) {
  const twitter = getTwitterClient();

  if (!twitter) {
    console.log('Posting disabled - X API credentials not configured');
    return null;
  }

  try {
    const tweet = await twitter.v2.tweet(text);
    console.log(`✅ Tweet posted successfully: https://x.com/XFundDex/status/${tweet.data.id}`);
    return tweet.data;
  } catch (error) {
    console.error('❌ Error posting tweet:', error);
    return null;
  }
}

/**
 * Quote tweet - post with a quote of another tweet
 * @param {string} text - Quote tweet text
 * @param {string} tweetId - ID of tweet to quote
 * @returns {Promise<object|null>} Tweet data or null if posting disabled
 */
async function quoteTweet(text, tweetId) {
  const twitter = getTwitterClient();

  if (!twitter) {
    console.log('Posting disabled - X API credentials not configured');
    return null;
  }

  try {
    const tweet = await twitter.v2.tweet({
      text,
      quote_tweet_id: tweetId
    });
    console.log(`✅ Quote tweet posted successfully: https://x.com/XFundDex/status/${tweet.data.id}`);
    return tweet.data;
  } catch (error) {
    console.error('❌ Error posting quote tweet:', error);
    return null;
  }
}

/**
 * Reply to a tweet
 * @param {string} text - Reply text
 * @param {string} tweetId - ID of tweet to reply to
 * @returns {Promise<object|null>} Tweet data or null if posting disabled
 */
async function replyToTweet(text, tweetId) {
  const twitter = getTwitterClient();

  if (!twitter) {
    console.log('Posting disabled - X API credentials not configured');
    return null;
  }

  try {
    const tweet = await twitter.v2.reply(text, tweetId);
    console.log(`✅ Reply posted successfully: https://x.com/XFundDex/status/${tweet.data.id}`);
    return tweet.data;
  } catch (error) {
    console.error('❌ Error posting reply:', error);
    return null;
  }
}

module.exports = {
  fetchMentions,
  getUserByUsername,
  postTweet,
  quoteTweet,
  replyToTweet
};
