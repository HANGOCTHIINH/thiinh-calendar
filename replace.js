import fs from 'fs';
import path from 'path';

const replacements = {
  'bg-\\[#0b0914\\]': 'bg-bg-base',
  'bg-\\[#151125\\]': 'bg-bg-card',
  'bg-\\[#1f1836\\]': 'bg-bg-card-hover',
  'text-\\[#f8f9fa\\]': 'text-text-main',
  'text-\\[#a4a1b5\\]': 'text-text-muted',
  'border-\\[#2a2344\\]': 'border-slate-200',
  'from-\\[#06b6d4\\]': 'from-blue-500',
  'via-\\[#a855f7\\]': 'via-purple-500',
  'to-\\[#ec4899\\]': 'to-pink-500',
  'text-\\[#06b6d4\\]': 'text-blue-500',
  'bg-\\[#06b6d4\\]': 'bg-blue-500',
  'border-\\[#06b6d4\\]': 'border-blue-500',
  'text-\\[#a855f7\\]': 'text-purple-500',
  'bg-\\[#a855f7\\]': 'bg-purple-500',
  'border-\\[#a855f7\\]': 'border-purple-500',
  'text-\\[#ec4899\\]': 'text-pink-500',
  'bg-\\[#ec4899\\]': 'bg-pink-500',
  'border-\\[#ec4899\\]': 'border-pink-500',
  'text-\\[#d8b4fe\\]': 'text-purple-700',
  'text-\\[#67e8f9\\]': 'text-blue-700',
  'text-\\[#f9a8d4\\]': 'text-pink-700',
  'bg-white/10': 'bg-slate-100',
  'bg-white/5': 'bg-slate-50',
  'hover:bg-white/10': 'hover:bg-slate-100',
  'hover:bg-white/5': 'hover:bg-slate-50',
  'border-white/10': 'border-slate-200',
  'border-white/20': 'border-slate-300',
  'hover:border-white/30': 'hover:border-slate-400',
  'text-white/50': 'text-slate-400',
  'text-white/70': 'text-slate-500',
  'text-white/80': 'text-slate-600',
  'text-white/90': 'text-slate-700',
  'text-white': 'text-slate-800' // this might be risky, but we can fix manually if it breaks buttons
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Specifically fix text-white in buttons that have bg-purple-500, etc. manually later, or adjust the regex
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, 'g');
        content = content.replace(regex, value);
      }
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(process.cwd(), 'src/components'));
processDir(path.join(process.cwd(), 'src/pages'));

console.log('Replacements done.');
