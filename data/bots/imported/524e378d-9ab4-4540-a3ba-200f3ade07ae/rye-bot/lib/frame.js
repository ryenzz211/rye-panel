function frame(title, lines = []) {
  let text = `╭─「 ${title} 」\n│\n`;
  for (const line of lines) {
    text += `│ ${line}\n`;
  }
  text += `╰─────────────────`;
  return text;
}
module.exports = { frame };
