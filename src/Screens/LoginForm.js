import React, { useState } from 'react';

import background from '../Assets/images/4048243.jpg';
import logo from '../Assets/images/logo.png';

export default function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);

  const [loginInputs, setLoginInputs] = useState(['', '']);

  const [registerInputs, setRegisterInputs] = useState(['', '', '', '', '']);
  const [validity, setValidity] = useState([false, false, false, false, false]);
  const [error, setError] = useState(['', '', '', '', '']);

  const setName = (e) => {
    e.preventDefault();
    updateRegisterInput(0, e.target.value);

    if (e.target.value.length === 0) {
      updateValidity(0, false);
      updateError(0, '');
      return;
    } else {
      updateValidity(0, true);
    }

    if (!/^[a-zA-Z ]+$/.test(e.target.value)) {
      updateError(0, 'Should contain only alphabets');
      updateValidity(0, false);
    } else {
      updateError(0, '');
    }
  };

  const setUsername = (e) => {
    e.preventDefault();
    updateRegisterInput(1, e.target.value);

    if (e.target.value.length === 0) {
      updateValidity(1, false);
      updateError(1, '');
      return;
    } else {
      updateValidity(1, true);
    }

    if (!/^[a-zA-Z0-9]+$/.test(e.target.value)) {
      updateError(1, 'Should not contain symbols or spaces');
      updateValidity(1, false);
    } else {
      updateError(1, '');
    }
  };

  const setEmail = (e) => {
    e.preventDefault();
    updateRegisterInput(2, e.target.value);

    if (e.target.value.length === 0) {
      updateValidity(2, false);
      updateError(2, '');
      return;
    } else {
      updateValidity(2, true);
    }

    if (
      // eslint-disable-next-line
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        e.target.value
      )
    ) {
      updateError(2, 'Invalid Email Address');
      updateValidity(2, false);
    } else {
      updateError(2, '');
    }
  };

  const setPassword = (e) => {
    e.preventDefault();
    updateRegisterInput(3, e.target.value);

    if (e.target.value.length === 0) {
      updateValidity(3, false);
      updateError(3, '');
      return;
    } else {
      updateValidity(3, true);
    }

    const lowercase = new RegExp('^(?=.*[a-z])');
    const uppercase = new RegExp('^(?=.*[A-Z])');
    const number = new RegExp('^(?=.*[0-9])');
    const symbol = new RegExp('^(?=.*[!@#$%^&*])');

    if (!lowercase.test(e.target.value)) {
      updateError(
        3,
        'Should contain at least 1 lowercase alphabetical character'
      );
      updateValidity(3, false);
    } else if (!uppercase.test(e.target.value)) {
      updateError(
        3,
        'Should contain at least 1 upppercase alphabetical character'
      );
      updateValidity(3, false);
    } else if (!number.test(e.target.value)) {
      updateError(3, 'Should contain at least 1 numerical character');
      updateValidity(3, false);
    } else if (!symbol.test(e.target.value)) {
      updateError(3, 'Should contain at least 1 symbol');
      updateValidity(3, false);
    } else if (e.target.value.length < 8) {
      updateError(3, 'Should be at least 8 characters long');
      updateValidity(3, false);
    } else {
      updateError(3, '');
    }

    // setTimeout(() => {
    //   if (registerInputs[4].length === 0) {
    //     updateValidity(4, false);
    //     updateError(4, '');
    //     return;
    //   } else {
    //     updateValidity(4, true);
    //   }

    //   if (registerInputs[4] !== registerInputs[5]) {
    //     updateError(4, "Doesn't match previously entered password");
    //     updateValidity(4, false);
    //   } else {
    //     updateError(4, '');
    //   }
    // }, 500);
  };

  const setPasswordCheck = (e) => {
    e.preventDefault();
    updateRegisterInput(4, e.target.value);

    if (e.target.value.length === 0) {
      updateValidity(4, false);
      updateError(4, '');
      return;
    } else {
      updateValidity(4, true);
    }

    if (e.target.value !== registerInputs[3]) {
      updateError(4, "Doesn't match previously entered password");
      updateValidity(4, false);
    } else {
      updateError(4, '');
    }
  };

  const updateRegisterInput = (index, val) => {
    const update = registerInputs.map((e, i) => {
      if (i === index) {
        return val;
      } else {
        return e;
      }
    });

    setRegisterInputs(update);
  };

  const updateValidity = (index, val) => {
    const update = validity.map((e, i) => {
      if (i === index) {
        return val;
      } else {
        return e;
      }
    });

    setValidity(update);
  };

  const updateError = (index, val) => {
    const update = error.map((e, i) => {
      if (i === index) {
        return val;
      } else {
        return e;
      }
    });

    setError(update);
  };

  const showError = (index) => {
    if (error[index].length === 0) {
      return null;
    }

    return (
      <ul className="w-5/6 mx-auto p-2 text-red-400 mt-1 list-disc">
        <li className="sm:text-sm text-xs">{error[index]}</li>
      </ul>
    );
  };

  const classes = {
    input: 'w-full p-2 text-gray-100 bg-gray-700 rounded-lg mt-2',
  };

  const Login = (
    <div className="w-5/6 mx-auto">
      <div className="font-bold tracking-wide text-white sm:text-4xl text-2xl sm:mt-0 mt-4">
        Login
      </div>
      <input
        type="text"
        placeholder="Enter Username..."
        className={classes.input}
        value={loginInputs[0]}
        onChange={(e) => {
          e.persist();
          setLoginInputs((prev) => [e.target.value, prev[1]]);
        }}
      />
      <input
        type="password"
        placeholder="Enter Password..."
        className={classes.input}
        value={loginInputs[1]}
        onChange={(e) => {
          e.persist();
          setLoginInputs((prev) => [prev[0], e.target.value]);
        }}
      />
      <button
        className={`p-2 rounded-lg bg-gray-900 uppercase tracking-wide font-bold text-lg ${
          loginInputs.every((v) => v.length > 0)
            ? 'hover:bg-blue-600 focus:bg-blue-600'
            : 'opacity-50'
        } text-gray-300 sm:w-1/3 w-full mt-4 mb-2`}
        onClick={() =>
          loginInputs.every((v) => v.length > 0) ? alert('valid') : null
        }
      >
        Let's Go!
      </button>
      <div className="sm:text-lg text-md text-gray-400">
        Don't already have an account?{' '}
        <button
          className="underline text-blue-400 sm:mb-0 mb-4"
          onClick={() => setIsRegistering(true)}
        >
          Make One Now!
        </button>
      </div>
    </div>
  );

  const Register = (
    <div className="w-5/6 mx-auto">
      <div className="font-bold tracking-wide text-white sm:text-4xl text-2xl sm:mt-0 mt-4">
        Register
      </div>
      <input
        type="text"
        placeholder="Enter Name..."
        className={classes.input}
        value={registerInputs[0]}
        onChange={(e) => setName(e)}
      />
      {showError(0)}
      <input
        type="text"
        placeholder="Enter Username..."
        className={classes.input}
        value={registerInputs[1]}
        onChange={(e) => setUsername(e)}
      />
      {showError(1)}
      <input
        type="email"
        placeholder="Enter Email Address..."
        className={classes.input}
        value={registerInputs[2]}
        onChange={(e) => setEmail(e)}
      />
      {showError(2)}
      <input
        type="password"
        placeholder="Enter Password..."
        className={classes.input}
        value={registerInputs[3]}
        onChange={(e) => setPassword(e)}
      />
      {showError(3)}
      <input
        type="password"
        placeholder="Enter Password Again..."
        className={classes.input}
        value={registerInputs[4]}
        onChange={(e) => setPasswordCheck(e)}
      />
      {showError(4)}
      <button
        className={`p-2 rounded-lg bg-gray-900 uppercase tracking-wide font-bold text-lg ${
          validity.every((v) => v)
            ? 'hover:bg-blue-600 focus:bg-blue-600'
            : 'opacity-50'
        } text-gray-300 sm:w-1/3 w-full my-4`}
        onClick={() => (validity.every((v) => v) ? alert('valid') : null)}
      >
        Create!
      </button>
      <div className="sm:text-lg text-md text-gray-400">
        Already have an account?{' '}
        <button
          className="underline text-blue-400 sm:mb-0 mb-4"
          onClick={() => setIsRegistering(false)}
        >
          Login Now!
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center">
      <img
        src={background}
        alt="Background"
        className="fixed h-screen w-screen bg-gray-900 z-0 object-cover"
      />
      <div className="sm:w-2/3 sm:h-3/4 w-5/6 bg-gray-600 rounded-lg z-50 opacity-95 shadow-lg flex sm:flex-row flex-col">
        <div className="h-full sm:w-1/2 w-full bg-gray-600 rounded-l-lg flex flex-col justify-center items-center sm:border-r-4 sm:border-gray-800">
          <div className="w-full mb-4 font-bold tracking-wider sm:text-4xl text-2xl sm:mt-0 mt-4 uppercase text-blue-900 flex justify-center">
            Kinesis <p className="ml-2 text-blue-300">Connect</p>
          </div>
          <img
            src={logo}
            alt="Logo"
            className="sm:w-1/2 w-1/3 sm:mb-0 mb-4 object-scale-down"
          />
        </div>
        <div className="h-full sm:w-1/2 w-full bg-gray-800 rounded-r-lg sm:border-l-4 sm:border-gray-600 flex flex-col justify-center">
          {isRegistering ? Register : Login}
        </div>
      </div>
    </div>
  );
}
