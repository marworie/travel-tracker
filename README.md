# 🗺️ Travel Tracker

Mark the countries and Turkish provinces you've visited on interactive maps and track your travel stats.

## Features
- World map: click a country to mark it as visited
- Turkey map: all 81 provinces
- Add cities you visited in each country
- Stats: visited countries, provinces and cities

## Tech Stack
- **Backend:** ASP.NET Core Web API, Dapper, SQL Server
- **Frontend:** React, Vite, react-simple-maps

## Setup
1. Run the SQL files in `database/` in order
2. Update the connection string in `backend/appsettings.json`
3. Backend: `cd backend` → `dotnet run`
4. Frontend: `cd frontend` → `npm install` → `npm run dev`

## Data Sources
- World map: [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth)
- Turkey provinces: [cihadturhan/tr-geojson](https://github.com/cihadturhan/tr-geojson)