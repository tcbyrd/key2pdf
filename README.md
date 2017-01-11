# key2pdf
Scripts and tools for transforming keynote files to PDF

key2pdf can run as a script or as a server.  As a script, key2pdf either:

 - Traverses a specified repository, finding all keynote files, converting them to PDF, and then uploading the resulting PDFs back into the repository
 - Finds and converts a single keynote file

Converted PDFs are committed to GitHub in the same path as their source keynote files.

Conversion is done using the [CloudConvert API](https://cloudconvert.com/api).  You'll need a cloudconvert API token in order to use the service

## Setup
Clone the repository, then run 
`script/bootstrap.sh`

## Configuration
The bootstrap script creates the /job and /log directories.  You'll need to copy `job-template-exmample.json` to `job-template.json` and edit the values to 
match your environment.  The only edits you'll need to make to run are in the `job.config` element:

`{`<br>
   `"GitHubPAT":"<yourPAT>"` <br>
   `,"targetRepo":"testrepo"` <br>
   `,"targetBranch":"master"` <br>
   `,"targetHost":"github.com"` <br>
   `,"user":"bryancross"` <br>
   `,"authType":"oauth"` <br>
  `,"cloudConvertAPIToken":"<your CloudConvert API token>"` <br>
  `,"commitMsg":"Auto committed by key2pdf"` <br>
  `,"deleteTempDir":true` <br>
  `,"userAgent":"key2pdf"` <br>
  `,"listenOnPort":3000` <br>
     `,"callback": ""` <br>
      `,"debug":false` <br>
`}`

| Parameter | Notes |
|-----------|-------|
| `GitHubPAT` | Properly scoped Personal Access Token for the target repository (`targetRepo`)|
| `targetRepo` | Repository to search for keynote files|
| `targetBranch` | Target branch to search for keynote files|
| `targetHost` | Host where `targetRepo` resides.  Just the hostname, don`t include `/api/v3` etc.|
| `user` | GitHub user corresponding to `GitHubPAT`|
| `authType` | Currently just `oauth`|
| `cloudConvertAPIToken` | API token allowing access to [cloudconvert.com](http://www.cloudconvert.com)|
| `commitMsg` | Commit message for commits of converted PDF files | 
| `deleteTempDir` | If true, delete the temporary working directory on exit.  If false, don't.  Useful for seeing what's actually coming out of the repo or cloudconvert|
| `userAgent` | Value for the `user-agent` header sent to GitHub when the node-github API is initialized | 
| `listenOnPort` | Port on which the server will listen | 
| `callback` | endpoint URL to be called when a conversion job completes | 
| `debug` | If true, create the node-github API instance with `debug=true`.  Otherwise false. |


## Use

run `script/server.js`

The following config parameters are overwritten by values derived from the URL when key2pdf runs in server mode:

 - `targetHost`
 - `owner`
 - `targetRepo`
 - `targetBranch`

#### Endpoints
##### `POST http://<host>:<port>/convert`
##### Parameters
|Name|Type|Description|
|----|----|-----------|
|url  |string|Url to either a specific file in GitHub, or a repository, as explained below|

The URL can point to a specific file on a specific branch, in which case only the specified file will be converted:

`https://github.com/bryancross/testrepo/blob/master/foo/deck1.key`

`{"url":"https://github.com/bryancross/testrepo/blob/master/foo/deck1.key"}`

or to an entire repository, in which case all keynote files in the repository will be converted:

  `https://github.com/bryancross/testrepo`
  
  `{"url":"https://github.com/bryancross/testrepo"}`
  
The server expects URLs to be constructed as they would be if you copied the URL from your browser while viewing a file or repository.

You can replace any value in the `job.config` by passing it in the HTTP request, e.g.,

`var options = "{GitHubPAT:<somepat>"` <br>
`var req = http.request(options, callback);` <br>


 
##### Returns
`convert` will return JSON containing a status message and an ID for the conversion job.  You can use this ID to retrieve the status
of your job.

`{"msg":"Conversion request recieved","jobID":"947f0f5d8cd92e414ac4056365ffe40cadaa75a9"}`

##### `POST http://<host>:<port>/status`
##### Parameters
|Name|Type|Description|
|----|----|-----------|
|jobID |string|ID of a job for which to retrieve status info|

##### Returns 

The endpoint returns JSON containing all status messages generated by 
the conversion process up to the point of the call, as well as the current config parameters, a list of files being converted and, if 
the process has moved far enough, PDF files created and uploaded to GitHub:

`{` <br> 
&nbsp;&nbsp;&nbsp;`"jobID": "fba65bc7c2c07f146ef81207748cba179a950fce",` <br> 
&nbsp;&nbsp;&nbsp;`"StartTime": "2017-01-08T12:40:32.533-06:00",` <br> 
&nbsp;&nbsp;&nbsp;`"msgs": [  //Array of messages emitted by the logger during the conversion run` <br>  
&nbsp;&nbsp;&nbsp;`{` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"time": "2017-01-08T12:40:32.534-06:00",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"msg": "Path: foo/deck1.key"` <br> 
&nbsp;&nbsp;&nbsp;`},` <br> 
&nbsp;&nbsp;&nbsp;`{` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"time": "2017-01-08T12:40:32.534-06:00",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"msg": "Temp directory: ./job/fba65bc7c2c07f146ef81207748cba179a950fce"` <br> 
&nbsp;&nbsp;&nbsp;`},` <br> 
&nbsp;&nbsp;&nbsp;`{` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"time": "2017-01-08T12:40:32.752-06:00",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"msg": "Current commit SHA: 8865ec18bbfb563ee80d15213f518f1b6bd48b45"` <br> 
&nbsp;&nbsp;&nbsp;`},` <br> 
&nbsp;&nbsp;&nbsp;`<<etc>>` <br> 
&nbsp;&nbsp;&nbsp;`],` <br> 
&nbsp;&nbsp;&nbsp;`"config": { //The config, as modified by any URLs or parameters passed in` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"GitHubPAT": "<your properly scoped GitHub PAT>",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"targetRepo": "testrepo",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"targetBranch": "master",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"targetHost": "api.github.com",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"owner": "bryancross",` <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"user": "bryancross",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"authType": "oauth",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"cloudConvertAPIToken": "O_unX3l0OehzUhKfNOz_fczDugrne7ssX-dlD971NYIaLAD0MIYRxIveRf9KN2HWqvmSt2QwoYWt0ycf5auc7Q",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"commitMsg": "Auto committed by key2pdf",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"deleteTempDir": false,` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"userAgent": "key2pdf",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"listenOnPort": 3000,` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"callback": "http://localhost:3001/status",` <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"debug": false,` <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"filePath": "foo/deck2.key", // The path in the repository converted by this run` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"pathPrefix": ""` <br> 
&nbsp;&nbsp;&nbsp;`},` <br> 
&nbsp;&nbsp;&nbsp;`"files": [ // Files identified and sent for conversion` <br> 
&nbsp;&nbsp;&nbsp;`{` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"path": "foo/deck1.key",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"mode": "100644",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"type": "blob",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"sha": "eb1810b784c492d814020a8c0b84e7634e44c4a7",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"size": 1404238,` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"url": &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"https://api.github.com/repos/bryancross/testrepo/git/blobs/eb1810b784c492d814020a8c0b84e7634e44c4a7"` <br> 
&nbsp;&nbsp;&nbsp;`}` <br> 
&nbsp;&nbsp;&nbsp;`],` <br> 
&nbsp;&nbsp;&nbsp;`"PDFs": [ // Resulting PDFs committed to the repo` <br> 
&nbsp;&nbsp;&nbsp;`{` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"path": "foo/deck1.key.pdf",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"type": "blob",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"mode": "100644",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"sha": "e920e4bdbaf733383acdbb236a867e8ec3877b6f",` <br> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`"url": &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"https://api.github.com/repos/bryancross/testrepo/git/blobs/e920e4bdbaf733383acdbb236a867e8ec3877b6f"` <br> 
&nbsp;&nbsp;&nbsp;`}` <br> 
&nbsp;&nbsp;&nbsp;`],` <br> 
&nbsp;&nbsp;&nbsp;`"errors":[]  //Array of any error messages encountered during the conversion run` <br>
&nbsp;&nbsp;&nbsp;`"errorMessage:"" //The last error message received` <br> 
&nbsp;&nbsp;&nbsp;`"status": "Complete",` <br> 
&nbsp;&nbsp;&nbsp;`"tempDir": "./job/fba65bc7c2c07f146ef81207748cba179a950fce",` <br> 
&nbsp;&nbsp;&nbsp;`"endTime": "2017-01-08T12:40:42.330-06:00",` <br> 
&nbsp;&nbsp;&nbsp;`"duration": 9.797` <br> 
`}` <br> 

