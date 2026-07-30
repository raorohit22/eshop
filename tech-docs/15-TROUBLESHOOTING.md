# 15 — Troubleshooting & FAQ

> **Audience:** All Engineers  
> **Prerequisites:** [Development Guide](./10-DEVELOPMENT-GUIDE.md)

---

## 1. Common Errors & Fixes

### Setup Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `prisma generate` fails with "Cannot find module" | Missing dependencies | Run `npm install` first |
| `DATABASE_URL is not defined` | Missing `.env` file | Copy `.env.example` to `.env` and fill values |
| `Error: P1001: Can't reach database server` | Wrong MongoDB URI or network issue | Verify `DATABASE_URL`, check Atlas IP whitelist |
| `ECONNREFUSED 127.0.0.1:6379` (Redis) | Redis not running or wrong URI | Verify `REDIS_DATABASE_URI` points to active instance |
| `Cannot find module '@packages/...'` | TypeScript path aliases not resolved | Check `tsconfig.base.json` paths, run `npx prisma generate` |

### Runtime Issues

| Error | Cause | Fix |
|-------|-------|-----|
| **CORS error in browser** | Origin not whitelisted | Add frontend URL to `cors()` origin in gateway and auth service |
| **401 on every request** | Cookies not being sent | Ensure `withCredentials: true` in Axios config |
| **401 after page refresh** | Access token expired | Token refresh should handle automatically; check interceptor |
| **"Too many requests"** | Rate limit exceeded | Wait 15 minutes, or increase limit in development |
| **OTP not received** | SMTP config wrong or Gmail blocking | Verify SMTP credentials, use App Password (not regular password) |
| **"Account locked"** | Too many failed OTP attempts | Wait 30 minutes, or clear Redis key: `DEL otp_lock:<email>` |
| **Stripe error: "No such account"** | Invalid `stripeId` stored | Clear `stripeId` in DB, re-run Stripe Connect flow |
| **bcrypt "Invalid hash"** | Password field is null | Check if user has `password` field (might be OAuth user) |

### Build Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `nx: command not found` | Nx not installed globally | Use `npx nx` instead, or `npm install -g nx` |
| Build fails with type errors | Strict TypeScript enabled | Fix type issues (no `any` escape hatch with `noImplicitAny`) |
| Webpack build hangs | Large `node_modules` or circular deps | Check for circular imports, increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096"` |
| Next.js `Module not found` | Wrong import path | Use `@packages/` alias for shared code, or relative paths within app |

---

## 2. Debugging Runbook

### "API requests returning 404"

1. Check if the auth service is running: `curl http://localhost:6001/`
2. Check if the gateway is running: `curl http://localhost:8080/gateway-health`
3. Verify the route exists in `auth.router.ts`
4. Check the request URL includes `/api/` prefix
5. Verify the gateway proxy target matches auth service port

### "Cookies not set after login"

1. Open browser DevTools → Application → Cookies
2. Check if `accessToken` / `refreshToken` cookies exist
3. Verify `withCredentials: true` in frontend Axios config
4. Check CORS `credentials: true` in backend
5. Verify the `Set-Cookie` header in the response (Network tab)
6. In production: verify `secure: true` and using HTTPS

### "OTP email not arriving"

1. Check console logs for "Error sending email"
2. Verify SMTP credentials in `.env`
3. For Gmail: ensure you're using an **App Password**, not regular password
4. Check spam/junk folder
5. Verify the email template exists in `utils/email-templates/`
6. Test SMTP directly:
   ```bash
   node -e "
     const nodemailer = require('nodemailer');
     const t = nodemailer.createTransport({
       host: 'smtp.gmail.com', port: 465,
       auth: { user: 'your@gmail.com', pass: 'app-password' }
     });
     t.sendMail({ from: 'your@gmail.com', to: 'test@test.com', subject: 'Test', text: 'Hello' })
      .then(console.log).catch(console.error);
   "
   ```

