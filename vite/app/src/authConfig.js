export const msalConfig = {
  auth: {
    clientId: "388dcf86-f44f-4a60-bf19-5dae1245d95d",
    authority: "https://login.microsoftonline.com/82c51a82-548d-43ca-bcf9-bf4b7eb1d012",
    redirectUri: "https://localhost:5173/",
    postLogoutRedirectUri: "https://localhost:5173/"
  },
  cache: {
    cacheLocation: "localStorage", // signed in on refresh
    storeAuthStateInCookie: false
  }
}

export const loginRequest = {
  scopes: ["openid", "profile", "email"] // SSO
}
