# Spotify

![Now Playing](https://now-playing-spotify.deno.dev/?v1)

A simple Deno app that fetches your currently playing song or most recently played song and renders it as a svg.

## Setup

### Spotify

1. Navigate to https://developer.spotify.com/dashboard/applications and create an account if you do not already have one.
2. Create a new app
3. Copy `Client ID` and `Client Secret` into your `.env` file.
4. In your app page client `Edit Settings` and fill in your website and Redirect URI. Copy your redirect uri.
5. Construct an authorization url in the format `https://accounts.spotify.com/authorize?response_type=code&client_id=$CLIENT_ID&scope=user-read-recently-played,user-read-currently-playing&redirect_uri=$REDIRECT_URI` and paste it into your browser window.
6. Copy `code` url parameter from redirected url after navigating through oauth2 flow.
7. Run `curl -d client_id=$CLIENT_ID -d client_secret=$CLIENT_SECRET -d grant_type=authorization_code -d code=$CODE -d redirect_uri=$REDIRECT_URI https://accounts.spotify.com/api/token`
8. Copy `refresh_token` into `.env` file.

### Deployment

Deployments to Deno Deploy occur on pushes to `master`.

1. Create project in deno deploy.
2. Set `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` environment variables.
3. Set `DENO_DEPLOY_TOKEN` in repository secrets.
4. Set `DENO_DEPLOY_PROJECT` in repository variable to your project name from step #1.

## Environment Variables

Environment variables can either be set directly on your local environment, or via a `.env` file. Copy `.env.example` into `.env` and add your values.

| Name                  | Description          |
| --------------------- | -------------------- |
| SPOTIFY_CLIENT_ID     | OAuth2 Client ID     |
| SPOTIFY_CLIENT_SECRET | OAuth2 Client Secret |
| SPOTIFY_REFRESH_TOKEN | OAuth2 Refresh Token |
