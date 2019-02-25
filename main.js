var fs = require("fs");
var path = require("path");
// var chokidar = require('chokidar')

var appFileName = 'app.json'
var appObjectFolderName = 'objects'
var appSrcDirectory = path.join(__dirname, "src");

if(fs.statSync(appSrcDirectory).isDirectory()){
    fs.readdir(appSrcDirectory, function(err, appFiles){
        var appFilePath = path.join(appSrcDirectory, appFileName)
        if(fs.existsSync(appFilePath)){
            var app = JSON.parse(fs.readFileSync(appFilePath, 'utf8').normalize('NFC'))
            Creator.Apps[app.name] = app

            fs.watchFile(appFilePath, (curr, prev) => {
                var app = JSON.parse(fs.readFileSync(appFilePath, 'utf8').normalize('NFC'))
                Creator.Apps[app.name] = app
            });
        }
        var appObjectFolderPath = path.join(appSrcDirectory, appObjectFolderName)
        if(fs.existsSync(appObjectFolderPath)){
            fs.readdir(appObjectFolderPath, function(err, appObjectFiles){
                _.each(appObjectFiles, function(aof){
                    var objectPath = path.join(appObjectFolderPath, aof)
                    console.log('objectPath', objectPath);
                    var appObj = JSON.parse(fs.readFileSync(objectPath, 'utf8').normalize('NFC'))
                    Creator.Objects[appObj.name] = appObj
                    Creator.loadObjects(appObj)
                    fs.watchFile(objectPath, (curr, prev) => {
                        var appObj = JSON.parse(fs.readFileSync(objectPath, 'utf8').normalize('NFC'))
                        Creator.Objects[appObj.name] = appObj
                        Creator.fiberLoadObjects(appObj)
                    });
                })
            })
        }
    })

    //监控apps文件夹变化
    fs.watch(appSrcDirectory, function(eventType, filename){
        console.log('fs.watch', eventType, filename);
    })
}