var fs = require("fs");
var path = require("path");

var appsDirectory = path.join(__dirname, "apps");
var appFileName = 'app.json'
var appObjectFolderName = 'objects'
if(fs.existsSync(appsDirectory)){
    fs.readdir(appsDirectory, function(err, files){
       _.each(files, function(f){
        var curPath = path.join(appsDirectory, f);
            if(fs.statSync(curPath).isDirectory()){
                fs.readdir(curPath, function(err, appFiles){
                    var appFilePath = path.join(curPath, appFileName)
                    if(fs.existsSync(appFilePath)){
                        var app = JSON.parse(fs.readFileSync(appFilePath, 'utf8').normalize('NFC'))
                        Creator.Apps[app.name] = app

                        fs.watchFile(appFilePath, (curr, prev) => {
                            var app = JSON.parse(fs.readFileSync(appFilePath, 'utf8').normalize('NFC'))
                            Creator.Apps[app.name] = app
                        });
                    }
                    var appObjectFolderPath = path.join(curPath, appObjectFolderName)
                    if(fs.existsSync(appObjectFolderPath)){
                        fs.readdir(appObjectFolderPath, function(err, appObjectFiles){
                            _.each(appObjectFiles, function(aof){
                                var objectPath = path.join(appObjectFolderPath, aof)
                                var appObj = JSON.parse(fs.readFileSync(objectPath, 'utf8').normalize('NFC'))
                                Creator.Objects[appObj.name] = appObj
                                Creator.loadObjects(appObj)
                                fs.watchFile(objectPath, (curr, prev) => {
                                    var appObj = JSON.parse(fs.readFileSync(objectPath, 'utf8').normalize('NFC'))
                                    Creator.Objects[appObj.name] = appObj
                                    //Creator.loadObjects(appObj)
                                });
                            })
                        })
                    }
                })
            }
       })
    })
}