
# MyDo

SecureDo is a highly secure, scalable To-Do List application built from the ground up prioritizing robust architecture, strict security constraints, and modern UI/UX.

Built with **Next.js (App Router)**, **Prisma ORM**, **SQLite**, and **Tailwind CSS**.

## Features

- **Robust Authentication**: Secure login and signup flows using `bcrypt` password hashing.
- **XSS & CSRF Prevention**: Uses strictly configured `HttpOnly` JWT cookies for session management.
- **Data Integrity**: Backend API routes validate all user inputs and prevent IDOR (Insecure Direct Object Reference) vulnerabilities—users can only access and modify their own tasks.
- **Modern UI**: A fully responsive "Creative Light Theme" utilizing Tailwind CSS to present a polished, premium aesthetic with smooth micro-interactions.

## AI Agent Integrations (`AGENTS.md`)

This repository was developed with the assistance of advanced agentic AI. To maintain the integrity of the codebase, we utilize an `AGENTS.md` file located at the root of the project. 

<img width="1323" height="798" alt="agentmd" src="https://github.com/user-attachments/assets/9b76aa7b-1e57-4b42-bfc4-9bfdb3b0bef1" />


The `AGENTS.md` file serves as a **Workspace Customization Root**. It dictates strict behavioral constraints, design aesthetics, and security rules that any autonomous AI agent (like Google Antigravity) must parse and follow unconditionally before writing a single line of code.

## Strict Test-Driven Development (TDD)

All features in SecureDo were developed adhering to a strict **Red-Green-Refactor TDD Cycle**, as mandated by our `AGENTS.md` rules:

![TDD RED Phase Setup](./docs/tdd-red-phase.png)

login tests file in _test_ folder 

1. **RED:** Write the automated unit or security test first. The test must fail.
2. <img width="947" height="476" alt="RedTest" src="https://github.com/user-attachments/assets/3b2ee5d0-b693-43d1-b699-e0c2df28ac95" />

3. **GREEN:** Write the minimal functional React/Next.js code required to make the test pass.
4. <img width="930" height="265" alt="green" src="https://github.com/user-attachments/assets/52c778e7-ab10-44eb-a504-52e346aff42a" />

5. **REFACTOR:** Clean up the code, optimize the architecture, and apply design patterns while keeping the test suite entirely green.
<img width="1017" height="493" alt="refactor" src="https://github.com/user-attachments/assets/d99049f0-c1f9-4a11-aa4b-7bd3d0b14cea" />



This workflow guarantees that our core security features (like authentication handling and rate limiting) are explicitly tested before the logic even exists.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Next, initialize the SQLite database and generate the Prisma client:

```bash
npx prisma db push
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.
