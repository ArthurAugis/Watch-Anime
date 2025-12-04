# Anime Scraper & Sync

A Node.js application that scrapes anime information from `anime-sama.org`, fetches metadata/posters from Kitsu/Jikan/Anilist, and synchronizes the data with a MariaDB database.

## Features

- **Scraping**: Fetches anime details, seasons, episodes, and streaming links.
- **Metadata**: Retrieves high-quality posters from Kitsu, Jikan, or Anilist.
- **Database Sync**: efficiently updates the database with new or modified content.
- **Stealth**: Uses `got-scraping` to mimic a real browser and bypass basic protections.
- **Modular Architecture**: Split into focused modules for maintainability.

## Prerequisites

- Node.js (v18+ recommended)
- MariaDB/MySQL database

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/anime-scraper.git
    cd anime-scraper
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    ```bash
    cp .env.example .env
    ```
    Edit `.env` with your database credentials.

## Usage

Run the script:
```bash
node index.js
```

The script will start, connect to the database, and begin the scraping process. It is configured to run periodically (cron-like behavior in `index.js`).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
