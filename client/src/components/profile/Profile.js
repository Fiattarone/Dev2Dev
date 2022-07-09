import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import { getProfileById } from '../../actions/profile';
import { Link, useParams } from 'react-router-dom';

const Profile = ({ getProfileById, profile: { profile, loading }, auth }) => {
    const { id } = useParams();
    useEffect(() => {
        getProfileById(id);
    }, [getProfileById, id])
  return (
    <Fragment>
        { profile === null || loading ? (<Spinner />) : (<Fragment>
            <Link to='/profiles' className='btn btn-light'>Return to Profiles</Link>
            { auth.isAuthenticated && auth.loading === false && auth.user._id === profile.user._id && (
                <Link to='/edit-profile'>Edit Profile</Link>
            )}
        </Fragment>)}
    </Fragment>
  )
}

Profile.propTypes = {
    getProfileById: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    profile: state.profile,
    auth: state.auth
})

export default connect(mapStateToProps, { getProfileById })(Profile)