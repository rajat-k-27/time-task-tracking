<script>
	import { onMount } from 'svelte';

	let tasks = [];
	let newTaskTitle = '';
	let loading = false;
	let error = '';
	let activeTimer = null;
	let timerDisplay = '00:00:00';
	let timerInterval;

	onMount(async () => {
		await loadTasks();
		await checkActiveTimer();

		// Update timer display every second
		timerInterval = setInterval(() => {
			if (activeTimer) {
				updateTimerDisplay();
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
			} else if (response.status === 401) {
				window.location.href = '/';
			}
		} catch (err) {
			console.error('Error loading tasks:', err);
		}
	}

	async function checkActiveTimer() {
		try {
			const response = await fetch('/api/timer/active');
			if (response.ok) {
				const data = await response.json();
				activeTimer = data.activeTimer;
				if (activeTimer) {
					updateTimerDisplay();
				}
			}
		} catch (err) {
			console.error('Error checking timer:', err);
		}
	}

	function updateTimerDisplay() {
		if (!activeTimer) return;

		const startTime = new Date(activeTimer.startTime);
		const now = new Date();
		const diff = Math.floor((now - startTime) / 1000); // seconds

		const hours = Math.floor(diff / 3600);
		const minutes = Math.floor((diff % 3600) / 60);
		const seconds = diff % 60;

		timerDisplay = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	async function createTask() {
		if (!newTaskTitle.trim()) return;

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: newTaskTitle, description: '' })
			});

			if (response.ok) {
				newTaskTitle = '';
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

	async function startTimer(taskId) {
		try {
			const response = await fetch('/api/timer/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId })
			});

			if (response.ok) {
				await checkActiveTimer();
				await loadTasks();
			} else {
				const data = await response.json();
				alert(data.error || 'Failed to start timer');
			}
		} catch (err) {
			alert('Network error');
		}
	}

	async function stopTimer() {
		try {
			const response = await fetch('/api/timer/stop', {
				method: 'POST'
			});

			if (response.ok) {
				activeTimer = null;
				timerDisplay = '00:00:00';
				await loadTasks();
			}
		} catch (err) {
			alert('Network error');
		}
	}

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

	function getTaskClass(task) {
		if (task.status === 'Completed') return 'task-completed';
		if (activeTimer && activeTimer.taskId.toString() === task._id.toString()) return 'task-active';
		return '';
	}

	function isTaskActive(task) {
		return activeTimer && activeTimer.taskId.toString() === task._id.toString();
	}
</script>

<svelte:head>
	<title>Dashboard - Time Tracker</title>
</svelte:head>

<div class="dashboard">
	<header class="header">
		<h1>⏱️ Time Tracker</h1>
		<div class="header-actions">
			<a href="/summary" class="btn-link">Summary</a>
			<button on:click={logout} class="btn-logout">Logout</button>
		</div>
	</header>

	{#if activeTimer}
		<div class="active-timer">
			<div class="timer-info">
				<span class="timer-label">Timer Running</span>
				<span class="timer-time">{timerDisplay}</span>
			</div>
			<button on:click={stopTimer} class="btn-stop">Stop Timer</button>
		</div>
	{/if}

	<main class="main">
		<div class="tasks-container">
			<h2>Your Tasks</h2>

			<div class="tasks-list">
				{#if tasks.length === 0}
					<p class="empty-state">No tasks yet. Create your first task below!</p>
				{:else}
					{#each tasks as task (task._id)}
						<div class="task-card {getTaskClass(task)}">
							<div class="task-header">
								<h3 class="task-title">{task.title}</h3>
								<span class="task-status status-{task.status.toLowerCase().replace(' ', '-')}">
									{task.status}
								</span>
							</div>

							{#if task.description}
								<p class="task-description">{task.description}</p>
							{/if}

							<div class="task-actions">
								{#if task.status !== 'Completed'}
									{#if isTaskActive(task)}
										<button on:click={stopTimer} class="btn-action btn-stop-small">
											Stop Timer
										</button>
									{:else}
										<button on:click={() => startTimer(task._id)} class="btn-action btn-start">
											Start Timer
										</button>
									{/if}

									<select
										value={task.status}
										on:change={(e) => updateTaskStatus(task._id, e.target.value)}
										class="status-select"
									>
										<option value="Pending">Pending</option>
										<option value="In Progress">In Progress</option>
										<option value="Completed">Completed</option>
									</select>

									<button on:click={() => deleteTask(task._id)} class="btn-action btn-delete">
										Delete
									</button>
								{:else}
									<span class="completed-label">✓ Task Completed</span>
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<div class="input-container">
			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<form on:submit|preventDefault={createTask} class="task-input-form">
				<input
					type="text"
					bind:value={newTaskTitle}
					placeholder="What are you working on?"
					class="task-input"
					disabled={loading}
				/>
				<button type="submit" class="btn-submit" disabled={loading || !newTaskTitle.trim()}>
					{loading ? 'Adding...' : 'Add Task'}
				</button>
			</form>
		</div>
	</main>
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

	.active-timer {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1.5rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.timer-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.timer-label {
		font-size: 0.875rem;
		opacity: 0.9;
	}

	.timer-time {
		font-size: 2rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.btn-stop {
		padding: 0.75rem 1.5rem;
		background: white;
		color: #667eea;
		border: none;
		border-radius: 6px;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.btn-stop:hover {
		transform: scale(1.05);
	}

	.main {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		padding: 2rem;
	}

	.tasks-container {
		flex: 1;
		overflow-y: auto;
		margin-bottom: 2rem;
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

	.status-select {
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.completed-label {
		color: #276749;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.input-container {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	}

	.task-input-form {
		display: flex;
		gap: 0.75rem;
	}

	.task-input {
		flex: 1;
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
	}

	@media (max-width: 768px) {
		.header {
			padding: 1rem;
		}

		.main {
			padding: 1rem;
		}

		.timer-time {
			font-size: 1.5rem;
		}

		.task-input-form {
			flex-direction: column;
		}

		.btn-submit {
			width: 100%;
		}
	}
</style>
