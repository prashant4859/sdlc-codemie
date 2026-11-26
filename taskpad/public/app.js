const list = document.getElementById('list');

async function load() {
  const tasks = await (await fetch('/api/tasks')).json();
  list.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t.title + ' ';
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = async () => { await fetch('/api/tasks/' + t.id, { method: 'DELETE' }); load(); };
    li.appendChild(del);
    list.appendChild(li);
  });
}

document.getElementById('add').onclick = async () => {
  const title = document.getElementById('title').value;
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  document.getElementById('title').value = '';
  load();
};

load();