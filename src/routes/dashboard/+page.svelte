<script>
	import { onMount } from 'svelte';

	/** @type {any[]} */
	let tasks = [];
	let newTaskTitle = '';
	let newTaskDescription = '';
	let loading = false;
	let error = '';
	/** @type {Record<string, any>} */
	let activeTimers = {}; // Map of taskId -> timer info
	/** @type {Record<string, string>} */
	let taskTimerDisplays = {}; // Map of taskId -> display string
	/** @type {Record<string, any[]>} */
	let taskTimeLogs = {}; // Map of taskId -> array of time logs
	/** @type {Record<string, number>} */
	let taskTotalTimes = {}; // Map of taskId -> total time in seconds
	/** @type {Record<string, boolean>} */
	let expandedTasks = {}; // Map of taskId -> boolean for showing time logs
	/** @type {Record<string, boolean>} */
	let editingTasks = {}; // Map of taskId -> boolean for editing mode
	/** @type {Record<string, any>} */
	let editFormData = {}; // Map of taskId -> { title, description }
	/** @type {number} */
	let timerInterval;

	// Reactive statement to ensure UI updates when activeTimers changes
	$: activeTimerCount = Object.keys(activeTimers).length;

onMount(() => {
		loadTasks();
		checkActiveTimers();

		// Update timer displays every second
		timerInterval = setInterval(() => {
			if (Object.keys(activeTimers).length > 0) {
				updateAllTimerDisplays();
			}
		}, 1000);

		return () => clearInterval(timerInterval);
	});

	async function loadTasks() {
		try {
			const response = await fetch('/api/tasks');
			if (response.ok) {
				const data = await response.json();
				tasks = data.tasks;
				// Load time logs for all tasks
				for (const task of tasks) {
					await loadTaskTimeLogs(task._id);
				}
			} else if (response.status === 401) {
				window.location.href = '/';
			}
		} catch (err) {
			console.error('Error loading tasks:', err);
		}
	}

	/**
	 * @param {any} taskId
	 */
	async function loadTaskTimeLogs(taskId) {
		try {
			const response = await fetch(`/api/timelogs/${taskId}`);
			if (response.ok) {
				const data = await response.json();
				taskTimeLogs[taskId] = data.timeLogs || [];
				taskTotalTimes[taskId] = data.totalTime || 0;
			}
		} catch (err) {
			console.error('Error loading time logs:', err);
		}
	}

	async function checkActiveTimers() {
		try {
			const response = await fetch('/api/timer/active');
			if (response.ok) {
				const data = await response.json();
				// Convert array to map by taskId
				/** @type {Record<string, any>} */
				const newActiveTimers = {};
				if (data.activeTimers && data.activeTimers.length > 0) {
					for (const timer of data.activeTimers) {
						newActiveTimers[timer.taskId.toString()] = timer;
					}
				}
				// Force reactivity by reassigning
				activeTimers = { ...newActiveTimers };
				// Immediately update displays after loading
				updateAllTimerDisplays();
				// Force UI update
				tasks = [...tasks];
			}
		} catch (err) {
			console.error('Error checking timers:', err);
		}
	}

	function updateAllTimerDisplays() {
		/** @type {Record<string, string>} */
		const newDisplays = {};
		for (const [taskId, timer] of Object.entries(activeTimers)) {
			newDisplays[taskId] = formatTimerDisplay(timer.startTime);
		}
		// Force reactivity by creating new object
		taskTimerDisplays = { ...newDisplays };
	}

	/**
	 * @param {string | Date} startTime
	 */
	function formatTimerDisplay(startTime) {
		const start = new Date(startTime);
		const now = new Date();
		const diff = Math.floor((now.getTime() - start.getTime()) / 1000);

		const hours = Math.floor(diff / 3600);
		const minutes = Math.floor((diff % 3600) / 60);
		const seconds = diff % 60;

		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	async function createTask() {
		if (!newTaskTitle.trim()) return;

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					title: newTaskTitle, 
					description: newTaskDescription 
				})
			});

			if (response.ok) {
				newTaskTitle = '';
				newTaskDescription = '';
				await loadTasks();
			} else {
				const data = await response.json();
				error = data.error || 'Failed to create task';
			}
		} catch (err) {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	/**
	 * @param {any} taskId
	 */
	async function startTimer(taskId) {
		try {
			const response = await fetch('/api/timer/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId })
			});

			if (response.ok) {
				await checkActiveTimers();
				await loadTasks();
			} else {
				const data = await response.json();
				alert(data.error || 'Failed to start timer');
			}
		} catch (err) {
			alert('Network error');
		}
	}

	/**
	 * @param {any} taskId
	 */
	async function stopTimer(taskId) {
		try {
			const response = await fetch('/api/timer/stop', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId })
			});

			if (response.ok) {
				// Create new objects to force reactivity
				const newActiveTimers = { ...activeTimers };
				delete newActiveTimers[taskId];
				activeTimers = newActiveTimers;
				
				const newDisplays = { ...taskTimerDisplays };
				delete newDisplays[taskId];
				taskTimerDisplays = newDisplays;
				
				await loadTasks();
			}
		} catch (err) {
			alert('Network error');
		}
	}

	/**
	 * @param {any} taskId
	 * @param {string} newStatus
	 */
	async function updateTaskStatus(taskId, newStatus) {
		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});

			if (response.ok) {
				await loadTasks();
			}
		} catch (err) {
			console.error('Error updating task:', err);
		}
	}

	/**
	 * @param {any} task
	 */
	function startEditingTask(task) {
		editingTasks[task._id.toString()] = true;
		editFormData[task._id.toString()] = {
			title: task.title,
			description: task.description || ''
		};
		editingTasks = editingTasks; // trigger reactivity
	}

	/**
	 * @param {any} taskId
	 */
	function cancelEditingTask(taskId) {
		delete editingTasks[taskId.toString()];
		delete editFormData[taskId.toString()];
		editingTasks = editingTasks; // trigger reactivity
	}

	/**
	 * @param {any} taskId
	 */
	async function saveTaskEdit(taskId) {
		const data = editFormData[taskId.toString()];
		if (!data || !data.title.trim()) {
			alert('Task title cannot be empty');
			return;
		}

		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: data.title,
					description: data.description
				})
			});

			if (response.ok) {
				delete editingTasks[taskId.toString()];
				delete editFormData[taskId.toString()];
				editingTasks = editingTasks; // trigger reactivity
				await loadTasks();
			} else {
				const errorData = await response.json();
				alert(errorData.error || 'Failed to update task');
			}
		} catch (err) {
			alert('Network error while updating task');
		}
	}

	/**
	 * @param {any} taskId
	 */
	async function deleteTask(taskId) {
		if (!confirm('Are you sure you want to delete this task?')) return;

		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadTasks();
			}
		} catch (err) {
			alert('Failed to delete task');
		}
	}

	async function logout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/';
		} catch (err) {
			console.error('Logout error:', err);
		}
	}

	/**
	 * @param {any} task
	 */
	function getTaskClass(task) {
		if (task.status === 'Completed') return 'task-completed';
		if (isTaskActive(task)) return 'task-active';
		return '';
	}

	/**
	 * @param {any} task
	 */
	function isTaskActive(task) {
		return activeTimers[task._id.toString()] !== undefined;
	}

	function getActiveTimerCount() {
		return Object.keys(activeTimers).length;
	}

	/**
	 * @param {number} seconds
	 */
	function formatTime(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	/**
	 * @param {string} dateString
	 */
	function formatDateTime(dateString) {
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	/**
	 * @param {string} taskId
	 */
	function toggleTaskLogs(taskId) {
		expandedTasks[taskId] = !expandedTasks[taskId];
		expandedTasks = expandedTasks; // trigger reactivity
	}

	/**
	 * @param {string} taskId
	 */
	function getTotalTimeWithActive(taskId) {
		let total = taskTotalTimes[taskId] || 0;
		// Add active timer time if running
		if (activeTimers[taskId]) {
			const start = new Date(activeTimers[taskId].startTime);
			const now = new Date();
			const activeSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
			total += activeSeconds;
		}
		return total;
	}
</script>

<svelte:head>
	<title>Dashboard - Time Tracker</title>
</svelte:head>

<div class="dashboard">
	<header class="header">
		<h1>⏱️ Time Tracker</h1>
		<div class="header-actions">
			{#if activeTimerCount > 0}
				<span class="active-count">{activeTimerCount} timer{activeTimerCount > 1 ? 's' : ''} running</span>
			{/if}
			<a href="/summary" class="btn-link">Summary</a>
			<button on:click={logout} class="btn-logout">Logout</button>
		</div>
	</header>

	<main class="main">
		<div class="tasks-container">
			<h2>Your Tasks</h2>

			<div class="tasks-list">
				{#if tasks.length === 0}
					<p class="empty-state">No tasks yet. Create your first task below!</p>
				{:else}
					{#each tasks as task (task._id)}
						<div class="task-card {getTaskClass(task)}">
							{#if editingTasks[task._id.toString()]}
								<!-- Edit Mode -->
								<div class="task-edit-form">
									<input
										type="text"
										bind:value={editFormData[task._id.toString()].title}
										placeholder="Task title"
										class="edit-input edit-title"
									/>
									<textarea
										bind:value={editFormData[task._id.toString()].description}
										placeholder="Description (optional)"
										class="edit-input edit-description"
										rows="3"
									></textarea>
									<div class="edit-actions">
										<button on:click={() => saveTaskEdit(task._id)} class="btn-action btn-save">
											Save
										</button>
										<button on:click={() => cancelEditingTask(task._id)} class="btn-action btn-cancel">
											Cancel
										</button>
									</div>
								</div>
							{:else}
								<!-- View Mode -->
								<div class="task-header">
									<h3 class="task-title">{task.title}</h3>
									<div class="task-header-right">
										{#if isTaskActive(task)}
											<span class="task-timer">{taskTimerDisplays[task._id.toString()] || '00:00:00'}</span>
										{/if}
										<span class="task-status status-{task.status.toLowerCase().replace(' ', '-')}">
											{task.status}
										</span>
									</div>
								</div>

								{#if task.description}
									<p class="task-description">{task.description}</p>
								{/if}
							{/if}

							<div class="task-stats">
								<span class="total-time">
									⏱ Total: {formatTime(getTotalTimeWithActive(task._id.toString()))}
								</span>
								{#if taskTimeLogs[task._id.toString()] && taskTimeLogs[task._id.toString()].length > 0}
									<button 
										on:click={() => toggleTaskLogs(task._id.toString())} 
										class="btn-logs"
									>
										{expandedTasks[task._id.toString()] ? '▼' : '▶'} 
										{taskTimeLogs[task._id.toString()].length} session{taskTimeLogs[task._id.toString()].length > 1 ? 's' : ''}
									</button>
								{/if}
							</div>

							{#if expandedTasks[task._id.toString()] && taskTimeLogs[task._id.toString()]}
								<div class="time-logs">
									<table class="logs-table">
										<thead>
											<tr>
												<th>Start</th>
												<th>End</th>
												<th>Duration</th>
											</tr>
										</thead>
										<tbody>
											{#each taskTimeLogs[task._id.toString()] as log}
												<tr>
													<td>{formatDateTime(log.startTime)}</td>
													<td>{log.endTime ? formatDateTime(log.endTime) : 'Active'}</td>
													<td>{log.endTime ? formatTime(log.duration) : 'Running...'}</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}

							{#if !editingTasks[task._id.toString()]}
								<div class="task-actions">
									{#if task.status !== 'Completed'}
										{#if isTaskActive(task)}
											<button on:click={() => stopTimer(task._id)} class="btn-action btn-stop-small">
												⏹ Stop Timer
											</button>
										{:else}
											<button on:click={() => startTimer(task._id)} class="btn-action btn-start">
												▶ Start Timer
											</button>
										{/if}

										<select
											value={task.status}
											on:change={(e) => {
												const target = /** @type {HTMLSelectElement} */ (e.target);
												updateTaskStatus(task._id, target.value);
											}}
											class="status-select"
											disabled={isTaskActive(task)}
											title={isTaskActive(task) ? 'Stop timer to change status' : ''}
										>
											<option value="Pending">Pending</option>
											<option value="In Progress">In Progress</option>
											<option value="Completed">Completed</option>
										</select>

										<button 
											on:click={() => startEditingTask(task)} 
											class="btn-action btn-edit"
											disabled={isTaskActive(task)}
											title={isTaskActive(task) ? 'Stop timer to edit task' : ''}
										>
											✏️ Edit
										</button>

										<button 
											on:click={() => deleteTask(task._id)} 
											class="btn-action btn-delete"
											disabled={isTaskActive(task)}
											title={isTaskActive(task) ? 'Stop timer to delete task' : ''}
										>
											Delete
										</button>
									{:else}
										<div class="task-actions">
											<span class="completed-label">✓ Task Completed</span>
											<button on:click={() => deleteTask(task._id)} class="btn-action btn-delete">
												Delete
											</button>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</main>

	<div class="input-container">
		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		<form on:submit|preventDefault={createTask} class="task-input-form">
			<div class="input-fields">
				<input
					type="text"
					bind:value={newTaskTitle}
					placeholder="Task title - What are you working on?"
					class="task-input"
					disabled={loading}
				/>
				<input
					type="text"
					bind:value={newTaskDescription}
					placeholder="Description (optional)"
					class="task-input task-description-input"
					disabled={loading}
				/>
			</div>
			<button type="submit" class="btn-submit" disabled={loading || !newTaskTitle.trim()}>
				{loading ? 'Adding...' : 'Add Task'}
			</button>
		</form>
	</div>
</div>

<style>
	.dashboard {
		min-height: 100vh;
		background: #f7fafc;
		display: flex;
		flex-direction: column;
	}

	.header {
		background: white;
		padding: 1rem 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.header h1 {
		font-size: 1.5rem;
		color: #1a202c;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.active-count {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: 600;
		font-size: 0.875rem;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.8; }
	}

	.btn-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.btn-link:hover {
		background: #f7fafc;
	}

	.btn-logout {
		padding: 0.5rem 1rem;
		background: #fc8181;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-logout:hover {
		background: #f56565;
	}

	.main {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		padding: 2rem;
		padding-bottom: 180px; /* Space for sticky input */
		overflow-y: auto;
	}

	.tasks-container {
		flex: 1;
	}

	.tasks-container h2 {
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.tasks-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.empty-state {
		text-align: center;
		color: #718096;
		padding: 3rem 1rem;
		font-size: 1.1rem;
	}

	.task-card {
		background: white;
		padding: 1.25rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.2s;
	}

	.task-card:hover {
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.task-active {
		border-left: 4px solid #667eea;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	}

	.task-completed {
		opacity: 0.7;
		background: #f7fafc;
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 0.75rem;
		gap: 1rem;
	}

	.task-header-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.task-timer {
		font-family: 'Courier New', monospace;
		font-size: 1.1rem;
		font-weight: 700;
		color: #667eea;
		background: rgba(102, 126, 234, 0.1);
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		font-variant-numeric: tabular-nums;
	}

	.task-title {
		font-size: 1.1rem;
		color: #1a202c;
		margin: 0;
		flex: 1;
	}

	.task-status {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.status-pending {
		background: #feebc8;
		color: #c05621;
	}

	.status-in-progress {
		background: #bee3f8;
		color: #2c5282;
	}

	.status-completed {
		background: #c6f6d5;
		color: #276749;
	}

	.task-description {
		color: #718096;
		margin: 0 0 0.75rem 0;
		font-size: 0.9rem;
	}

	.task-stats {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.75rem;
		padding: 0.5rem;
		background: #f7fafc;
		border-radius: 6px;
	}

	.total-time {
		font-weight: 600;
		color: #2d3748;
		font-size: 0.9rem;
	}

	.btn-logs {
		background: transparent;
		border: none;
		color: #667eea;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.85rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.btn-logs:hover {
		background: rgba(102, 126, 234, 0.1);
	}

	.time-logs {
		margin-bottom: 0.75rem;
		background: #f7fafc;
		border-radius: 6px;
		padding: 0.75rem;
		overflow-x: auto;
	}

	.logs-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	.logs-table th {
		text-align: left;
		padding: 0.5rem;
		border-bottom: 2px solid #e2e8f0;
		color: #4a5568;
		font-weight: 600;
	}

	.logs-table td {
		padding: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
		color: #2d3748;
	}

	.logs-table tbody tr:last-child td {
		border-bottom: none;
	}

	.logs-table tbody tr:hover {
		background: rgba(102, 126, 234, 0.05);
	}

	.task-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.btn-action {
		padding: 0.5rem 0.75rem;
		border: none;
		border-radius: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-action:hover:not(:disabled) {
		opacity: 0.8;
	}

	.btn-start {
		background: #48bb78;
		color: white;
	}

	.btn-stop-small {
		background: #fc8181;
		color: white;
	}

	.btn-delete {
		background: #cbd5e0;
		color: #2d3748;
	}

	.btn-delete:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.status-select {
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.status-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #f7fafc;
	}

	.completed-label {
		color: #276749;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.input-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		padding: 1.5rem;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.task-input-form {
		display: flex;
		gap: 0.75rem;
		max-width: 1200px;
		margin: 0 auto;
		align-items: flex-end;
	}

	.input-fields {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.task-input {
		width: 100%;
		padding: 0.875rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.task-input:focus {
		outline: none;
		border-color: #667eea;
	}

	.btn-edit {
		background: #667eea;
		color: white;
	}

	.btn-edit:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-save {
		background: #48bb78;
		color: white;
	}

	.btn-cancel {
		background: #cbd5e0;
		color: #2d3748;
	}

	.task-edit-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.edit-input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		font-size: 0.95rem;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	.edit-input:focus {
		outline: none;
		border-color: #667eea;
	}

	.edit-title {
		font-size: 1rem;
		font-weight: 600;
	}

	.edit-description {
		resize: vertical;
		min-height: 60px;
	}

	.edit-actions {
		display: flex;
		gap: 0.5rem;
	}

	.task-description-input {
		font-size: 0.9rem;
		padding: 0.625rem 0.875rem;
	}

	.btn-submit {
		padding: 0.875rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s;
		white-space: nowrap;
		height: fit-content;
	}

	.btn-submit:hover:not(:disabled) {
		transform: translateY(-2px);
	}

	.btn-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.error-message {
		background: #fed7d7;
		color: #c53030;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;
	}

	@media (max-width: 768px) {
		.header {
			padding: 1rem;
		}

		.main {
			padding: 1rem;
			padding-bottom: 220px;
		}

		.input-container {
			padding: 1rem;
		}

		.task-input-form {
			flex-direction: column;
		}

		.btn-submit {
			width: 100%;
		}

		.task-header {
			flex-direction: column;
			gap: 0.5rem;
		}

		.task-header-right {
			justify-content: flex-start;
		}
	}
</style>
