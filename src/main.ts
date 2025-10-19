import { supabase } from './lib/supabase';
import './style.css';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

let currentUser: any = null;

function showMessage(text: string, isError = false) {
  const messageEl = document.getElementById('message');
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.className = `message ${isError ? 'error' : 'success'}`;
    messageEl.style.display = 'block';
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  }
}

function showAuthSection() {
  const authSection = document.getElementById('auth-section');
  const appSection = document.getElementById('app-section');
  if (authSection) authSection.style.display = 'block';
  if (appSection) appSection.style.display = 'none';
}

function showAppSection() {
  const authSection = document.getElementById('auth-section');
  const appSection = document.getElementById('app-section');
  if (authSection) authSection.style.display = 'none';
  if (appSection) appSection.style.display = 'block';
}

async function handleLogin() {
  const emailEl = document.getElementById('login-email') as HTMLInputElement;
  const passwordEl = document.getElementById('login-password') as HTMLInputElement;

  const email = emailEl?.value;
  const password = passwordEl?.value;

  if (!email || !password) {
    showMessage('请输入邮箱和密码', true);
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showMessage(`登录失败: ${error.message}`, true);
  } else {
    showMessage('登录成功！');
    currentUser = data.user;
    showAppSection();
    updateUserInfo();
    loadTodos();
  }
}

async function handleSignup() {
  const emailEl = document.getElementById('signup-email') as HTMLInputElement;
  const passwordEl = document.getElementById('signup-password') as HTMLInputElement;

  const email = emailEl?.value;
  const password = passwordEl?.value;

  if (!email || !password) {
    showMessage('请输入邮箱和密码', true);
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    showMessage(`注册失败: ${error.message}`, true);
  } else {
    showMessage('注册成功！请登录');
    if (emailEl) emailEl.value = '';
    if (passwordEl) passwordEl.value = '';
  }
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showMessage(`退出失败: ${error.message}`, true);
  } else {
    currentUser = null;
    showAuthSection();
    showMessage('已退出登录');
  }
}

function updateUserInfo() {
  const userEmailEl = document.getElementById('user-email');
  if (userEmailEl && currentUser) {
    userEmailEl.textContent = currentUser.email;
  }
}

async function loadTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    showMessage(`加载失败: ${error.message}`, true);
    return;
  }

  renderTodos(data || []);
}

function renderTodos(todos: Todo[]) {
  const todosListEl = document.getElementById('todos-list');
  if (!todosListEl) return;

  if (todos.length === 0) {
    todosListEl.innerHTML = '<p class="empty-state">暂无待办事项</p>';
    return;
  }

  todosListEl.innerHTML = todos.map(todo => `
    <div class="todo-item ${todo.completed ? 'completed' : ''}">
      <input
        type="checkbox"
        ${todo.completed ? 'checked' : ''}
        onchange="window.toggleTodo('${todo.id}', ${!todo.completed})"
      />
      <span class="todo-title">${todo.title}</span>
      <button class="delete-btn" onclick="window.deleteTodo('${todo.id}')">删除</button>
    </div>
  `).join('');
}

async function addTodo() {
  const newTodoEl = document.getElementById('new-todo') as HTMLInputElement;
  const title = newTodoEl?.value.trim();

  if (!title) {
    showMessage('请输入待办事项', true);
    return;
  }

  if (!currentUser) {
    showMessage('请先登录', true);
    return;
  }

  const { error } = await supabase
    .from('todos')
    .insert([
      { title, user_id: currentUser.id }
    ]);

  if (error) {
    showMessage(`添加失败: ${error.message}`, true);
  } else {
    if (newTodoEl) newTodoEl.value = '';
    showMessage('添加成功！');
    loadTodos();
  }
}

async function toggleTodo(id: string, completed: boolean) {
  const { error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id);

  if (error) {
    showMessage(`更新失败: ${error.message}`, true);
  } else {
    loadTodos();
  }
}

async function deleteTodo(id: string) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    showMessage(`删除失败: ${error.message}`, true);
  } else {
    showMessage('删除成功！');
    loadTodos();
  }
}

(window as any).toggleTodo = toggleTodo;
(window as any).deleteTodo = deleteTodo;

async function init() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    currentUser = session.user;
    showAppSection();
    updateUserInfo();
    loadTodos();
  } else {
    showAuthSection();
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    (() => {
      if (session) {
        currentUser = session.user;
        showAppSection();
        updateUserInfo();
        loadTodos();
      } else {
        currentUser = null;
        showAuthSection();
      }
    })();
  });

  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const addTodoBtn = document.getElementById('add-todo-btn');
  const newTodoInput = document.getElementById('new-todo') as HTMLInputElement;

  loginBtn?.addEventListener('click', handleLogin);
  signupBtn?.addEventListener('click', handleSignup);
  logoutBtn?.addEventListener('click', handleLogout);
  addTodoBtn?.addEventListener('click', addTodo);

  newTodoInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });
}

init();
