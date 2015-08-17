var config = {};
/* Examples
config.twitter = {};
config.redis = {};
config.web = {};

config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];
config.twitter.user_name = process.env.TWITTER_USER || 'username';
config.twitter.password=  process.env.TWITTER_PASSWORD || 'password';
config.redis.uri = process.env.DUOSTACK_DB_REDIS;
config.redis.host = 'hostname';
config.redis.port = 6379;
config.web.port = process.env.WEB_PORT || 9980;
*/
config.SiteSubFolder = "/WTA.Schedules";
config.rootPath = "/tmp";
config.s3Options = {
  //accessKeyId: "",
  //secretAccessKey: "+",
  region: "us-east-1",
  //logger: console,
  sslEnabled: false
  // any other options are passed to new AWS.S3()
  // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
};
config.PushBucket = "testschedules.ridewta.com";
config.ReleaseBucket = "schedules.ridewta.com";
config.TestCommitURL = "https://github.com/whatcomtrans/WTA.Scheduler/archive/master.zip";

module.exports = config;