##Logging
The job object is written out to the `/log` directory.  The filename is the JobID.
 
##Temporary Directories
Job data are stored in a directory in the `/job` directory.  The directory name is the JobID.  If `config.deleteTempDir` = `true`, 
 this directory will be deleted when the conversion job is complete.

##Testing

You can simulate requests to `key2pdf` by running `test/testConvert.sh`.  This script will fire requests based on parameters configured in `test/test-params.json`.  Each of the keys in the `testCases` array replace the matching key in `key2pdf`s global config.  The host, port, and endpoint determine where the HTTP POST request is sent.

`{` <br>
&nbsp;&nbsp;&nbsp; `   "host":"http://localhost"` <br>
&nbsp;&nbsp;&nbsp; `  ,"port":3000` <br>
&nbsp;&nbsp;&nbsp;`  ,"endpoint":"convert"` <br>
&nbsp;&nbsp;&nbsp;`  ,"testCases":[` <br>
&nbsp;&nbsp;&nbsp;`    {` <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`       "GitHubPAT":"<your properly scoped PAT>"` <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`      ,"url":"https://github.com/bryancross/testrepo/blob/master/foo/deck1.key"` <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`      ,"callback":"http://localhost:3001/status"` <br>
&nbsp;&nbsp;&nbsp;`    }` <br>
&nbsp;&nbsp;&nbsp;`    ,  {` <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`    "GitHubPAT":"<your properly scoped PAT>"` <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`  ,"url":"https://github.com/bryancross/testrepo/blob/master/foo/deck2.key"` <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`  ,"callback":"http://localhost:3001/status"` <br>
&nbsp;&nbsp;&nbsp;`  }` <br>
&nbsp;&nbsp;&nbsp;`  ]` <br>
`}` <br> 


