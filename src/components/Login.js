import React, { useState } from "react";
import './login.css';
import { ReactComponent as Logo } from './logo.svg';

function LoginForm({ Login, register, error }) {
    const [details, setDetails] = useState({ name: "", email: "", password: "" })

    const submitHandler = e => {
        e.preventDefault();
        Login(details)
    }

    const registerHandler = e => {
        e.preventDefault()
        register()
    }

    return (
        <div>
            <form onSubmit={submitHandler}>
                <div className="form-inner">
                    <Logo id="logo_icon" />
                    <h1>Login</h1>
                    <p>Type your email and password </p>

                    {(error != "") ? (<div className="error">{error}</div>) : ""}
                    {/*
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input type="text" name="name" id="name" onChange={e => setDetails({ ...details, name: e.target.value })} value={details.name} />
                </div> */}
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" name="email" id="email" onChange={e => setDetails({ ...details, email: e.target.value })} value={details.email} />
                    </div> <br />
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" name="password" id="password" onChange={e => setDetails({ ...details, password: e.target.value })} value={details.password} />
                    </div> <br />
                    <input name="login" className="button" type="submit" value="LOGIN" /> <br /><br /><br />
                </div>
            </form>

            <button className="button" onClick={registerHandler}>REGISTER</button>
        </div>
    )
}

export default LoginForm;