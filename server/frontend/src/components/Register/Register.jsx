import React, { useState } from 'react';
import Header from '../Header/Header';
import './Register.css';

const Register = () => {
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const register = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const response = await fetch(`${window.location.origin}/djangoapp/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, firstName, lastName, email, password }),
    });
    const data = await response.json();
    if (response.ok && data.status === 'Authenticated') {
      sessionStorage.setItem('username', data.userName);
      window.location.href = '/';
      return;
    }
    if (data.error === 'Already Registered') {
      setMessage('The user with the same username is already registered.');
      return;
    }
    setMessage(data.status || 'The account could not be created.');
  };

  return (
    <div>
      <Header />
      <main className="register_container">
        <h1 className="header">Create account</h1>
        <form className="inputs" onSubmit={register}>
          <label className="input">
            Username
            <input className="input_field" type="text" required value={userName} onChange={(event) => setUserName(event.target.value)} />
          </label>
          <label className="input">
            First name
            <input className="input_field" type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          </label>
          <label className="input">
            Last name
            <input className="input_field" type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </label>
          <label className="input">
            Email
            <input className="input_field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="input">
            Password
            <input className="input_field" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label className="input">
            Confirm password
            <input className="input_field" type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </label>
          {message && <p role="alert">{message}</p>}
          <div className="submit_panel">
            <button className="submit" type="submit">Register</button>
          </div>
          <a className="loginlink" href="/login">Already have an account? Log in</a>
        </form>
      </main>
    </div>
  );
};

export default Register;