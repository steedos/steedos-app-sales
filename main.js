var fs = require("fs");
var path = require("path");
var yaml = require('js-yaml');
var mkdirp = require('mkdirp');

var appFileName = 'app.json'
var appObjectFolderName = 'objects'
var appSrcDirectory = path.join(__dirname, "src");

var loadJSONFile = function(filePath){
    return JSON.parse(fs.readFileSync(filePath, 'utf8').normalize('NFC'));
}

var loadYmlFile = function(filePath){
    var doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
    return doc
}

var loadFile = function(filePath){
    console.info('loadFile', filePath);
    try {
        var extname = path.extname(filePath)
        if(extname.toLocaleLowerCase() == '.json')
            return loadJSONFile(filePath)
        else if(extname.toLocaleLowerCase() == '.yml')
            return loadYmlFile(filePath)
    } catch (error) {
        console.error('loadFile error', filePath, error)
        return {}
    }
}

var loadApp = function(appFilePath){
    var app = loadFile(appFilePath)
    if(!_.isEmpty(app)){
        Creator.Apps[app.name] = app
    }
}

var loadObject = function(objectPath){
    var appObj =loadFile(objectPath)
    if(!_.isEmpty(appObj)){
        Creator.Objects[appObj.name] = appObj
        Creator.fiberLoadObjects(appObj)
    }
}

if(fs.statSync(appSrcDirectory).isDirectory()){
    fs.readdir(appSrcDirectory, function(err, appFiles){
        var appFilePath = path.join(appSrcDirectory, appFileName)
        if(fs.existsSync(appFilePath)){
            loadApp(appFilePath)
            fs.watchFile(appFilePath, (curr, prev) => {
                loadApp(appFilePath)
            });
        }
        var appObjectFolderPath = path.join(appSrcDirectory, appObjectFolderName)
        if(fs.existsSync(appObjectFolderPath)){
            fs.readdir(appObjectFolderPath, function(err, appObjectFiles){
                _.each(appObjectFiles, function(aof){
                    var objectPath = path.join(appObjectFolderPath, aof)
                    loadObject(objectPath)
                    fs.watchFile(objectPath, (curr, prev) => {
                        loadObject(objectPath)
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

// 将Creator.Objects 转为yaml文件存在本地
if (Creator.Objects) {
    let ymlObjDirectory = path.resolve(path.join(__dirname, "yaml"));
    mkdirp.sync(ymlObjDirectory);
    _.each(Creator.Objects, function(obj) {
        let objFilePath = path.resolve(path.join(ymlObjDirectory, obj.name + '.yml'));
        let dataStr = yaml.dump(obj);
        fs.writeFileSync(objFilePath, dataStr);
    })
}