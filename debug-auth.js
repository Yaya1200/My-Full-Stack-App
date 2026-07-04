import axios from 'axios';
const apiUrl = 'http://localhost:5000';
const username = `debuguser_${Date.now()}`;
const password = 'debugpass123';

async function run() {
  try {
    const signup = await axios.post(`${apiUrl}/api/auth/signup`, { username, password }, { withCredentials: true });
    console.log('SIGNUP', signup.status, signup.data);
  } catch (signupErr) {
    console.error('SIGNUP ERROR', signupErr.response?.status, signupErr.response?.data || signupErr.message);
  }

  try {
    const login = await axios.post(`${apiUrl}/api/auth/login`, { username, password }, { withCredentials: true });
    console.log('LOGIN', login.status, login.data);
  } catch (loginErr) {
    console.error('LOGIN ERROR', loginErr.response?.status, loginErr.response?.data || loginErr.message);
  }
}
run();
