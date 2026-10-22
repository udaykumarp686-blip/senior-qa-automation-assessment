import express from 'express';
import { randomUUID } from 'node:crypto';

const app = express();
app.use(express.json());
type Employee = { id: string; name: string; email: string; role: string; department: string };
const employees = new Map<string, Employee>();
const tokens = new Map<string, { username: string; role: 'Admin' | 'Viewer' }>();
const users = new Map([
  ['admin@example.com', { password: 'Admin123!', role: 'Admin' as const }],
  ['viewer@example.com', { password: 'Viewer123!', role: 'Viewer' as const }]
]);

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  const user = tokens.get(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  (req as any).user = user;
  next();
}
function admin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if ((req as any).user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

app.get('/', (_req, res) => res.type('html').send(`<!doctype html><html><head><title>QA Demo</title></head><body><h1>Employee QA Demo</h1><p>Demo application is running.</p><a href="/login">Open login</a></body></html>`));
app.post('/api/auth/login', (req, res) => {
  const user = users.get(req.body.username);
  if (!user || user.password !== req.body.password) return res.status(401).json({ error: 'Invalid credentials' });
  const token = randomUUID();
  tokens.set(token, { username: req.body.username, role: user.role });
  res.json({ token, role: user.role });
});
app.get('/api/employees', auth, (req, res) => {
  const user = (req as any).user;
  res.json([...employees.values()].filter(e => user.role === 'Admin' || e.role !== 'Admin'));
});
app.post('/api/employees', auth, admin, (req, res) => {
  const { name, email, role, department } = req.body ?? {};
  if (!name || !email || !role || !department) return res.status(400).json({ error: 'Missing required fields' });
  if ([...employees.values()].some(e => e.email === email)) return res.status(409).json({ error: 'Email already exists' });
  const employee = { id: randomUUID(), name, email, role, department };
  employees.set(employee.id, employee);
  res.status(201).json(employee);
});
app.get('/api/employees/:id', auth, (req, res) => {
  const e = employees.get(String(req.params.id));
  return e ? res.json(e) : res.status(404).json({ error: 'Not found' });
});
app.patch('/api/employees/:id', auth, admin, (req, res) => {
 const old = employees.get(String(req.params.id));
  if (!old) return res.status(404).json({ error: 'Not found' });
  const updated = { ...old, ...req.body, id: old.id };
  employees.set(old.id, updated);
  res.json(updated);
});
app.delete('/api/employees/:id', auth, admin, (req, res) => {
  if (!employees.has(String(req.params.id))) {
  employees.delete(String(req.params.id));
}
  employees.delete(String(req.params.id));
  res.status(204).end();
});

const page = (title: string, body: string) => `<!doctype html><html><head><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main>${body}</main><script>
const tokenKey='qa_demo_token';
async function api(path, method='GET', data) {
 const token=localStorage.getItem(tokenKey);
 const r=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(data?{body:JSON.stringify(data)}:{})});
 if(r.status===204)return null; const b=await r.json(); if(!r.ok)throw new Error(b.error||'Request failed'); return b;
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function load(){
 const list=await api('/employees'); const root=document.querySelector('#rows');
 root.innerHTML=list.map(e=>'<tr><td>'+esc(e.name)+'</td><td>'+esc(e.email)+'</td><td>'+esc(e.role)+'</td><td>'+esc(e.department)+'</td><td>'+(window.userRole==='Admin'?'<button data-edit="'+e.id+'">Edit</button> <button data-delete="'+e.id+'">Delete</button>':'')+'</td></tr>').join('');
}
</script></body></html>`;

app.get('/login', (_req, res) => res.type('html').send(page('Sign in', `<h1>Sign in</h1><form id="login"><label>Email <input name="email" type="email" required></label><br><label>Password <input name="password" type="password" required></label><br><button>Sign in</button><p role="alert"></p></form><script>
document.querySelector('#login').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:f.get('email'),password:f.get('password')})});const b=await r.json();if(!r.ok)throw Error(b.error);localStorage.setItem('qa_demo_token',b.token);localStorage.setItem('qa_demo_role',b.role);location.href='/employees';}catch(err){document.querySelector('[role=alert]').textContent=err.message;}});
</script>`)));
app.get('/employees', (_req, res) => res.type('html').send(page('Employees', `<h1>Employees</h1><p id="notice"></p><p id="readonly" hidden>Read-only access</p><button id="add">Add employee</button><button id="logout">Sign out</button>
<table border="1"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Actions</th></tr></thead><tbody id="rows"></tbody></table>
<dialog id="editor"><form id="employeeForm"><h2>Employee details</h2><label>Name <input name="name" required></label><br><label>Email <input name="email" type="email" required></label><br><label>Role <select name="role"><option>Admin</option><option>Manager</option><option>Employee</option><option>Viewer</option></select></label><br><label>Department <input name="department" required></label><br><button>Save employee</button><button type="button" id="cancel">Cancel</button></form></dialog>
<dialog id="confirm"><p>Delete this employee?</p><button id="confirmDelete">Confirm delete</button><button id="cancelDelete">Cancel</button></dialog>
<script>
window.userRole=localStorage.getItem('qa_demo_role'); if(!localStorage.getItem('qa_demo_token'))location.href='/login';
if(window.userRole!=='Admin'){document.querySelector('#add').hidden=true;document.querySelector('#readonly').hidden=false;}
let editingId=null, deletingId=null;
document.querySelector('#add').addEventListener('click',()=>{editingId=null;document.querySelector('#employeeForm').reset();document.querySelector('#employeeForm [name=email]').disabled=false;document.querySelector('#editor').showModal();});
document.querySelector('#cancel').addEventListener('click',()=>document.querySelector('#editor').close());
document.querySelector('#employeeForm').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);const data=Object.fromEntries(f.entries());try{if(editingId)await api('/employees/'+editingId,'PATCH',data);else await api('/employees','POST',data);document.querySelector('#editor').close();await load();}catch(err){document.querySelector('#notice').textContent=err.message;}});
document.querySelector('#rows').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.edit){const all=await api('/employees');const item=all.find(x=>x.id===b.dataset.edit);editingId=item.id;for(const k of ['name','email','role','department'])document.querySelector('#employeeForm [name='+k+']').value=item[k];document.querySelector('#employeeForm [name=email]').disabled=true;document.querySelector('#editor').showModal();}if(b.dataset.delete){deletingId=b.dataset.delete;document.querySelector('#confirm').showModal();}});
document.querySelector('#confirmDelete').addEventListener('click',async()=>{try{await api('/employees/'+deletingId,'DELETE');document.querySelector('#confirm').close();await load();}catch(err){document.querySelector('#notice').textContent=err.message;}});
document.querySelector('#cancelDelete').addEventListener('click',()=>document.querySelector('#confirm').close());
document.querySelector('#logout').addEventListener('click',()=>{localStorage.clear();location.href='/login';});
load().catch(err=>document.querySelector('#notice').textContent=err.message);
</script>`)));
const port = Number(process.env.PORT ?? 3000);
app.listen(port, '0.0.0.0', () => console.log(`QA demo listening on ${port}`));
