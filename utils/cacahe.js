const fs = require('fs')

let expires = new Date()
const maxAge = 60 * 60 * 24 * 360
expires.setTime(expires.getTime() + maxAge * 1000)

// fs.stat()

module.exports =  {
  fileMatch: /^(gif|png|jpg|js|css)$/ig,
  cache: {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['gif','png', 'jpg', 'js', 'css', 'jpeg'],
    maxAge: expires.toUTCString(),
    index: false,
    redirect: false,
    setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now())
      console.log(path)
    }
  }
}