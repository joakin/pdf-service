const phantom = require('phantom')
const http = require('http')
const url = require('url')
const fs = require('fs')

http.createServer((req, res) => {
  const uri = url.parse(req.url, true)
  if (!uri.query.url) {
    res.statusCode = 400
    res.end('Invalid params')
    return
  }

  console.log(req.url)
  console.log(req.method)
  if (uri.pathname === '/') {
    handlePDFRequest(uri, res)
  } else {
    res.statusCode = 404
    res.end('Not found')
  }
}).listen(process.env.PORT || 3000)

function handlePDFRequest (uri, res) {
  const pdfPath = `out-${Date.now()}-${Math.floor(Math.random() * 1000000)}.pdf`
  var page = null
  var phInstance = null

  var responseActive = true

  res.on('close', () => { responseActive = false })
  res.on('finish', () => { responseActive = false })

  const ifActive = (fn) => {
    if (responseActive) return fn()
    throw new Error('Response closed, cancelling rendering')
  }

  phantom.create().then(instance => {
    phInstance = instance
    return ifActive(() => instance.createPage())
  })
  .then(p => {
    page = p
    return ifActive(() => page.open(uri.query.url))
  })
  .then(status => {
    if (status === 'success') {
      return ifActive(() => page.render(pdfPath))
    } else {
      throw new Error(`Status: ${status}`)
    }
  })
  .then(() => {
    page.close()
    phInstance.exit()

    const removePdf = () =>
      fs.unlink(pdfPath, (err) => { if (err) console.log(err) })

    ifActive(() => {
      var pdf = fs.createReadStream(pdfPath)
      pdf.on('close', removePdf)
      pdf.pipe(res)
    })
  })
  .catch(error => {
    console.log(error)
    phInstance.exit()
    res.statusCode = 500
    res.end(error)
  })
}
