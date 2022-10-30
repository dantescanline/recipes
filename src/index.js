import { Remarkable } from 'remarkable';

import fs from 'fs/promises'

const recipesPath = './website/recipes'

var md = new Remarkable();


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
  const wrapperTemplate = await getWrapper()

  for (const fileObj of recipes) {
    const f = await fs.readFile(fileObj.path, 'utf-8')
    //apples
    const rendered = md.render(f)

    let newPage = wrapperTemplate
    newPage = newPage.replace('{{style-path}}', '../style.css')
    newPage = newPage.replace('{{body}}', rendered)

    // write out
    await fs.mkdir('./dist/recipes/', { recursive: true })
    await fs.writeFile(`./dist/recipes/${fileObj.name}.html`, newPage)
  }
}

// for css etc
async function copyStaticFiles() {
  await fs.copyFile('./website/style.css', './dist/style.css')
}

async function clearDistDirectory() {

}

renderRecipes()
copyStaticFiles()
console.log('✔️  build succceed?')