chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log_case') {
    // Send to backend (VPS IP)
    fetch('http://18.60.241.151:4000/api/investigate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw_email: request.raw_email })
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, data });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.toString() });
    });
    
    // Keep the messaging channel open for the async response
    return true; 
  }
});
