import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


const API_URL = 'http://localhost:3000'; // Change this to your deployed backend URL

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [letters, setLetters] = useState([]);
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [letterForm, setLetterForm] = useState({ sender: '', recipient: '', message: '' });
    const [isRegister, setIsRegister] = useState(false); // Toggle between login & register

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        }
    }, [token]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLetterChange = (e) => {
        setLetterForm({ ...letterForm, [e.target.name]: e.target.value });
    };

    // 🔹 Register New User
    const register = async () => {
        try {
            await axios.post(`${API_URL}/register`, form);
            alert('Registration successful! Please log in.');
            setIsRegister(false); // Switch to Login
        } catch (err) {
            alert('Registration failed: ' + (err.response ? err.response.data : 'Unknown error'));
        }
    };

    // 🔹 Login User & Get Token
    const login = async () => {
        try {
            const res = await axios.post(`${API_URL}/login`, { email: form.email, password: form.password });
            setToken(res.data.token);
        } catch (err) {
            alert('Login failed: ' + (err.response ? err.response.data : 'Unknown error'));
        }
    };

    // 🔹 Fetch User Letters
    const fetchLetters = async () => {
        try {
            const res = await axios.get(`${API_URL}/letters`, {
                headers: { Authorization: token }
            });
            setLetters(res.data);
        } catch (err) {
            alert('Error fetching letters: ' + (err.response ? err.response.data : 'Unknown error'));
        }
    };

    // 🔹 Send a Letter
    const sendLetter = async () => {
        try {
            const res = await axios.post(`${API_URL}/letters`, letterForm, {
                headers: { Authorization: token }
            });
            setLetters([...letters, res.data]); // Update UI with new letter
            setLetterForm({ sender: '', recipient: '', message: '' });
        } catch (err) {
            alert('Error sending letter: ' + (err.response ? err.response.data : 'Unknown error'));
        }
    };

    // 🔹 Logout User
    const logout = () => {
        setToken('');
        localStorage.removeItem('token');
    };

    return (
        <div>
            <h1>📬 Expressland Post Office</h1>

            {token ? (
                <>
                    <button onClick={fetchLetters}>📨 Load My Letters</button>
                    <button onClick={logout}>🚪 Logout</button>

                    <h2>✉️ Send a Letter</h2>
                    <input type="text" name="sender" placeholder="Sender" value={letterForm.sender} onChange={handleLetterChange} />
                    <input type="text" name="recipient" placeholder="Recipient" value={letterForm.recipient} onChange={handleLetterChange} />
                    <textarea name="message" placeholder="Message" value={letterForm.message} onChange={handleLetterChange} />
                    <button onClick={sendLetter}>📤 Send</button>

                    <h2>📩 My Letters</h2>
                    <ul>
                        {letters.map(letter => (
                            <li key={letter._id}>{letter.sender} → {letter.recipient}: {letter.message}</li>
                        ))}
                    </ul>
                </>
            ) : (
                <>
                    <h2>{isRegister ? 'Register' : 'Login'}</h2>
                    {isRegister && <input type="text" name="username" placeholder="Username" onChange={handleChange} />}
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} />

                    {isRegister ? (
                        <button onClick={register}>Register</button>
                    ) : (
                        <button onClick={login}>Login</button>
                    )}

                    <p>
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => setIsRegister(!isRegister)}>
                            {isRegister ? 'Login' : 'Register'}
                        </button>
                    </p>
                </>
            )}
        </div>
    );
}

export default App;
