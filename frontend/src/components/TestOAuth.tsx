   import { useEffect, useState } from 'react';
   import { authService } from '../services/authService';
   import { config } from '../config/config';
   
   function TestOAuth() {
     const [oauthUrl, setOauthUrl] = useState('');
     const [error, setError] = useState('');
     
     useEffect(() => {
       const getOAuthUrl = async () => {
         try {
           const response = await authService.getGoogleAuthUrl(`${config.FRONTEND_URL}/auth/callback`);
           console.log('OAuth response:', response);
           
           if (response.success && response.url) {
             setOauthUrl(response.url);
           } else {
             setError(response.message || 'Failed to get OAuth URL');
           }
         } catch (err) {
           console.error('Error getting OAuth URL:', err);
           setError('Network error occurred');
         }
       };
       
       getOAuthUrl();
     }, []);
     
     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold mb-4">OAuth Test</h1>
         
         {error && <div className="text-red-500 mb-4">{error}</div>}
         
         {oauthUrl && (
           <>
             <p className="mb-4">OAuth URL generated successfully:</p>
             <div className="bg-gray-100 p-4 mb-4 overflow-auto">
               <code>{oauthUrl}</code>
             </div>
             <a 
               href={oauthUrl} 
               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
             >
               Test Google Login
             </a>
           </>
         )}
       </div>
     );
   }
   
   export default TestOAuth;