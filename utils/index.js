const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY, PRIVATE_KEY_AES } = require('./constant')
md5 = (s) => {
  return crypto.createHash('md5')
  .update(String(s)).digest('hex')
}


//请求头token
decoded = (req) => {
  let token = req.get('Authorization')
  if (token) {
    if (token.indexOf('Bearer ') >= 0) {
      token = token.replace('Bearer ', '')
    }
    return jwt.verify(token, PRIVATE_KEY)
  }
}

//聊天token
decodedTwo = (token) => {
  return jwt.verify(token, PRIVATE_KEY)
}
/**
 * AES加密的配置 
 * 1.密钥
 * 2.偏移向量 
 * 3.算法模式CBC 
 * 4.补全值
 */
const AES_conf = {
  key: PRIVATE_KEY_AES, //密钥
  iv: '1012132405963708', //偏移向量
  padding: 'PKCS7Padding' //补全值
}

/**
 * AES_128_CBC 加密 
 * 128位 
 * return base64
 */
aesEncryption = (data) => {
  let key = AES_conf.key;
  let iv = AES_conf.iv;
  // let padding = AES_conf.padding;

  var cipherChunks = [];
  var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  cipher.setAutoPadding(true);
  cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
  cipherChunks.push(cipher.final('base64'));
  return cipherChunks.join('');
}

/**
* 解密
* return utf8
*/
aesDecryption = (data) => {

  let key = AES_conf.key;
  let iv = AES_conf.iv;
  // let padding = AES_conf.padding;

  var cipherChunks = [];
  var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
  cipherChunks.push(decipher.final('utf8'));
  return cipherChunks.join('');
}

module.exports = {
  md5,
  decoded,
  aesDecryption,
  aesEncryption,
  decodedTwo
}