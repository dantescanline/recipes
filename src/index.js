import { Remarkable } from 'remarkable';


import { exec } from 'child_process'

import fs from 'fs/promises'

const recipesPath = './website/recipes'

var md = new Remarkable();

async function cleanDist() {
  await new Promise((resolve, reject) => {
    exec('rm -r dist', () => {
      console.log('deleted')
      resolve()
    });
  })
}

async function getWrapper() {
  return await fs.readFile('./website/wrapper.html', 'utf-8')
}

// makes a nice array of recipe md files
async function findAllRecipes() {
  const files = await fs.readdir(recipesPath);

  const results = []
  for (const file of files) {
    if (!file.endsWith('.md')) continue

    let resultObject = {
      path: recipesPath + '/' + file,
      name: file.replace('.md', '')
    }
    results.push(resultObject)
  }
  return results
}

async function renderRecipes() {
  const recipes = await findAllRecipes()

  // for index page
  let listString = ''

  let pages = []

  for (const fileObj of recipes) {
    const f = await fs.readFile(fileObj.path, 'utf-8')
    pages.push({
      title: kebabToTitle(fileObj.name),
      path: `recipes/${fileObj.name}.html`,
      image: scrapeHeaderImage(f)
    })
    scrapeHeaderImage(f)
    await renderPageOut(f, fileObj.name, true)
  }

  listString += '<div id="page-header-container">'
  for (const page of pages) {
    listString += `<a href="${page.path}">`
    listString += `<div class="page-header" style="background-image: url(images/${page.image})"><div class="text">${page.title}</div></div>`
    listString += '</a>'
  }
  listString += '</div>'

  let remaining = '- stir fried rice varieties\n- rissotos, mushroom\n- bibimbap stuff\n- bahn mi stuffs (pickles)\n- chinese clear sauce stir fry of 2/3 things\n- really good nachos\n- shepards pie\n- eggplant parm'
  listString += '<h2>Future Recipes</h2>' + md.render(remaining)
  // index page
  renderPageOut("<h1>Recipes</h1><p>Preserving all the recipes I know and love, so when dinner time comes I don't panic and choose death over a delicious meal.</p>" + listString, 'index', false, true)
}

// for css etc
async function copyStaticFiles() {
  await fs.copyFile('./website/style.css', './dist/style.css')
  await fs.copyFile('./website/util.js', './dist/util.js')
  await fs.copyFile('./website/Nunito-VariableFont_wght.ttf', './dist/Nunito-VariableFont_wght.ttf')

  await new Promise((resolve, reject) => {
    exec('cp -r website/images/ dist/', () => {
      resolve()
    });
  })
}

function kebabToTitle(input) {
  let pieces = input.split('-')
  pieces = pieces.map((val) => val.charAt(0).toUpperCase() + val.slice(1))
  return pieces.join(' ')
}

async function renderPageOut(markdown, filename, isRecipe, isHTML) {
  let page = await getWrapper()

  let render = ''
  if (isHTML) {
    render = markdown
  } else {
    render = md.render(markdown)
  }
  page = page.replace('{{style-path}}', isRecipe ? '../style.css' : 'style.css')
  page = page.replace('{{title}}', kebabToTitle(filename))
  page = page.replace('{{footer}}', `Page rendered at ${new Date().toISOString()}`)
  page = page.replace('{{body}}', render)

  const path = isRecipe ? './dist/recipes/' : './dist/'
  await fs.mkdir(path, { recursive: true })
  await fs.writeFile(path + filename + '.html', page)
}


function scrapeHeaderImage(input) {
  const reggie = /\.\.\/images\/(.*\.(?:png|jpe*g|webp))/i
  const result = input.match(reggie)
  if (result && result.length > 0) {
    console.log(result[1])
    return result[1]
  }

  return ''
}

// ---------- run it!
async function main() {
  console.time('time')
  await cleanDist()
  await renderRecipes()
  await copyStaticFiles()
  console.log(' ')
  console.log(`Memory used: ${(process.memoryUsage().rss / 1000000).toFixed(1)} MB`)
  console.timeEnd('time')
  console.log('✔️  build succceed')
}

main()