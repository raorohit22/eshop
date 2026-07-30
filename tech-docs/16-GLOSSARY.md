# 16 — Glossary

> **Audience:** Beginners  
> **Purpose:** Define every term, acronym, and technology used in this project

---

## Domain Terms

| Term | Definition |
|------|-----------|
| **User** | A customer who browses products, shops, and makes purchases on the platform |
| **Seller** | A merchant/vendor who registers, creates a shop, lists products, and manages orders |
| **Shop** | A seller's storefront with name, bio, category, address, and social links |
| **OTP** | One-Time Password — a 4-digit code sent via email for identity verification |
| **Shop Review** | A rating and text review left by a user on a shop |
| **Stripe Connect** | Stripe's platform for marketplace payments, allowing sellers to receive payouts |

---

## Technology Terms

| Term | Definition |
|------|-----------|
| **Monorepo** | A single repository containing multiple projects (apps and packages). Eshop uses Nx to manage this. |
| **Nx** | A build system and monorepo tool by Nrwl. Manages builds, tests, linting, and dependencies across projects. |
| **Express.js** | A minimal Node.js web framework for building REST APIs and web servers. |
| **Next.js** | A React framework with server-side rendering, file-based routing, and built-in optimization. |
| **App Router** | Next.js 13+ routing system using the `app/` directory with layouts, route groups, and server components. |
| **Prisma** | A TypeScript ORM (Object-Relational Mapping) that provides type-safe database access with auto-generated client. |
| **MongoDB** | A NoSQL document database that stores data in JSON-like documents (BSON). |
| **MongoDB Atlas** | MongoDB's cloud-hosted database service. |
| **Redis** | An in-memory data store used for caching, session storage, and real-time operations. |
| **ioredis** | A robust, full-featured Redis client for Node.js. |
| **JWT** | JSON Web Token — a compact, URL-safe token format for securely transmitting claims between parties. |
| **bcrypt** | A password hashing algorithm that incorporates a salt and is deliberately slow to resist brute-force attacks. |
| **CORS** | Cross-Origin Resource Sharing — a browser security mechanism that controls which domains can access your API. |
| **Webpack** | A module bundler that compiles JavaScript modules and assets for deployment. |
| **esbuild** | An extremely fast JavaScript bundler and minifier. |
| **SWC** | A super-fast TypeScript/JavaScript compiler written in Rust, used by Next.js. |
| **Tailwind CSS** | A utility-first CSS framework for rapidly building custom designs. |
| **Styled Components** | A CSS-in-JS library that lets you write actual CSS code to style React components. |
| **TanStack React Query** | A library for managing server state (fetching, caching, synchronizing data from APIs). |
| **Jotai** | A primitive and flexible state management library for React using atoms. |
| **React Hook Form** | A performant, flexible library for managing forms in React. |
| **Axios** | A promise-based HTTP client for making API requests from the browser or Node.js. |
| **Nodemailer** | A Node.js module for sending emails via SMTP. |
| **EJS** | Embedded JavaScript templates — a templating engine for generating HTML with dynamic data. |
| **Swagger** | An API documentation standard (OpenAPI) with tools for generating interactive API docs. |
| **Stripe** | A payment processing platform for online businesses. |
| **ESLint** | A static analysis tool for identifying problems in JavaScript/TypeScript code. |
| **Jest** | A JavaScript testing framework with built-in assertions, mocking, and coverage. |
| **Morgan** | HTTP request logger middleware for Node.js. |
| **Docker** | A platform for building, shipping, and running applications in containers. |
| **GitHub Actions** | A CI/CD platform built into GitHub for automating workflows. |

---

## Acronyms

| Acronym | Full Form | Context |
|---------|-----------|---------|
| **API** | Application Programming Interface | HTTP REST endpoints |
| **BSON** | Binary JSON | MongoDB's storage format |
| **CI/CD** | Continuous Integration / Continuous Deployment | Automated testing and deployment |
| **CLI** | Command Line Interface | Terminal tools |
| **CORS** | Cross-Origin Resource Sharing | Browser security |
| **CRUD** | Create, Read, Update, Delete | Basic data operations |
| **CSS** | Cascading Style Sheets | Styling |
| **DOM** | Document Object Model | Browser page structure |
| **DTO** | Data Transfer Object | API request/response shapes |
| **EJS** | Embedded JavaScript | Email templates |
| **ENV** | Environment (variables) | Configuration |
| **ERD** | Entity-Relationship Diagram | Database design |
| **FK** | Foreign Key | Database relationship |
| **HTTP** | HyperText Transfer Protocol | Web communication |
| **HTTPS** | HTTP Secure | Encrypted web communication |
| **HMAC** | Hash-based Message Authentication Code | JWT signing |
| **IDE** | Integrated Development Environment | Code editor (VSCode) |
| **IP** | Internet Protocol (address) | Network identity |
| **JSON** | JavaScript Object Notation | Data format |
| **JSX** | JavaScript XML | React component syntax |
| **JWT** | JSON Web Token | Authentication tokens |
| **MIME** | Multipurpose Internet Mail Extensions | Content types |
| **MVC** | Model-View-Controller | Architecture pattern |
| **NPM** | Node Package Manager | Dependency management |
| **NoSQL** | Not Only SQL | Non-relational databases |
| **ORM** | Object-Relational Mapping | Database abstraction |
| **OTP** | One-Time Password | Verification codes |
| **REST** | Representational State Transfer | API design style |
| **SDK** | Software Development Kit | Library/tool package |
| **SMTP** | Simple Mail Transfer Protocol | Email sending |
| **SPA** | Single Page Application | Frontend architecture |
| **SQL** | Structured Query Language | Relational databases |
| **SSR** | Server-Side Rendering | Pre-rendered HTML |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security | Encryption |
| **TSX** | TypeScript XML | TypeScript + JSX |
| **TTL** | Time To Live | Data expiration |
| **UI** | User Interface | Frontend |
| **URI** | Uniform Resource Identifier | Resource address |
| **URL** | Uniform Resource Locator | Web address |
| **UUID** | Universally Unique Identifier | Unique ID format |
| **XSS** | Cross-Site Scripting | Security vulnerability |

---

## HTTP Status Codes (Used in This Project)

| Code | Name | When It's Used |
|------|------|---------------|
| 200 | OK | Successful operation (login, OTP sent, password reset) |
| 201 | Created | Resource created (user registered, shop created) |
| 400 | Bad Request | Validation errors (missing fields, invalid email) |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | Authenticated but wrong role (user accessing seller route) |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Key File Extensions

| Extension | Type | Used For |
|-----------|------|----------|
| `.ts` | TypeScript | Server-side code, types |
| `.tsx` | TypeScript + JSX | React components |
| `.js` | JavaScript | Config files, scripts |
| `.mjs` | ES Module JS | ESLint config |
| `.cts` | CommonJS TypeScript | Jest config |
| `.json` | JSON | Config, data, package manifests |
| `.prisma` | Prisma Schema | Database models |
| `.ejs` | EJS Template | Email templates |
| `.css` | Stylesheet | Global styles |
| `.yml` | YAML | CI/CD config |
| `.md` | Markdown | Documentation |
| `.d.ts` | TypeScript Declaration | Type definitions |

---

*This glossary covers all terms used across the Eshop technical documentation.*

---

**End of Technical Documentation**

*For questions or contributions, contact the Engineering team or open a pull request targeting `tech-docs/`.*
