// Emergency reset function for testing
export const forceResetWalletConnection = async () => {
  try {
    console.log('🚨 EMERGENCY RESET - Clearing all wallet data');
    
    // Clear localStorage
    localStorage.removeItem('walletconnect');
    localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
    
    // Clear sessionStorage  
    sessionStorage.clear();
    
    // Try to disconnect from MetaMask
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{
            eth_accounts: {}
          }]
        });
      } catch (err) {
        console.log('Permission revoke not supported:', err.message);
      }
    }
    
    // Force page reload
    console.log('🔄 Forcing page reload...');
    window.location.reload();
    
  } catch (error) {
    console.error('Reset failed:', error);
    alert('Manual reset required: Please clear browser data or use incognito mode');
  }
};

export default forceResetWalletConnection;