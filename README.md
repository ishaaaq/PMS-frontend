# PTDF PMS - Frontend

Project Management System for PTDF (Petroleum Technology Development Fund) built with React, TypeScript, and Vite.

### Before Pushing Code ⚠️

**CRITICAL:** Always run the following checks before pushing your code:

```bash
# 1. Run ESLint to check for linting and TypeScript errors
npm run lint

# 2. Fix any errors found
# If there are auto-fixable issues, you can run (when available):
# npm run lint -- --fix

# 3. Verify TypeScript compilation
npm run build
```

**DO NOT push code with linting or TypeScript errors!** Fix all issues before committing.
> [!IMPORTANT]
> **NEVER push directly to `master` branch!**


## 🚀 Quick Start for New Developers

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Git**

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PMS-antigravity/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` (if available)
   - Or create a `.env` file with required variables
   ```bash
   # Example .env configuration
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (runs TypeScript check + Vite build) |
| `npm run lint` | Run ESLint to check for code quality issues |
| `npm run preview` | Preview production build locally |
| `npm run smoke-test` | Run smoke tests |

---

## 🔧 Development Workflow

### Before Pushing Code ⚠️

**CRITICAL:** Always run the following checks before pushing your code:

```bash
# 1. Run ESLint to check for linting and TypeScript errors
npm run lint

# 2. Fix any errors found
# If there are auto-fixable issues, you can run (when available):
# npm run lint -- --fix

# 3. Verify TypeScript compilation
npm run build
```

**DO NOT push code with linting or TypeScript errors!** Fix all issues before committing.

### Git Branch Workflow

> [!IMPORTANT]
> **NEVER push directly to `master` branch!**

**Always follow this workflow:**

1. **Create a feature branch from `dev`:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

3. **Push to your feature branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request:**
   - Open a PR from your feature branch → `dev` (NOT `master`)
   - Wait for code review and approval
   - Merge after approval

**Branch naming conventions:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/what-changed` - Code refactoring
- `docs/what-changed` - Documentation updates

---

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # Base UI components (Sidebar, ThemeToggle, etc.)
│   │   ├── auth/       # Authentication components
│   │   ├── dashboard/  # Dashboard-specific components
│   │   ├── consultant/ # Consultant-specific components
│   │   └── contractor/ # Contractor-specific components
│   ├── contexts/       # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layout components
│   ├── pages/          # Route pages
│   │   ├── consultant/ # Consultant pages
│   │   └── contractor/ # Contractor pages
│   ├── services/       # API service functions
│   ├── lib/            # Utility functions
│   └── App.tsx         # Main app component with routing
├── public/             # Static assets
└── package.json
```

---

## 👥 User Roles

The application supports three user roles:

1. **ADMIN** - Full system access
   - Routes: `/dashboard/*`
   - Can manage projects, consultants, contractors, users

2. **CONSULTANT** - Project supervisors
   - Routes: `/dashboard/consultant/*`
   - Can manage assigned projects and verify contractor work

3. **CONTRACTOR** - Project workers
   - Routes: `/dashboard/contractor/*`
   - Can view assignments, submit work, upload documents

### Role Switching (Development Only)

In development mode, a role switcher is available in the bottom-right corner to test different user roles.

---

## 🎨 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** (Rolldown) - Build tool and dev server
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Framer Motion** - Animations

---

## 🧪 Code Quality

### ESLint Configuration

This project uses ESLint with TypeScript support and React-specific rules.

**Key rules:**
- TypeScript strict mode enabled
- React Hooks rules enforced
- React Compiler optimizations enabled

### TypeScript

The project uses TypeScript with strict type checking. Ensure all types are properly defined and avoid using `any` where possible.

---

## 🌐 Environment Variables

Create a `.env` file in the frontend root with:

```env
VITE_API_URL=http://localhost:3000
# Add other environment variables as needed
```

> **Note:** All Vite environment variables must be prefixed with `VITE_`

---

## 📝 Coding Standards

1. **Components:**
   - Use functional components with hooks
   - Keep components small and focused
   - Extract reusable logic into custom hooks

2. **Naming:**
   - PascalCase for components: `MyComponent.tsx`
   - camelCase for functions and variables
   - UPPER_CASE for constants

3. **Imports:**
   - Group imports: React → third-party → local
   - Use absolute imports where configured

4. **Styling:**
   - Use Tailwind CSS utility classes
   - Follow dark mode patterns (use `dark:` prefix)
   - Maintain responsive design (mobile-first approach)

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Change the port in vite.config.ts or kill the process using port 5173
```

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ESLint errors
```bash
# Run lint to see all errors
npm run lint

# Fix auto-fixable issues (if available)
npm run lint -- --fix
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vite.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)

---

## 🤝 Contributing

1. Create a feature branch from `dev`
2. Make your changes
3. Run `npm run lint` - **MUST pass with no errors**
4. Run `npm run build` - **MUST compile successfully**
5. Push to your feature branch
6. Create a PR to `dev` (NOT `master`)
7. Wait for code review and approval

---

## 📧 Support

For questions or issues, contact the development team or create an issue in the repository.
