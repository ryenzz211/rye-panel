const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'frontend/views/bots/index.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Fix session button
content = content.replace(
  /openSessionModal\('(\${bot\.id})','(\${bot\.display_name \|\| bot\.name})'\)/g,
  'openSessionModal(\'${bot.id}\', \'${bot.display_name || bot.name}\'.replace(/'/g, "\\\\'"))'
);

fs.writeFileSync(filePath, content);
console.log('✅ Fixed session button');
