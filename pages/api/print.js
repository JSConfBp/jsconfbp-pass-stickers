
import cheerio from 'cheerio'
import { readFileSync } from 'fs';
import { promisify } from 'util'
import { writeFile } from 'fs/promises'
const exec = promisify(require('child_process').exec);

const scripts = process.cwd() + '/scripts'
const templates = process.cwd() + '/templates'

const leftTemplate = readFileSync(`${templates}/pass-sticker-left.svg`)
const rightTemplate = readFileSync(`${templates}/pass-sticker-right.svg`)

const printer = async (template, data) => {
  const $ = cheerio.load(`${template}`, {
    xmlMode: true,
    decodeEntities: false, 
  });

  $('#firstname').text(data.firstname);
  $('#lastname').text(data.lastname);
  $('#twitter').text(data.twitterhandle);

  await writeFile(`${scripts}/source.svg`, $.html(), { mode: 0o777})
  const { stdout, stderr } = await exec(`./print.sh "${scripts}/source.svg"`, {
    cwd: scripts
  })

  console.log('stdout:', stdout);
  console.error('stderr:', stderr);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {    
    try {
      const data = JSON.parse(req.body);
      await printer(leftTemplate, data);
      await printer(rightTemplate, data);
      res.status(200).json({});
    } catch (e) {
      console.error(e);
      res.status(503).json({ error: e });
    }
  } else {
    res.status(404);
  }
}