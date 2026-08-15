# Steven Wilcox portfolio and agent

This repository now contains two independently runnable applications:

- `apps/portfolio` is the public portfolio and live-stats application.
- `apps/agent` is an identical starting copy for the productivity agent.

No shared component package has been introduced yet. The applications can evolve
independently until their stable shared boundaries are clear.

## Local development

Use Node 22 from the repository root:

```sh
nvm use
```

Then run either application:

```sh
npm run dev:portfolio
npm run dev:agent
```

The root scripts use ports 3002 and 3003 respectively. Each app also retains its
own package scripts, configuration, assets, curriculum, notebooks, tests, and
documentation.

Local secrets are not copied automatically. Create `apps/portfolio/.env.local`
and `apps/agent/.env.local` from each app's `.env.example` when configuring them.
