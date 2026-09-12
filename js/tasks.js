export class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('focusflow-tasks')) || [];
        this.activeTaskId = localStorage.getItem('focusflow-active-task') || null;
        
        this.taskListEl = document.getElementById('task-list');
        this.newTaskInput = document.getElementById('new-task-input');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.activeTaskDisplay = document.getElementById('active-task-display');
        
        this.init();
    }

    init() {
        this.render();
        
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
    }

    addTask() {
        const text = this.newTaskInput.value.trim();
        if (!text) return;
        
        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };
        
        this.tasks.push(task);
        this.save();
        
        if (this.tasks.length === 1) {
            this.setActiveTask(task.id);
        }
        
        this.newTaskInput.value = '';
        this.render();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        if (this.activeTaskId === id) {
            this.setActiveTask(null);
        }
        this.save();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (task.completed && this.activeTaskId === id) {
                this.setActiveTask(null);
            }
            this.save();
            this.render();
        }
    }

    setActiveTask(id) {
        this.activeTaskId = id;
        if (id) {
            localStorage.setItem('focusflow-active-task', id);
        } else {
            localStorage.removeItem('focusflow-active-task');
        }
        this.updateActiveTaskDisplay();
        this.render();
    }

    updateActiveTaskDisplay() {
        if (!this.activeTaskDisplay) return;
        
        const container = document.getElementById('active-task-container');
        const activeTask = this.tasks.find(t => t.id === this.activeTaskId);
        if (activeTask && !activeTask.completed) {
            this.activeTaskDisplay.textContent = activeTask.text;
            if (container) container.style.display = 'flex';
        } else {
            this.activeTaskDisplay.textContent = '';
            if (container) container.style.display = 'none';
        }
    }

    save() {
        localStorage.setItem('focusflow-tasks', JSON.stringify(this.tasks));
    }

    render() {
        if (!this.taskListEl) return;
        
        this.taskListEl.innerHTML = '';
        this.updateActiveTaskDisplay();
        
        if (this.tasks.length === 0) {
            this.taskListEl.innerHTML = '<div class="text-center text-slate-500 text-sm py-4">No tasks yet. Add one above!</div>';
            return;
        }

        this.tasks.forEach(task => {
            const div = document.createElement('div');
            const isActive = this.activeTaskId === task.id;
            
            // Base styles
            let containerClasses = 'task-item group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 ';
            let checkboxClasses = 'task-checkbox w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ';
            let textClasses = 'task-text text-sm truncate cursor-pointer ';
            
            if (task.completed) {
                containerClasses += 'bg-slate-900/30 border border-slate-800/50';
                checkboxClasses += 'bg-emerald-500 border-emerald-500 text-slate-950';
                textClasses += 'font-normal text-slate-500 line-through';
            } else if (isActive) {
                containerClasses += 'bg-slate-800/40 hover:bg-slate-800/70 border border-sky-500/30 hover:border-sky-500/50 shadow-sm';
                checkboxClasses += 'border-sky-400/80 hover:border-sky-300 bg-sky-500/10 text-transparent';
                textClasses += 'font-semibold text-white';
            } else {
                containerClasses += 'bg-slate-800/20 hover:bg-slate-800/50 border border-slate-700/40 hover:border-slate-600';
                checkboxClasses += 'border-slate-500 hover:border-sky-400 text-transparent';
                textClasses += 'font-normal text-slate-200';
            }

            div.className = containerClasses;
            
            div.innerHTML = `
              <div class="flex items-center gap-3.5 flex-1 min-w-0">
                <button class="${checkboxClasses}" data-id="${task.id}">
                  <svg class="w-3 h-3 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="${task.completed ? '' : 'display:none;'}">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <span class="${textClasses}" data-id="${task.id}">${task.text}</span>
                ${isActive && !task.completed ? '<span class="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">Current</span>' : ''}
              </div>
              <button class="delete-btn opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-2" data-id="${task.id}" title="Delete Task">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            `;
            
            const checkbox = div.querySelector('.task-checkbox');
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTask(task.id);
            });
            
            const textSpan = div.querySelector('.task-text');
            textSpan.addEventListener('click', () => {
                if (!task.completed) {
                    this.setActiveTask(task.id);
                }
            });
            
            const deleteBtn = div.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask(task.id);
            });
            
            this.taskListEl.appendChild(div);
        });
    }
}
