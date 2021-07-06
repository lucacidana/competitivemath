const sharp = require('sharp')

const resizeImages = async (req, res, next) => {
  if (!req.files.files) return next()

  req.body.images = []
  await Promise.all(
    req.files.files.map(async (file) => {
      req.body.images.push(
        new Buffer.from(
          await sharp(file.buffer).jpeg({ quality: 80 }).toBuffer()
        ).toString('base64')
      )
    })
  )

  next()
}

module.exports = resizeImages
