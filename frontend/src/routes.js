import { Navigate } from "react-router-dom";
import { createBrowserHistory } from 'history';
import Login from "./pages/Login";
import Home from "./pages/Home";
import ColorPicker from "./pages/ColorPicker";
import Layout from "./components/Layout";

const browserHistory = createBrowserHistory();


const routes = () => {
	const prevPath = browserHistory.location.pathname;
	const isLoggedIn = false;

	return [
		{
			path: '/',
			element: <Navigate to={isLoggedIn ? '/home' : '/login'}/>
		},
		{
			path: '/login',
			element: isLoggedIn ? <Navigate to={(prevPath === '/login') ? '/home' : prevPath}/> : <Login/>
		},
		{
			path: '/home',
			element: true ? <Layout Page={Home}/> : <Login/>
		},
		{
			path: '/color-picker',
			element: true ? <Layout Page={ColorPicker}/> : <Login/>
		},

	]
}

export default routes;