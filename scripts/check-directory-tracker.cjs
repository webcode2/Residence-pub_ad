// Run with: node scripts/check-directory-tracker.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const ts = require('typescript');
let snapshot;
const filename = require('node:path').resolve(__dirname, '../src/components/LandlordOnboardingTracker.tsx');
const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
const compiled = {exports:{}};
vm.runInNewContext(source, {module:compiled,exports:compiled.exports,require(name){
 if(name === '@tanstack/react-query') return {useQuery:()=>snapshot};
 if(name === '@/actions/directory') return {getOnboardingJobs:async()=>[],retryOnboardingJob:async()=>{}};
 if(name === '@/components/LandlordImportFiles') return {LandlordImportFiles:()=>React.createElement('div',null,'Saved file controls')};
 if(name === '@/components/ui/button') return {Button:({children,variant,...props})=>React.createElement('button',props,children)};
 return require(name);
}}, {filename});
function render(data,version=0,isError=false) {
 snapshot={data,isError,isLoading:false,isFetching:false,refetch:async()=>{}};
 return renderToStaticMarkup(React.createElement(compiled.exports.LandlordOnboardingTracker,{version}));
}
const job={id:'job',batch_id:'batch',email:'host@example.com',full_name:'Host',house_number:'12',attempts:0,last_error:null,next_attempt_at:null};
let html=render([]);
assert(!html.includes('Directory import</h2>'));
assert(!html.includes('Loading jobs'));
assert(!html.includes('Saved file controls'));
assert(!render(undefined,0,true).includes('role="alert"'));
html=render([{...job,status:'failed'}]);
assert(html.includes('1 import jobs need attention'));
assert(!html.includes('<table'));
html=render([{...job,status:'processing'}],1);
assert(html.includes('Directory import</h2>'));
assert(html.includes('processing'));
assert(!html.includes('Saved file controls'));
html=render([{...job,status:'sent'}],1);
assert(!html.includes('<table'));
assert(!html.includes('Directory import</h2>'));
html=render(undefined,1,true);
assert(html.includes('role="alert"'));
assert(!html.includes('No imports to display'));
console.log('Directory tracker checks passed: idle hidden, failures flagged, upload progress shown, success collapsed.');
