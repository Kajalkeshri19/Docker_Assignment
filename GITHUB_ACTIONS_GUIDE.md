   # GitHub Actions CI/CD Setup Guide

## Overview

This guide walks through setting up and configuring the GitHub Actions CI/CD pipeline for automated testing, security scanning, and Docker image publishing.

## Prerequisites

- GitHub repository with admin access
- Docker Hub account
- GitHub repository secrets configured
- All Dockerfiles in place

## Step 1: Create GitHub Secrets

Navigate to your repository → Settings → Secrets and variables → Actions

Add the following secrets:

### Required Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DOCKER_HUB_USERNAME` | Your Docker Hub username | Used for Docker image publishing |
| `DOCKER_HUB_PASSWORD` | Your Docker Hub access token | Use Personal Access Token, not password |
| `GITHUB_TOKEN` | Auto-provided | Available by default in GitHub Actions |

### Optional Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `REGISTRY_URL` | ghcr.io | GitHub Container Registry (if using instead of Docker Hub) |
| `REGISTRY_USERNAME` | GitHub username | For pushing to GitHub Container Registry |
| `REGISTRY_PASSWORD` | GitHub PAT | For pushing to GitHub Container Registry |

### Creating Docker Hub Access Token

1. Log in to [Docker Hub](https://hub.docker.com)
2. Navigate to Account Settings → Security → Personal Access Tokens
3. Click "Generate New Token"
4. Name it (e.g., "github-actions")
5. Select "Read, Write, Delete" permissions
6. Copy the token
7. Use this token as `DOCKER_HUB_PASSWORD` in GitHub Secrets

## Step 2: Configure Repository Settings

### Branch Protection Rules

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### Status Checks Required

From the CI/CD workflow, require these checks:
- `build-and-test` (api, web, tests matrix)
- `run-tests`
- `security-quality`

### Enable Vulnerability Alerts

1. Settings → Code security and analysis
2. Enable:
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning

## Step 3: Verify Workflow Files

Ensure these workflow files exist:
- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
- `.github/workflows/pr-check.yml` - Pull request validation

## Step 4: Monitor Workflow Execution

### View Workflow Runs

1. Navigate to Actions tab in your repository
2. Select the workflow on the left
3. View run history and details

### Check Build Status

```bash
# View all workflow artifacts
git clone <your-repo>
cd <repo>
```

### Download Artifacts

From Actions tab → Select workflow run → Download artifacts:
- `docker-images` - Built Docker image tarballs
- `test-logs` - Test execution logs
- `sbom-results` - Software Bill of Materials

## Step 5: Configure Notifications

### GitHub Native Notifications

Settings → Notifications → Configure:
- Workflow run notifications
- Security alerts

### Optional: Slack Integration

1. Create Slack workflow with GitHub app
2. Subscribe to workflow run events
3. Post notifications to channel

## Usage

### Automatic Triggers

The pipeline runs automatically on:

```yaml
# Triggers on push to main/develop
- Push to main or develop branch
- Pull requests to main or develop
```

### Manual Trigger

```bash
# Trigger via GitHub CLI
gh workflow run ci-cd.yml --ref main -f deploy=true
```

Or use GitHub UI:
1. Actions tab → ci-cd.yml → Run workflow → Branch: main → Deploy: true

## Monitoring & Troubleshooting

### Check Workflow Status

```bash
# List recent runs
gh run list --workflow ci-cd.yml -L 10

# View specific run
gh run view <run-id>
```

### View Detailed Logs

1. Actions tab → Select workflow → Select run
2. Click on job to expand
3. View step-by-step logs

### Common Issues

#### Docker Hub Login Fails
- Verify `DOCKER_HUB_USERNAME` and `DOCKER_HUB_PASSWORD` are correct
- Ensure using Personal Access Token, not password
- Check token hasn't expired

#### Tests Fail in CI
- Check service startup logs
- Verify healthchecks pass
- Ensure `.env` variables match staging config
- Review test logs artifact

#### Security Scans Report Issues
- Review Trivy scan results in workflow logs
- Check image SBOMs in artifacts
- Address high/critical vulnerabilities
- Document any acceptable risks

#### Build Timeout
- Check resource limits
- Review Docker build logs
- Consider splitting builds per service
- Check for network issues

## Performance Optimization

### Build Caching

The pipeline uses GitHub Actions cache:
- Cache key: `type=gha`
- Scope: Per branch
- Max size: 5GB

To clear cache:
```bash
gh actions-cache delete <cache-key> -R <owner>/<repo>
```

### Parallel Jobs

The pipeline runs these in parallel:
- API, Web, Tests build (matrix strategy)
- All security checks during PR

### Expected Times

- **Build & Test**: 2-3 minutes
- **Run Tests**: 1-2 minutes
- **Security Scan**: 1-2 minutes
- **Publish**: 2-3 minutes
- **Total**: Under 10 minutes

## Best Practices

### 1. Pull Request Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git push origin feature/my-feature

# Create PR and wait for checks
```

### 2. Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/**: Feature branches for development

### 3. Commit Conventions

```
feat: Add new security scanner
fix: Correct healthcheck endpoint
docs: Update CI/CD guide
ci: Improve build caching
```

### 4. Semantic Versioning for Releases

Tags trigger releases:
```bash
git tag v1.2.3
git push origin v1.2.3
```

## Security Best Practices

### 1. Secret Management

- Never commit secrets
- Rotate Docker Hub tokens regularly
- Use minimal permissions
- Use environment-specific secrets

### 2. Supply Chain Security

- Keep dependencies updated
- Monitor Dependabot alerts
- Review security advisories
- Use image signing (future)

### 3. Access Control

- Limit who can trigger workflows
- Use branch protection rules
- Require pull request reviews
- Audit workflow permissions

## Artifact Management

### Retention Policies

Default: 90 days

To change:
```bash
# View current settings
gh api repos/<owner>/<repo>/actions/artifacts

# Or via GUI: Settings → Actions → General → Artifact retention days
```

### Storage Limits

- Free tier: 500MB
- Pro/Team: 2GB
- Enterprise: Unlimited

## Advanced Configuration

### Matrix Strategy for Multiple Python Versions

```yaml
strategy:
  matrix:
    python-version: ['3.8', '3.9', '3.10', '3.11']
```

### Conditional Deployment

```yaml
if: |
  (github.event_name == 'push' && github.ref == 'refs/heads/main') ||
  github.event_name == 'workflow_dispatch'
```

### Deploy to Multiple Registries

```yaml
with:
  images: |
    docker.io/${{ secrets.DOCKER_HUB_USERNAME }}/app
    ghcr.io/${{ github.repository }}
```

## Monitoring Tools Integration

### GitHub Native Insights

1. Actions tab → All workflows → Statistics
2. View average run time, success rate
3. Identify bottlenecks

### Metrics to Track

- Build success rate
- Average build time
- Test pass rate
- Security issues found
- Failed deployments

## Support & Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker GitHub Actions](https://github.com/docker/build-push-action)
- [Trivy Scanner](https://github.com/aquasecurity/trivy-action)
- [Hadolint](https://github.com/hadolint/hadolint-action)
- [Playwright Testing](https://playwright.dev)

## Checklist for Production Deployment

- [ ] All secrets configured
- [ ] Branch protection rules enabled
- [ ] Workflow files in place
- [ ] Test suite passing
- [ ] Security scans clean
- [ ] Documentation updated
- [ ] Team notified of CI/CD setup
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Incident response plan defined
