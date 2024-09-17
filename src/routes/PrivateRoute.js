import { useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const PrivateRoute =()=> {
    const auth = useSelector(x => x.auth.value);
   const navigate = useNavigate();

    useEffect(() => {
        if (!auth) {
          navigate('login');
        }
      }, [auth, navigate]);

    // authorized so return outlet for child routes
    return <Outlet />;
}

export default PrivateRoute;