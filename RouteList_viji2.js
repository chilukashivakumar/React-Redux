import React,{ useCallback, useRef, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Notification from '_components/Notification';
import Nav from '_components/Nav';
import Home from 'container/home/Home';
import LoginLayout from 'container/layout/LoginLayout';
import UsersLayout from 'container/layout/UsersLayout';
import PrivateRoute from './PrivateRoute';
import SessionTimeout from '_components/SessionTimeout';
import {store, authActions } from '_store';
import { usePromiseTracker } from 'react-promise-tracker';
import LoadingOverlay from '_components/LoadingOverlay';

const RouteList = () => {
    const intervalRef = useRef();
    const promiseTracker = usePromiseTracker();
    const dispatch = useDispatch();
    const logout = () => dispatch(authActions.logout());
    const auth = useSelector(x => x.auth.value);
    const thresholdMinsToRefreshTokenBeforeExpiry = 5; // 5 mins

    const getToken = useCallback(() => {
        // Get new token if and only if existing token is available
        const auth = store.getState().auth.value;
        if (auth) {

            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            const tokenExpiryDateTime = new Date(auth?.tokenExpiry);
            tokenExpiryDateTime.setMinutes(tokenExpiryDateTime.getMinutes() - thresholdMinsToRefreshTokenBeforeExpiry);
            const targetHours = tokenExpiryDateTime.getHours();
            const targetMinutes = tokenExpiryDateTime.getMinutes();
            const targetSeconds = tokenExpiryDateTime.getSeconds();

            if (hours === targetHours && minutes === targetMinutes && seconds === targetSeconds) {
                dispatch(authActions.refreshToken());
            }
        }
    }, []);

     // Trigger API to get a new token before token gets expired.
     useEffect(() => {
        const interval = setInterval(() => getToken(),  1000); // runs for every second an check if current time is same as time fore calling refresh token
        intervalRef.current = interval;
        return () => clearInterval(interval);
    }, [getToken]);

    return (
        <div>
            <Nav />
            {/* <Alert /> */}
            <Notification/>
            <LoadingOverlay loading={promiseTracker.promiseInProgress}></LoadingOverlay>
            <div className="  p-0">
                <Routes >
                    {/* private */}
                    <Route element={<PrivateRoute />}>
                        <Route path="home" element={<Home />} />
                        <Route path="users/*" element={<UsersLayout />} />
                    </Route>
                    {/* public */}
                    <Route path="/*" element={<LoginLayout />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <SessionTimeout onLogout={logout} isAuthenticated={auth} />
            </div>
        </div>
    );
}

export default RouteList;