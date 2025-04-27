import { cookies } from 'next/headers';
import { jwtVerify } from 'jose'; // You might need to install this package

export async function getAuthStatus() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('authToken')?.value;
    
    console.log('Token found:', !!token);
    
    if (!token) {
      return { authenticated: false, reason: 'No token found' };
    }
    
    // Verify the token
    try {
      const verified = await jwtVerify(
        token, 
        new TextEncoder().encode(process.env.JWT_SECRET)
      );
      
      console.log('Verification result:', verified);
      return { authenticated: true, user: verified.payload };
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return { authenticated: false, reason: 'Invalid token' };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false, reason: 'Error checking auth' };
  }
}