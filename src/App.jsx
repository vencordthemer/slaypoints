import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase'; // Import from our new file
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true); // Track initial auth state check
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('light'); // Add theme state, default 'light'
  const [pointsAdjustment, setPointsAdjustment] = useState(''); // State for the input value
  const [infoMessage, setInfoMessage] = useState(''); // State for info/success messages

  // Apply theme attribute to html tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listener for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setError(''); // Clear error on auth change
      if (currentUser) {
        setUser(currentUser);
        // Fetch or create user points data in Firestore
        const userDocRef = doc(db, 'userPoints', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setPoints(docSnap.data().points);
        } else {
          // Create initial points document if it doesn't exist
          try {
            await setDoc(userDocRef, {
              email: currentUser.email,
              points: 0, // Start with 0 points
              createdAt: serverTimestamp()
            });
            setPoints(0);
          } catch (err) {
            console.error("Error creating user document: ", err);
            setError('Failed to initialize user data.');
          }
        }
      } else {
        setUser(null);
        setPoints(0); // Reset points when logged out
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle setting user and fetching/creating points
      setEmail(''); // Clear form
      setPassword('');
    } catch (err) {
      console.error("Sign up error: ", err);
      setError(`Sign up failed: ${err.message}`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle setting user and fetching points
      setEmail(''); // Clear form
      setPassword('');
    } catch (err) {
      console.error("Login error: ", err);
      setError(`Login failed: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      await signOut(auth);
      // Auth state listener will handle clearing user state
    } catch (err) {
      console.error("Logout error: ", err);
      setError('Logout failed.');
    }
  };

  const handleAdjustPoints = async (e) => {
    e.preventDefault(); // Prevent form submission if it's in a form
    if (!user || pointsAdjustment === '') return;

    const amount = parseInt(pointsAdjustment, 10);

    if (isNaN(amount)) {
      setError('Please enter a valid number.');
      return;
    }

    setError(''); // Clear previous errors
    const userDocRef = doc(db, 'userPoints', user.uid);
    const newPoints = Math.max(0, points + amount); // Prevent negative points balance

    try {
      await updateDoc(userDocRef, {
        points: newPoints
      });
      setPoints(newPoints); // Update local state
      setPointsAdjustment(''); // Clear the input field
    } catch (err) {
      console.error("Error updating points: ", err);
      setError('Failed to update points.');
      // Optional: Revert local state if update fails by re-fetching
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setPoints(docSnap.data().points);
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address to reset the password.');
      setInfoMessage(''); // Clear info message
      return;
    }
    setError(''); // Clear previous errors
    setInfoMessage(''); // Clear previous info
    try {
      await sendPasswordResetEmail(auth, email);
      setInfoMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      console.error("Password reset error: ", err);
      setError(`Password reset failed: ${err.message}`);
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking auth
  }

  return (
    <div className="App">
      {/* Theme Toggle Button - Placed at the top */}
      <button onClick={toggleTheme} style={{ position: 'absolute', top: '10px', right: '10px' }}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>

      <h1>SlayPoints</h1>
      {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}
      {infoMessage && <p style={{ color: 'green' }}>{infoMessage}</p>}

      {user ? (
        // Logged-in view
        <div>
          <p>Welcome, {user.email}!</p>
          <p>Your Points: {points}</p>

          {/* Points Adjustment Input and Button */}
          <form onSubmit={handleAdjustPoints}>
            <input
              type="number"
              value={pointsAdjustment}
              onChange={(e) => setPointsAdjustment(e.target.value)}
              placeholder="Enter points (+/-)"
              aria-label="Points to adjust"
            />
            <button type="submit">Adjust Points</button>
          </form>

          <hr />
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        // Logged-out view (Login/Signup Form)
        <div>
          <h2>Login or Sign Up</h2>
          <form>
            <div>
              <label>Email: </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password: </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" onClick={handleLogin}>Login</button>
            <button type="submit" onClick={handleSignUp}>Sign Up</button>
            <button type="button" onClick={handlePasswordReset} style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
              Forgot Password?
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
