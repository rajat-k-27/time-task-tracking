<script>
	import { onMount } from 'svelte';

	let selectedDate = new Date().toISOString().split('T')[0];
	let summary = null;
	let loading = false;

	onMount(async () => {
		await loadSummary();
	});

	async function loadSummary() {
		loading = true;
		try {
			const response = await fetch(`/api/summary?date=${selectedDate}`);
			if (response.ok) {
				summary = await response.json();
			} else if (response.status === 401) {
				window.location.href = '/';
			}
		} catch (err) {
			console.error('Error loading summary:', err);
		} finally {
			loading = false;
		}
	}

	function formatTime(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	function formatDateTime(dateString) {
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	async function handleDateChange() {
		await loadSummary();
	}
</script>

<svelte:head>
	<title>Daily Summary - Time Tracker</title>
</svelte:head>

<div class="summary-page">
	<header class="header">
		<h1>📊 Daily Summary</h1>
		<a href="/dashboard" class="btn-back">← Back to Dashboard</a>
	</header>

	<main class="main">
		<div class="date-selector">
			<label for="date">Select Date:</label>
			<input
				type="date"
				id="date"
				bind:value={selectedDate}
				on:change={handleDateChange}
				max={new Date().toISOString().split('T')[0]}
			/>
		</div>

		{#if loading}
			<div class="loading">Loading...</div>
		{:else if summary}
			<div class="summary-grid">
				<div class="summary-card">
					<h3>Total Time Tracked</h3>
					<p class="big-number">{formatTime(summary.totalTime)}</p>
				</div>

				<div class="summary-card">
					<h3>Tasks Worked On</h3>
					<p class="big-number">{summary.tasksWorkedOn.length}</p>
				</div>

				<div class="summary-card">
					<h3>Completed</h3>
					<p class="big-number status-completed">{summary.statusBreakdown.Completed}</p>
				</div>

				<div class="summary-card">
					<h3>In Progress</h3>
					<p class="big-number status-progress">{summary.statusBreakdown['In Progress']}</p>
				</div>

				<div class="summary-card">
					<h3>Pending</h3>
					<p class="big-number status-pending">{summary.statusBreakdown.Pending}</p>
				</div>
			</div>

			{#if summary.tasksWorkedOn.length > 0}
				<div class="tasks-section">
					<h2>Tasks Worked On</h2>
					<div class="tasks-list">
						{#each summary.tasksWorkedOn as task}
							<div class="task-item">
								<div class="task-info">
									<h4>{task.title}</h4>
									<span class="task-status status-{task.status.toLowerCase().replace(' ', '-')}">
										{task.status}
									</span>
								</div>
								{#if task.description}
									<p class="task-description">{task.description}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<div class="timelogs-section">
					<h2>Time Log Sessions</h2>
					<div class="timelogs-table">
						<table>
							<thead>
								<tr>
									<th>Task</th>
									<th>Start Time</th>
									<th>End Time</th>
									<th>Duration</th>
								</tr>
							</thead>
							<tbody>
								{#each summary.timeLogs as log}
									{@const task = summary.tasksWorkedOn.find((t) => t._id === log.taskId)}
									<tr>
										<td>{task ? task.title : 'Unknown Task'}</td>
										<td>{formatDateTime(log.startTime)}</td>
										<td>{log.endTime ? formatDateTime(log.endTime) : 'Active'}</td>
										<td>
											{log.endTime ? formatTime(log.duration) : 'Running...'}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{:else}
				<div class="empty-state">
					<p>No activity recorded for this date.</p>
					<a href="/dashboard" class="btn-primary">Go to Dashboard</a>
				</div>
			{/if}
		{/if}
	</main>
</div>

<style>
	.summary-page {
		min-height: 100vh;
		background: #f7fafc;
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

	.btn-back {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.btn-back:hover {
		background: #f7fafc;
	}

	.main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.date-selector {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.date-selector label {
		font-weight: 600;
		color: #2d3748;
	}

	.date-selector input {
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 1rem;
	}

	.loading {
		text-align: center;
		padding: 3rem;
		color: #718096;
		font-size: 1.1rem;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.summary-card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.summary-card h3 {
		margin: 0 0 0.5rem 0;
		color: #718096;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.big-number {
		font-size: 2rem;
		font-weight: 700;
		color: #1a202c;
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.status-completed {
		color: #276749;
	}

	.status-progress {
		color: #2c5282;
	}

	.status-pending {
		color: #c05621;
	}

	.tasks-section,
	.timelogs-section {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.tasks-section h2,
	.timelogs-section h2 {
		margin: 0 0 1rem 0;
		color: #1a202c;
	}

	.tasks-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.task-item {
		padding: 1rem;
		background: #f7fafc;
		border-radius: 6px;
		border-left: 3px solid #667eea;
	}

	.task-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.task-info h4 {
		margin: 0;
		color: #1a202c;
	}

	.task-status {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
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
		margin: 0;
		color: #718096;
		font-size: 0.9rem;
	}

	.timelogs-table {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: #f7fafc;
	}

	th {
		padding: 0.75rem;
		text-align: left;
		font-weight: 600;
		color: #2d3748;
		border-bottom: 2px solid #e2e8f0;
	}

	td {
		padding: 0.75rem;
		border-bottom: 1px solid #e2e8f0;
		color: #4a5568;
	}

	tbody tr:hover {
		background: #f7fafc;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.empty-state p {
		color: #718096;
		font-size: 1.1rem;
		margin-bottom: 1.5rem;
	}

	.btn-primary {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 600;
		transition: transform 0.2s;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
	}

	@media (max-width: 768px) {
		.header {
			padding: 1rem;
			flex-direction: column;
			gap: 1rem;
		}

		.main {
			padding: 1rem;
		}

		.date-selector {
			flex-direction: column;
			align-items: stretch;
		}

		.summary-grid {
			grid-template-columns: 1fr;
		}

		.timelogs-table {
			font-size: 0.85rem;
		}

		th,
		td {
			padding: 0.5rem;
		}
	}
</style>
