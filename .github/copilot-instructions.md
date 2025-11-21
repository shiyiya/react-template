# AI Coding Agent Instructions for `react-template`

## Project Overview

This repository serves as a template for React-based projects. It provides a minimal setup to kickstart development with React. The structure and conventions are designed to be simple and adaptable for various use cases.

## Key Files and Directories

- **`src/`**: This directory is expected to contain all React components, styles, and related assets.
- **`public/`**: Static files such as `index.html` and other assets are stored here.
- **`package.json`**: Defines project dependencies and scripts.
- **`README.md`**: Provides a high-level overview of the project.

## Developer Workflows

### Installation
To set up the project locally, run:
```bash
npm install
```

### Development
To start the development server:
```bash
npm start
```
This will launch the app in development mode, typically accessible at `http://localhost:3000`.

### Building for Production
To create an optimized production build:
```bash
npm run build
```
The build artifacts will be output to the `build/` directory.

### Testing
If the project includes tests, run them with:
```bash
npm test
```

## Project-Specific Conventions

- **Component Structure**: Follow the convention of organizing components in the `src/components/` directory, with each component having its own folder containing the `.jsx`/`.tsx` file and related styles.
- **Styling**: Use CSS modules or a CSS-in-JS library for styling components.
- **State Management**: If state management is required, consider using React Context or Redux, depending on the complexity of the application.

## Integration Points

- **External APIs**: If the project integrates with external APIs, document the API endpoints and usage patterns in the `src/api/` directory (if applicable).
- **Environment Variables**: Use a `.env` file to manage environment-specific configurations. Ensure sensitive information is not committed to the repository.

## Notes for AI Agents

- When adding new components, ensure they are placed in the appropriate directory and follow the established naming conventions.
- Adhere to the existing ESLint and Prettier configurations (if present) to maintain code consistency.
- Update the `README.md` file if introducing significant changes to the project structure or workflows.

---

For any questions or clarifications, refer to the `README.md` or consult the project maintainers.
