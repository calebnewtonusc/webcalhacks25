# Contributing to WEB

Thank you for your interest in contributing to WEB! We appreciate your help in making this project better.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:
- A clear description of the issue
- Steps to reproduce the problem
- Expected behavior
- Screenshots (if applicable)
- Your environment (browser, OS, etc.)

### Suggesting Features

We welcome feature suggestions! Please create an issue with:
- A clear description of the feature
- Why this feature would be useful
- How it should work
- Any mockups or examples (if applicable)

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/calebnewtonusc/webcalhacks25.git
   cd webcalhacks25
   ```

2. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments where necessary
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run dev
   npm run build
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `style:` formatting changes
   - `refactor:` code refactoring
   - `test:` adding tests
   - `chore:` maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of your changes

## Code Style Guidelines

- Use **TypeScript** for type safety
- Follow **React best practices**
- Use **functional components** and **hooks**
- Keep components **small and focused**
- Write **meaningful variable and function names**
- Add **comments** for complex logic
- Use **Tailwind CSS** for styling

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── lib/            # External service integrations (Supabase)
├── pages/          # Page components (route views)
└── main.tsx        # App entry point
```

## Testing

Before submitting a pull request:
- Test your changes thoroughly
- Ensure the app builds without errors
- Check for linting errors
- Test on multiple browsers (if UI changes)
- Test on mobile devices (if applicable)

## Questions?

If you have any questions, feel free to:
- Open an issue on GitHub
- Contact the maintainers
- Join our community discussions

Thank you for contributing! 🎉

