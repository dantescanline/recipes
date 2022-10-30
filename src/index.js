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

  for (const fileObj of recipes) {
    const f = await fs.readFile(fileObj.path, 'utf-8')
    listString += `- [${kebabToTitle(fileObj.name)}](recipes/${fileObj.name}.html)\n`
    await renderPageOut(f, fileObj.name, true)
  }

  // index page
  renderPageOut("# Recipes\n" + listString, 'index', false)
}

// for css etc
async function copyStaticFiles() {
  await fs.copyFile('./website/style.css', './dist/style.css')
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

async function renderPageOut(markdown, filename, isRecipe) {
  let page = await getWrapper()

  const render = md.render(markdown)
  page = page.replace('{{style-path}}', isRecipe ? '../style.css' : 'style.css')
  page = page.replace('{{title}}', kebabToTitle(filename))
  page = page.replace('{{footer}}', `Page rendered at ${new Date().toISOString()}`)
  page = page.replace('{{body}}', render)

  const path = isRecipe ? './dist/recipes/' : './dist/'
  await fs.mkdir(path, { recursive: true })
  await fs.writeFile(path + filename + '.html', page)
}

// ---------- run it!
async function main() {

  await cleanDist()
  await renderRecipes()
  await copyStaticFiles()
  console.log(' ')
  console.log(`Memory used: ${(process.memoryUsage().rss / 1000000).toFixed(1)} MB`)
  console.log('✔️  build succceed')
}
main()