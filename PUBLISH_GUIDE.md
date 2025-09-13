# 📦 npm Publishing Guide for @vaultum/sdk-js

## Prerequisites

1. **npm Account**
   - Create account at: https://www.npmjs.com/signup
   - Verify your email

2. **Organization Setup** (for @vaultum scope)
   - Go to: https://www.npmjs.com/org/create
   - Create organization: `vaultum`
   - Set visibility: Public

## Publishing Steps

### 1. Login to npm

```bash
npm login
# Enter username, password, email
# Complete 2FA if enabled
```

### 2. Verify Login

```bash
npm whoami
# Should show your username
```

### 3. Build the Package

```bash
pnpm build
# Creates dist/ folder with compiled files
```

### 4. Test Package Locally

```bash
# Create a tarball
npm pack --dry-run

# Review what will be published
npm publish --dry-run
```

### 5. Publish to npm

```bash
# First time publish (public scoped package)
npm publish --access public

# Future updates
npm publish
```

## Version Management

### Semantic Versioning

- **Patch** (0.1.0 → 0.1.1): Bug fixes
  ```bash
  npm version patch
  ```

- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
  ```bash
  npm version minor
  ```

- **Major** (0.1.0 → 1.0.0): Breaking changes
  ```bash
  npm version major
  ```

### Publishing Workflow

```bash
# 1. Update version
npm version patch

# 2. Push tags to GitHub
git push && git push --tags

# 3. Publish to npm
npm publish
```

## Package URLs

Once published, your package will be available at:
- npm: https://www.npmjs.com/package/@vaultum/sdk-js
- unpkg: https://unpkg.com/@vaultum/sdk-js
- jsDelivr: https://cdn.jsdelivr.net/npm/@vaultum/sdk-js

## Automated Publishing (CI/CD)

The GitHub Action is already configured to auto-publish when:
1. You push to `main` branch
2. The version in package.json changes
3. Tests pass

To use automated publishing:

1. Get npm token:
   ```bash
   npm token create --read-only=false
   ```

2. Add to GitHub secrets:
   - Go to: https://github.com/vaultum/sdk-js/settings/secrets/actions
   - Add secret: `NPM_TOKEN`
   - Value: Your npm token

## Installation Testing

After publishing, test installation:

```bash
# In a new project
npm install @vaultum/sdk-js

# Or with specific version
npm install @vaultum/sdk-js@1.0.0
```

## Troubleshooting

### Error: 402 Payment Required
- You're trying to publish to a private scope
- Solution: Use `npm publish --access public`

### Error: 403 Forbidden
- You don't have permission to publish to @vaultum
- Solution: Create the organization or use different scope

### Error: Package name too similar
- npm thinks your package is too similar to existing one
- Solution: Use scoped package name (@vaultum/sdk-js)

## Best Practices

1. **Always test before publishing**
   ```bash
   npm publish --dry-run
   ```

2. **Use npm scripts**
   ```json
   "scripts": {
     "prepublishOnly": "pnpm test && pnpm build",
     "postpublish": "git push && git push --tags"
   }
   ```

3. **Keep dist/ in .gitignore**
   - Don't commit built files to git
   - Let npm build them during publish

4. **Update README before major releases**
   - Document breaking changes
   - Update examples

## Security

- Enable 2FA on npm account
- Use granular access tokens
- Rotate tokens regularly
- Never commit tokens to git

---

## Quick Publish Command

For experienced users, after setup:

```bash
# One-liner for patch release
npm version patch && npm publish && git push --follow-tags
```
