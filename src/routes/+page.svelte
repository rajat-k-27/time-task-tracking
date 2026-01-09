<script>
	let isLogin = true;
	let email = '';
	let password = '';
	let name = '';
	let error = '';
	let loading = false;

	async function handleSubmit() {
		error = '';
		loading = true;

		const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
		const body = isLogin ? { email, password } : { email, password, name };

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Something went wrong';
			} else {
				// Redirect to dashboard
				window.location.href = '/dashboard';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function toggleMode() {
		isLogin = !isLogin;
		error = '';
	}
</script>

<svelte:head>
	<title>{isLogin ? 'Login' : 'Sign Up'} - Time Tracker</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
		<p class="subtitle">{isLogin ? 'Login to track your time' : 'Start tracking your time today'}</p>

		<form on:submit|preventDefault={handleSubmit}>
			{#if !isLogin}
				<div class="form-group">
					<label for="name">Name</label>
					<input
						type="text"
						id="name"
						bind:value={name}
						required={!isLogin}
						placeholder="Your name"
					/>
				</div>
			{/if}

			<div class="form-group">
				<label for="email">Email</label>
				<input type="email" id="email" bind:value={email} required placeholder="you@example.com" />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					minlength="6"
					placeholder="••••••••"
				/>
			</div>

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<button type="submit" class="btn-primary" disabled={loading}>
				{loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
			</button>
		</form>

		<p class="toggle-text">
			{isLogin ? "Don't have an account?" : 'Already have an account?'}
			<button type="button" class="link-button" on:click={toggleMode}>
				{isLogin ? 'Sign Up' : 'Login'}
			</button>
		</p>
	</div>
</div>

<style>
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
	}

	.auth-card {
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 420px;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 1.8rem;
		color: #1a202c;
		text-align: center;
	}

	.subtitle {
		margin: 0 0 2rem 0;
		color: #718096;
		text-align: center;
		font-size: 0.95rem;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #2d3748;
		font-weight: 500;
		font-size: 0.9rem;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #667eea;
	}

	.btn-primary {
		width: 100%;
		padding: 0.875rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		margin-top: 0.5rem;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-message {
		background: #fed7d7;
		color: #c53030;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.toggle-text {
		text-align: center;
		margin-top: 1.5rem;
		color: #718096;
		font-size: 0.9rem;
	}

	.link-button {
		background: none;
		border: none;
		color: #667eea;
		font-weight: 600;
		cursor: pointer;
		padding: 0;
		font-size: 0.9rem;
	}

	.link-button:hover {
		text-decoration: underline;
	}

	@media (max-width: 480px) {
		.auth-card {
			padding: 2rem 1.5rem;
		}

		h1 {
			font-size: 1.5rem;
		}
	}
</style>
