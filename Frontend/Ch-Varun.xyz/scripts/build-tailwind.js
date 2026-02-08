const fs = require('fs')
const path = require('path')
const postcss = require('postcss')

async function build() {
  const inputPath = path.resolve(__dirname, '../src/styles/tailwind.css')
  const css = fs.readFileSync(inputPath, 'utf8')
  const plugins = [
    require('@tailwindcss/postcss'),
    require('autoprefixer')
  ]

  const result = await postcss(plugins).process(css, { from: inputPath })
  const outDir = path.resolve(__dirname, '../dist')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'tailwind-built.css'), result.css, 'utf8')
  console.log('Wrote', path.join(outDir, 'tailwind-built.css'))
}

build().catch(err => {
  console.error(err)
  process.exit(1)
})

