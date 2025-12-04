# 🎌 Watch-Anime - Anime Streaming Platform

A modern and responsive platform for streaming anime, developed with Next.js, TypeScript, and MySQL.

## ✨ Features

### 🎬 For Users
- **Complete Catalog**: Browse a wide selection of anime
- **Multi-language Streaming**: Support for multiple subtitle/dubbing languages
- **Personalized History**: Track your viewing progress
- **Favorites List**: Save your favorite anime
- **Watch Later**: Plan your next viewings
- **Recommendations**: Discover new anime tailored to your tastes
- **Responsive Interface**: Optimized for desktop, tablet, and mobile

### 🔐 Authentication System
- **Google OAuth**: Fast login with your Google account
- **Discord OAuth**: Login with your Discord account
- **Session Management**: Secure sessions with NextAuth.js

### 🛠️ Administration
- **Auto-insertion Script**: Automated content addition
- **Discord Bot**: Administration commands via Discord
- **Poster Management**: Automatic image upload

## 🚀 Installation

### Prerequisites
- Node.js (version 18 or higher)
- MySQL (version 8.0 or higher)
- A web server (Apache/Nginx)

### 1. Clone the project
```bash
git clone https://github.com/ArthurAugis/Watch-Anime.git
cd Watch-Anime
```

### 2. Database Configuration
```bash
# Import the database schema
mysql -u root -p < empty_database.sql
```

### 3. Website Configuration
```bash
cd website
npm install
cp .env.example .env
```

Edit the `.env` file with your configurations:
- MySQL Database
- OAuth Keys (Google, Discord)
- NextAuth Secret

### 4. Auto-insertion Script Configuration (Optional)
```bash
cd ../auto-insert-script
npm install
cp .env.example .env
```

### 5. Launch Project
```bash
cd website
npm run dev
```

The site will be accessible at `http://localhost:3000`

## 📁 Project Structure

```
Watch-Anime/
├── website/                    # Main Next.js Application
│   ├── src/
│   │   ├── app/               # Pages and API routes (App Router)
│   │   ├── components/        # Reusable React Components
│   │   └── lib/              # Utilities (auth, db)
│   ├── public/               # Static files
│   └── package.json
├── auto-insert-script/        # Automation Script
│   ├── index.js              # Main script
│   └── package.json
├── empty_database.sql         # Database Schema
└── docs/                     # Documentation
```

## 🔧 Configuration

### Environment Variables

#### Website (`website/.env`)
```env
# Database
DB_HOST=localhost
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=your_database_name

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth Discord
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

#### Auto-insertion Script (`auto-insert-script/.env`)
```env
# Database
db_host=localhost
db_user=your_database_user
db_pass=your_database_password

# Discord Bot (Optional)
discord_token=your_discord_bot_token
discord_user_id=your_discord_user_id
discord_client_id=your_discord_client_id

# SSH for image upload (Optional)
host_ssh=your_ssh_host
port_ssh=22
user_ssh=your_ssh_user
pass_ssh=your_ssh_password
```

### OAuth Configuration

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API and OAuth API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized URLs

#### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. In OAuth2, add `http://localhost:3000/api/auth/callback/discord` to redirects
4. Copy Client ID and Client Secret

## 📊 Database

The project uses MySQL with the main tables:
- `tab_liste_anime`: Anime catalog
- `tab_episodes`: Episodes and streaming links
- `users`: Authenticated users
- `user_history`: Viewing history
- `user_likes`: User favorites
- `user_watchlater`: "Watch Later" list

See `empty_database.sql` for the complete schema.

## 🤝 Contribution

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add a new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 🛡️ Security

- Never commit `.env` files
- Use strong secrets for `NEXTAUTH_SECRET`
- Correctly configure authorized URLs for OAuth
- Secure your database with limited privilege users

## 📞 Support

For any questions or issues:
- Join our Discord: https://discord.com/invite/zX5ucDU5zn
- Open an issue on GitHub
- Consult the documentation in the `docs/` folder
