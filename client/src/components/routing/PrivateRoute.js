import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Route, Navigate, useLocation } from 'react-router-dom';
// import { connect } from 'react-redux';
// import Spinner from '../layout/Spinner';
// import { Redirect } from 'request/lib/redirect';

// const PrivateRoute = ({ component: Component, auth: { isAuthenticated, loading }, ...rest }) => {
//     let location = useLocation();

//     return (
//         <Route {...rest} render={props => !isAuthenticated && !loading ? (<Navigate to='/login' state={{ from: location }} replace />) : (<Component {...props} />)}  />
//     )
// }


// const PrivateRoute = ({
//     component: Component,
//     auth: { isAuthenticated, loading }
//   }) => {
//     if (loading) return <Spinner />;
//     if (isAuthenticated) return <Component />;

//     return <Navigate to="/login" />;
// };

//sol#2
export default function PrivateRoute({ children }) {
    let location = useLocation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const loading = useSelector((state) => state.auth.loading);
    if (!isAuthenticated && !loading) {
      return <Navigate to='/login' state={{ from: location }} replace />;
    } else {
      return children;
    }
  }

PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth
});

//for sol#2 comment out
// export default connect(mapStateToProps)(PrivateRoute)