chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  const statusText = document.getElementById('status-text');
  const spinner = document.getElementById('spinner');
  
  if (tab.url && tab.url.includes("mail.google.com")) {
    statusText.innerText = 'Analyzing email data...';
    
    // Request analysis from content script
    chrome.tabs.sendMessage(tab.id, { action: "get_analysis" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.analysis) {
        spinner.style.display = 'none';
        statusText.innerText = 'No email thread is currently open.';
        return;
      }
      
      document.getElementById('status').style.display = 'none';
      document.getElementById('content-container').style.display = 'block';
      
      const analysis = response.analysis;
      const rawEmail = response.rawEmail;
      
      const badge = document.getElementById('verdict-badge');
      badge.innerText = analysis.verdict;
      badge.className = 'inquest-badge ' + (analysis.verdict === 'PHISHING' ? 'phishing' : 'legitimate');
      
      const list = document.getElementById('findings-list');
      list.innerHTML = analysis.findings.map(f => `<li>${f}</li>`).join('');
      
      document.getElementById('inquest-log-btn').addEventListener('click', () => {
        const btn = document.getElementById('inquest-log-btn');
        btn.innerHTML = '<div class="scanning-spinner" style="width:16px;height:16px;border-color:rgba(255,255,255,0.3);border-top-color:#fff;"></div> Escalating...';
        btn.disabled = true;

        chrome.runtime.sendMessage({ action: 'log_case', raw_email: rawEmail }, (res) => {
          if (res && res.success) {
            btn.innerHTML = 'Case Logged! View Courtroom';
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            btn.style.color = '#fff';
            btn.onclick = () => window.open('http://18.60.241.151/dashboard', '_blank');
            btn.disabled = false;
          } else {
            btn.innerHTML = 'Failed to Escalate';
            btn.style.background = '#ef4444';
          }
        });
      });
    });
  } else {
    spinner.style.display = 'none';
    statusText.innerText = 'Please open Gmail to use this extension.';
  }
});
