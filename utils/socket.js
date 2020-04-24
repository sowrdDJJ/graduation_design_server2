const {decodedTwo, aesDecryption} = require('../utils/index.js')
const fs = require('fs')
const path = require('path')
Socket = (user_FriendList, io)  => {
        io.on('connection', function (socket) {
            let dialogueInformation = ''
            socket.on('Bconnection', (data) => {
                data = decodedTwo(data).currUserId
                user_FriendList.forEach(e => {
                    // console.log(e)
                    if (e.id == data) {
                        e.socket = socket
                    }
                })
            })
            socket.on('connection', function (data) {
                io.set('origins', 'http://192.168.43.102:8080');
                data.userId = decodedTwo(data.userId).currUserId
                data.dialogueObject = aesDecryption(data.dialogueObject)
                dialogueInformation = data
                // sendid 接收的对象soket的ID，这个ID是每次用户登录网页都会生成而且每次都不一样
                const sendid = user_FriendList.find(e => e.id == data.dialogueObject)
                if (sendid) {
                    if (sendid.socket.id) {
                        dialogueInformation.idntity = 'other'
                        sendid.socket.emit('airContent', dialogueInformation)
                    }
                    dialogueInformation.idntity = 'self'
                    socket.emit('airContent', dialogueInformation)
                    //读当前接收的用户的聊天文件
                    let objectUserDialogues = fs.readFileSync(path.join(__dirname, '..', 'public', data.dialogueObject + '.json'), 'utf-8', (err, data) => {
                        if (err) {
                            return err
                        }
                        return data
                    })
                    //读当前发送的用户的聊天文件
                    let currUserDialogues = fs.readFileSync(path.join(__dirname, '..', 'public', data.userId + '.json'), 'utf-8', (err, data) => {
                        if (err) {
                            return err
                        }
                        return data
                    })
                    
                    let Springboard = JSON.parse(currUserDialogues)
                    let currUserRelationShipIdVf = false
                    Springboard.userId.forEach(e => {
                        if (e.relationShipId == data.dialogueObject) {
                            currUserRelationShipIdVf = true
                        }
                    })
                    if (currUserRelationShipIdVf) {
                        Springboard.userId.forEach(e => {
                            if (e.relationShipId == data.dialogueObject) {
                                e.dialogueContent.push({
                                    "dialogueId": e.dialogueContent.length,
                                    "userId": parseInt(dialogueInformation.userId),
                                    "dialogueContent": dialogueInformation.userDialogueContent
                                })
                            }
                        })
                    } else {
                        Springboard.userId.push({
                            "relationShipId": data.dialogueObject,
                            "dialogueContent": [
                                {
                                    "dialogueId": 0,
                                    "userId": parseInt(dialogueInformation.userId),
                                    "dialogueContent": dialogueInformation.userDialogueContent
                                }
                            ]
                        })
                    }
                    currUserDialogues = Springboard
                    fs.writeFile(path.join(__dirname, '..','public', JSON.parse(data.userId) + '.json'), JSON.stringify(currUserDialogues), (err) => {
                        if (err) {
                            console.log(err)
                        }
                    })

                    let SpringboardObject = JSON.parse(objectUserDialogues)
                    let objectUserRelationShipIdVf = false
                    SpringboardObject.userId.forEach(e => {
                        if (e.relationShipId == data.userId) {
                            objectUserRelationShipIdVf = true
                        }
                    })
                    if (objectUserRelationShipIdVf) {
                        SpringboardObject.userId.forEach(e => {
                            if (e.relationShipId == data.userId) {
                                e.dialogueContent.push({
                                    "dialogueId": e.dialogueContent.length,
                                    "userId": parseInt(dialogueInformation.userId),
                                    "dialogueContent": dialogueInformation.userDialogueContent
                                })
                            }
                        })
                    } else {
                        SpringboardObject.userId.push({
                            "relationShipId": data.userId,
                            "dialogueContent": [
                                {
                                    "dialogueId": 0,
                                    "userId": parseInt(dialogueInformation.userId),
                                    "dialogueContent": dialogueInformation.userDialogueContent
                                }
                            ]
                        })
                    }
                    objectUserDialogues = SpringboardObject
                    fs.writeFile(path.join(__dirname, '..','public', JSON.parse(data.dialogueObject) + '.json'), JSON.stringify(objectUserDialogues), (err) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                }
            });
        });        
    }
module.exports = Socket
