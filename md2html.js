const streamReadAll = require('stream-read-all')
const showdown = require('showdown');
const converter = new showdown.Converter();
const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

const stylefile = './mdstyle.css'
var cssstr = ''
readFile(stylefile).then(data => {
  cssstr = data.toString()
})

class Md2html {
  optionDefinitions() {
    return [
      { name: 'Md2html', type: String, description: 'A middleware to make markdown body to html.' }
    ]
  }
  middleware(config) {
    return async function (ctx, next) {
      /* First, execute downstream middleware to create the response */
      await next()

      /* Edit the response */
      if (ctx.type == 'text/markdown') {


        const responseBodyBuffer = await streamReadAll(ctx.response.body)
        const htmlHead = '<!DOCTYPE html>\n<html>\n<head>\n<meta http-equiv="content-type" content="text/html; charset=utf-8">\n'
        const stylestr = '<style>' + cssstr + '</style>\n</head>\n<body>\n'
        const htmlFoot = '\n</body>\n</html>'
        let body = responseBodyBuffer.toString()
        body = converter.makeHtml(body)
        ctx.response.type = 'text/html'
        ctx.response.body = htmlHead + stylestr + body + htmlFoot
      }

    }
  }
}

module.exports = Md2html
