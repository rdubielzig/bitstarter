#!/usr/bin/env node

/* grade input files for the presence of specified HTML tags & attributes. */

var fs = require('fs');
var cmd = require('commander');
var chr = require('cheerio');
var rst = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if( !fs.existsSync(instr) ) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};
 

var cheerioHtmlFile = function(htmlfile, cb) {
    fs.readFile(htmlfile, 'utf-8', function(err, data) {
	if( err ) {
	    console.log(err);
	    process.exit(1)
	}
	cb(chr.load(data));
    });
};

var cheerioUrl = function(url, cb) {
    rst.get(url).on('complete', function(result) {
	if( result instanceof Error ) {
	    console.log("url %s didn't load. Exiting", url);
	    process.exit(1);
	} else {
	    cb(chr.load(result));
	}
    });
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};


var checkHtmlFile = function(file, checksfile, isUrl) {
    isUrl = isUrl || false;
    var checkCallback = function(htmldata) {
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks) {
	    var present = htmldata(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}
	console.log(JSON.stringify(out, null, 4));
    }
    if( isUrl ) {
	cheerioUrl(file, checkCallback);
    } else {
	cheerioHtmlFile(file, checkCallback);
    }
};

var clone = function(fn) {
    return fn.bind({});
};

if( require.main == module ) {
    cmd
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html')
	.option('-u, --url <url>', 'URL of HTML file to check')
	.parse(process.argv);

    console.log("cmd.file is %s and cmd.url is %s", cmd.file, cmd.url);

    if (cmd.url) {
	checkHtmlFile(cmd.url, cmd.checks, true);
    } else if (cmd.file) {
	checkHtmlFile(cmd.file, cmd.checks, false);
    } else {
	checkHtmlFile(HTMLFILE_DEFAULT, cmd.checks, false)
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
    
