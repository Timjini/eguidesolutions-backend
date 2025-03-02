const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const Channel = require('../models/Channels');

class AgoraChannel {
  constructor(channelCode) {
    if (!channelCode) {
      throw new Error('Channel code is required');
    }
    this.channelCode = channelCode;
    this.channel = null;
  }

  /**
   * Load channel details from the database.
   */
  async loadChannel() {
    this.channel = await Channel.findOne({ code: this.channelCode });
    if (!this.channel) {
      throw new Error('Channel does not exist');
    }
  }

  /**
   * Generate a new Agora token.
   */
  generateAgoraToken() {
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryDuration = 1 * 86400; // token valid for 7 days

    return RtcTokenBuilder.buildTokenWithUid(
      process.env.APP_KEY,
      process.env.APP_CERTIFICATE,
      this.channelCode,
      0,
      RtcRole.PUBLISHER,
      currentTime + expiryDuration,
      currentTime + expiryDuration
    );
  }

  /**
   * Fetch or generate an Agora token.
   */
  async getOrCreateToken() {
    await this.loadChannel();

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpiry = this.channel.tokenExpiry || 0;

    if (currentTime >= tokenExpiry) {
      const newToken = this.generateAgoraToken();
      this.channel.agoraToken = newToken;
      this.channel.tokenExpiry = currentTime + 1 * 86400; //  expiry
      await this.channel.save();
    }

    return this.channel.agoraToken;
  }

  /**
   * Check if the channel is closed or inactive.
   */
  async isChannelClosed() {
    await this.loadChannel();
    return this.channel.closed || false;
  }

  /**
   * Ensure the channel is active or regenerate the token.
   */
  async ensureChannelActive() {
    const isClosed = await this.isChannelClosed();
    if (isClosed) {
      console.warn(`Channel ${this.channelCode} is closed. Attempting to regenerate token.`);
      return this.getOrCreateToken();
    }

    return this.channel.agoraToken;
  }
}

module.exports = AgoraChannel;