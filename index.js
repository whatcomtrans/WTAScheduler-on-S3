console.log('Loading function');

var fs = require('fs');
var request = require("request");
var AdmZip = require("adm-zip");
var AWS = require("aws-sdk");
var async = require("async")
var s3 = require('s3');


var config = require('./config');

var downloadZip = function(url, file, callback) {
  console.log("starting request")
  var req = request.get(url);
  req.on('error', function(e) {console.log("error on request: " + e); callback(e, null); return;});
  req.on('response', function(response) {
      console.log(response.statusCode); // 200
      var f = fs.createWriteStream(file);
      f.on("error", function(e) {console.log("error on writeable: " + e); callback(e,null); return;})
      console.log("writeable created")
      f.on("finish", function() {
        console.log("file write finished");
        callback(null, file);
        return;
      })
      console.log("starting pipe");
      response.pipe(f);
      return;
  });
};

var syncDir = function(path, s3bucket, s3prefix, callback) {

  var client = s3.createClient({
    maxAsyncS3: 20,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: config.s3Options,
  });

  var params = {
    localDir: path,
    deleteRemoved: true, // default false, whether to remove s3 objects
                         // that have no corresponding local file.

    s3Params: {
      Bucket: s3bucket,
      Prefix: s3prefix,
      // other options supported by putObject, except Body and ContentLength.
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    },
  };
  console.log(s3.getPublicUrlHttp(s3bucket, ""));
  var uploader = client.uploadDir(params);
  uploader.on('error', function(err) {
    console.error("unable to sync:", err.stack);
    callback(err.stack, "");
    return;
  });
  uploader.on('progress', function() {
    //console.log("progress", uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function() {
    console.log("done uploading");
    callback(null, s3bucket);
    return;
  });
  return;
};

var pubToS3 = function(zipURL, s3bucket, context) {
    //Respond to PUSH events from a GitHub repo
    var rootPath = config.rootPath;
    //var commitURL = event.head_commit.url
    //var commitURL = "https://github.com/whatcomtrans/WTA.Scheduler/commit/3bea79c9d8a2adcd40e306dc819580d76d9abfbe"
    //var zipURL = commitURL.replace("commit", "zipball");
    console.log (zipURL);

    var localZipPath = rootPath + "/repo/";
    console.log (localZipPath);

    var localZip = rootPath + "/repo.zip";
    console.log (localZip);

    var contentsPath = rootPath + "/contents";

    var s3prefix = ""

    async.waterfall([
      function(callback) {
        //download the zip file
        downloadZip(zipURL, localZip, callback);
        return;
      },
      function(file, callback) {
        //unzip the file
        var zip = AdmZip(file);
        zip.extractAllTo(localZipPath);
        callback(null, localZipPath);
        return;
      },
      function(zipContents, callback) {
        //find and move subfolder to better location
        //Need to fix the source path from being hardcoded
        fs.renameSync(zipContents + fs.readdirSync(zipContents)[0] + config.SiteSubFolder, contentsPath);
        callback(null,contentsPath);
        return;
      },
      function(path, callback) {
        //Perform ugliffy-js
        callback(null,path);
        return;
      },
      function(path, callback) {
        //Perform ugliffycss
        callback(null,path);
        return;
      },
      function(path,callback) {
        //upload to S3
        syncDir(path, s3bucket, s3prefix, callback);
        return;
      }
    ], function(err, results) {
        if (err) {
          context.fail(err);
        } else {
          context.succeed(results);
        }
    });

};

var handleGitHubEvents = function(event, context) {
  //console.log('Received event:', JSON.stringify(event, null, 2));
  //event.Records.forEach(function(record) {
      // Kinesis data is base64 encoded so decode here
      /*var record = event.Records[0];
      payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
      var githubEvent = JSON.parse(payload);
      //console.log('Decoded payload:', githubEvent);
*/
      //Need to add code to verify "master" branch
      if (config.TestCommitURL) {
        var commitURL = config.TestCommitURL;
      } else {
        var commitURL = githubEvent.head_commit.url
      }
      console.log (commitURL);

      var zipURL = commitURL.replace("commit", "zipball");
      console.log (zipURL);

      //Call the function
      var s3bucket = config.PushBucket;
      pubToS3(zipURL, s3bucket, context);
  //});
}

exports.handleGitHubEvents = handleGitHubEvents;
