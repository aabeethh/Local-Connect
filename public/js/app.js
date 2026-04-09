const App = {
  route() {
    const user = API.user();
    const token = API.token();
    if (!token || !user) return Auth.renderLanding();
    switch (user.role) {
      case 'admin': Admin.renderDashboard(); break;
      case 'guide': Guide.renderDashboard(); break;
      default: Tourist.renderDashboard(); break;
    }
  },

  logout() {
    API.clearAuth();
    Auth.renderLanding();
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.route());