import axios from "axios"

const AUTH_API_URL = "https://user-authentication-api-jqfm.onrender.com/api/v2/apiKey/validate"

export const apiKeyMiddleware = async (req, res, next) => {
  try {
    // Get API key from query params or headers
    const apiKey = req.query.key || req.headers["x-api-key"]

    if (!apiKey) {
      return res.status(401).json({ message: "API key is missing" })
    }

    // Validate API key by making a GET request with query params
    const response = await axios.get(AUTH_API_URL, { params: { apiKey } })

    if (response.data.valid) {
      req.user = response.data.user // Attach user info to request
      return next()
    } else {
      return res.status(403).json({ message: "Invalid API key" })
    }
  } catch (error) {
    console.error("Error validating API key:", error?.response?.data || error.message)

    const statusCode = error?.response?.status || 500
    return res.status(statusCode).json({ message: "Error validating API key" })
  }
}
