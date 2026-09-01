# Neon Wire Arena 2.0

An original multiplayer arcade trail game with a Node.js/Socket.IO server and protected admin panel.

## Start locally
1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Set your admin password:
   - Windows PowerShell: `$env:ADMIN_PASSWORD="your-strong-password"`
   - macOS/Linux: `export ADMIN_PASSWORD="your-strong-password"`
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Admin
Click **ADMIN** in the game. The password is checked server-side and the panel uses a server-issued token. Admin controls include announcements, score reset, kick, ban, score, speed, and color changes.

## Hosting
For public hosting, use HTTPS, a strong password, rate limiting, persistent bans, and a production database. The default `CHANGE-ME` password is only a development fallback and should be replaced.

This project uses original branding/assets/code and is inspired by the arcade trail-snake genre; it is not a copy of another game's protected branding, assets, or source code.
