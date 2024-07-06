import React, { Fragment, useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import customAxios from '../server/utils/customAxios';
import ProgressBar from './components/Layout/ProgressBar';
import NotFound from './404';
const Auth = lazy(() => import('./components/Auth/Auth'));
const NewPost = lazy(() => import('./components/Wall/NewPost'));
const Navbar = lazy(() => import('./components/Layout/Navbar/Navbar'));
const Profile = lazy(() => import('./components/Profile/Profile'));
const Wall = lazy(() => import('./components/Wall/Wall'));
const Chat = lazy(() => import('./components/Bench/Chat'));

const App = () => {
	//Navbar driver
	const [start, setStart] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	//
	const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('mode') === 'dark');
	const [isAuth, setIsAuth] = useState(null);
	const [theme, setTheme] = useState(() => createTheme({
		palette: {
			mode: isDarkMode ? 'dark' : 'light',
		},
	}));

	useEffect(() => {
		const fetch = async () => {
			try {
				await customAxios.get('/auth/session');
				setIsAuth(true);
			} catch (error) {
				setIsAuth(false);
			}
		}
		fetch();
	}, []);

	useEffect(() => {
		localStorage.setItem('mode', isDarkMode ? 'dark' : 'light');
		setTheme(createTheme({
			palette: {
				mode: isDarkMode ? 'dark' : 'light',
			},
		}));
	}, [isDarkMode]);

	const toggleMode = () => setIsDarkMode(!isDarkMode);

	const commonProps = {
		start,
		setStart,
		searchInput,
		setSearchInput,
	};
	return (
		<Router>
			{theme && isAuth !== null ? (
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<Suspense fallback={<ProgressBar />}>
						{isAuth ? (
							<Fragment>
								<Navbar setStart={setStart} setSearchInput={setSearchInput} toggleMode={toggleMode} />
								<div className='row'>
									<Routes>
										<Route path='/' element={<Profile />} />
										<Route path='/wall/profile/:user' element={<Profile />} />
										<Route path='/wall' element={<Wall {...commonProps} />} />
										<Route path='/wall/:user/posts' element={<Wall {...commonProps} />} />
										<Route path='/wall/:user/posts/joined' element={<Wall {...commonProps} />} />
										<Route path='/createPost' element={<NewPost />} />
										<Route path='/bench/:postid' element={<Chat />} />
										<Route path='*' element={<NotFound />} />
									</Routes>
								</div>
							</Fragment>
						) : (
							<Routes>
								<Route path='/' element={<Auth />} />
								<Route path='*' element={<NotFound />} />
							</Routes>
						)}
					</Suspense>
				</ThemeProvider>
			) : (
				<ProgressBar />
			)}
		</Router>
	);
};

export default App;
