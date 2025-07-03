import Cookies from 'js-cookie';

export const setAuthCookies = (token, role) => {
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    expires: 7, // 7 days
    path: '/'
  };

  // Set cookies with secure flags and expiry
  Cookies.set('token', token, cookieOptions);
  Cookies.set('userRole', role, cookieOptions);
};

export const clearAuthCookies = () => {
  const options = { path: '/' };
  Cookies.remove('token', options);
  Cookies.remove('userRole', options);
};

export const getAuthCookies = () => {
  return {
    token: Cookies.get('token'),
    userRole: Cookies.get('userRole')
  };
}; 