import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const roots=['src','shared','worker'];
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const errors=[];
for(const file of roots.flatMap(files).filter(f=>/\.(ts|tsx|css)$/.test(f))){
 const text=fs.readFileSync(file,'utf8');
 if(text.split('\n').length>201)errors.push(`${file}: exceeds 200 lines`);
 if(/\bconsole\.log\b|!important|\.ant-[\w-]+/.test(text))errors.push(`${file}: debug or style override`);
 if(file.endsWith('tokens.css'))continue;
 if(/#[\da-fA-F]{3,8}\b/.test(text))errors.push(`${file}: raw hex color`);
 if(/\bany\b/.test(text))errors.push(`${file}: any type`);
 if(/<table\b|dangerouslySetInnerHTML/.test(text))errors.push(`${file}: raw HTML table or HTML bridge`);
 if(!/\.tsx?$/.test(file))continue;
 const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
 function visit(node){
  if((ts.isFunctionDeclaration(node)||ts.isArrowFunction(node)||ts.isFunctionExpression(node))&&node.body){const start=source.getLineAndCharacterOfPosition(node.getStart()).line,end=source.getLineAndCharacterOfPosition(node.end).line;if(end-start+1>50)errors.push(`${file}:${start+1}: function ${node.name?.getText()||'callback'} exceeds 50 lines (${end-start+1})`);}
  ts.forEachChild(node,visit);
 }
 visit(source);
}
if(errors.length){process.stderr.write(errors.join('\n')+'\n');process.exitCode=1;}else process.stdout.write('Rule checks passed.\n');
