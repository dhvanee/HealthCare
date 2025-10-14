// Authentication Service - Handles user authentication and API calls
const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "http://localhost:3001/api";

class AuthService {
  constructor() {
    this.token = localStorage.getItem("authToken");
    this.user = JSON.parse(localStorage.getItem("user") || "null");
  }

  // API request helper with authentication headers
  async apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // User Registration
  async signup(userData) {
    try {
      const response = await this.apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          address: userData.address,
        }),
      });

      if (response.success) {
        this.token = response.token;
        this.user = response.user;

        localStorage.setItem("authToken", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));

        return {
          success: true,
          user: this.user,
          message: response.message || "Account created successfully",
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  }

  // User Login
  async login(credentials) {
    try {
      const response = await this.apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (response.success) {
        this.token = response.token;
        this.user = response.user;

        localStorage.setItem("authToken", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));

        return {
          success: true,
          user: this.user,
          message: response.message || "Login successful",
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  }

  // User Logout
  async logout() {
    try {
      if (this.token) {
        await this.apiRequest("/auth/logout", {
          method: "POST",
        });
      }
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }

    return { success: true };
  }

  // Get Current User Profile
  async getCurrentUser() {
    if (!this.token) {
      return { success: false, message: "No authentication token" };
    }

    try {
      const response = await this.apiRequest("/auth/me");

      if (response.success) {
        this.user = response.user;
        localStorage.setItem("user", JSON.stringify(this.user));
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to fetch user profile",
      };
    }
  }

  // Update User Profile
  async updateProfile(userData) {
    try {
      const response = await this.apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(userData),
      });

      if (response.success) {
        this.user = { ...this.user, ...response.user };
        localStorage.setItem("user", JSON.stringify(this.user));
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to update profile",
      };
    }
  }

  // Change Password
  async changePassword(passwordData) {
    try {
      const response = await this.apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to change password",
      };
    }
  }

  // Forgot Password
  async forgotPassword(email) {
    try {
      const response = await this.apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to send reset email",
      };
    }
  }

  // Reset Password
  async resetPassword(token, newPassword) {
    try {
      const response = await this.apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to reset password",
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Get auth token
  getToken() {
    return this.token;
  }

  // Verify token validity (optional - for token refresh)
  async verifyToken() {
    if (!this.token) return false;

    try {
      const response = await this.apiRequest("/auth/verify");
      return response.success;
    } catch (error) {
      // Token might be expired or invalid
      this.logout();
      return false;
    }
  }

  // Mock API for development/demo purposes
  async mockSignup(userData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Date.now(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          address: userData.address,
          createdAt: new Date().toISOString(),
        };

        const mockToken = "mock_token_" + Date.now();

        this.token = mockToken;
        this.user = mockUser;

        localStorage.setItem("authToken", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));

        resolve({
          success: true,
          user: mockUser,
          token: mockToken,
          message: "Account created successfully",
        });
      }, 1000);
    });
  }

  // Mock login for development/demo purposes
  async mockLogin(credentials) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple validation for demo
        if (credentials.email && credentials.password) {
          const mockUser = {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: credentials.email,
            phoneNumber: "+1 234-567-8900",
            dateOfBirth: "1990-01-01",
            gender: "male",
            address: "123 Main St, City, State 12345",
            createdAt: "2023-01-01T00:00:00.000Z",
          };

          const mockToken = "mock_token_" + Date.now();

          this.token = mockToken;
          this.user = mockUser;

          localStorage.setItem("authToken", this.token);
          localStorage.setItem("user", JSON.stringify(this.user));

          resolve({
            success: true,
            user: mockUser,
            token: mockToken,
            message: "Login successful",
          });
        } else {
          resolve({
            success: false,
            message: "Invalid email or password",
          });
        }
      }, 1000);
    });
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

// Named exports for individual methods
export const {
  login,
  signup,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  isAuthenticated,
  getUser,
  getToken,
  verifyToken,
} = authService;