### "Token refresh loop (infinite 401s)"

1. Check if the refresh token cookie exists in browser
2. Verify `REFRESH_TOKEN_SECRET` in `.env` matches what signed the token
3. Check the `_retry` flag is being set in the Axios interceptor
4. Look for multiple Axios instances that might conflict
5. Clear all cookies and re-login

---

## 3. Redis Debugging

### Useful Commands

```bash
# Connect to Redis CLI
redis-cli -u $REDIS_DATABASE_URI

# View all OTP-related keys
KEYS otp:*
KEYS otp_*

# Check specific OTP
GET otp:user@example.com

# Check lock status
GET otp_lock:user@example.com
GET otp_spam_lock:user@example.com

# Manually unlock an account
DEL otp_lock:user@example.com
DEL otp_spam_lock:user@example.com
DEL otp_cooldown:user@example.com
DEL otp_request_count:user@example.com

# View TTL of a key
TTL otp:user@example.com
```

---

## 4. Database Debugging

### Prisma Studio (Visual DB Browser)

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### MongoDB Shell Queries

```javascript
// Find user by email
db.users.findOne({ email: "test@example.com" })

// Find seller with shop
db.sellers.aggregate([
  { $match: { email: "seller@test.com" } },
  { $lookup: { from: "shops", localField: "_id", foreignField: "sellerId", as: "shop" } }
])

// Count records
db.users.countDocuments()
db.sellers.countDocuments()
db.shops.countDocuments()
```

---

## 5. Frequently Asked Questions

### General

**Q: How do I add a new microservice?**  
A: Use Nx generators: `npx nx g @nx/node:app my-new-service`. Then add a proxy route in the API gateway.

**Q: How do I add a new database model?**  
A: Edit `prisma/schema.prisma`, run `npx prisma db push`, then `npx prisma generate`.

**Q: Why are there two separate frontend apps?**  
A: User UI and Seller UI have completely different layouts, user flows, and concerns. Separation allows independent deployment and development.

**Q: Can I use the auth service without the gateway?**  
A: Yes, directly hit `http://localhost:6001/api/*`. The gateway adds CORS, rate limiting, and logging.

### Authentication

**Q: Why does login clear seller cookies?**  
A: To prevent role confusion. If a user logs in while seller cookies exist, the `isAuthenticated` middleware might pick up the seller's token instead.

**Q: Why HttpOnly cookies instead of localStorage?**  
A: HttpOnly cookies are not accessible via JavaScript, protecting against XSS attacks. See [Auth & Security](./05-AUTH-SECURITY.md).

**Q: How long before a user gets logged out?**  
A: Access token expires in 15 minutes, but the Axios interceptor silently refreshes it. The refresh token expires in 7 days — after that, the user must re-login.

### Development

**Q: Why is `npm run dev` slow?**  
A: It starts all services simultaneously. Use individual service commands for faster iteration.

**Q: How do I run just the frontend without the backend?**  
A: You can't fully — the frontend needs the auth API. Start at minimum: `npx nx serve auth-service` + `npm run user-ui`.

**Q: Why does Nx rebuild everything?**  
A: The cache might be stale. Run `npx nx reset` to clear it.

---

## 6. Known Limitations

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| No logout endpoint | Tokens persist until expiry | Clear cookies client-side |
| `create-shop` not protected | Anyone with sellerId can create | Add `isAuthenticated + isSeller` middleware |
| `create-stripe-link` not protected | Same as above | Add auth middleware |
| Gateway CORS allows only `:3000` | Seller UI (`:3001`) can't reach gateway | Add `:3001` to gateway CORS |
| No request logging in auth service | Harder to debug | Add Morgan to auth service |
| Email template path uses `process.cwd()` | May break in Docker | Use `__dirname`-relative paths |
| No pagination on data queries | Performance with large datasets | Add `take`/`skip` to Prisma queries |

---

*Next: [Glossary](./16-GLOSSARY.md)*
