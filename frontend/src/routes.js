import {Navigate} from "react-router-dom";
import {createBrowserHistory} from 'history';
import Login from "./pages/Login";
import Home from "./pages/Home";

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
			element: true ? <Home/> : <Login/>
		},

	]
}

export default routes;