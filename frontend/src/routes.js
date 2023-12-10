import {Navigate} from "react-router-dom";
import {createBrowserHistory} from 'history';
import Login from "./pages/Login";
import Home from "./pages/Home";
import CallbackPage from "./pages/Callback";

const browserHistory = createBrowserHistory();

const routes = (isLoggedIn) => {
	const prevPath = browserHistory.location.pathname;

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
      path: '/callback',
      element: <CallbackPage />
    },
		{
			path: '/home',
			element: isLoggedIn ? <Home/> : <Navigate to={'/login'} />
		},

	]
}

export default routes;