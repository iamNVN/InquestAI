let currentEmailId = null;
let bannerInjected = false;

// On-Device Heuristics Engine (Fully Offline)
function analyzeEmailOffline(subject, senderName, senderEmail, bodyText) {
  let score = 0;
  let findings = [];

  const text = (subject + ' ' + bodyText).toLowerCase();
  
  // 1. Urgency/Threat keywords
  const urgencyWords = ['urgent', 'immediate action', 'suspend', 'verify', 'update your account', 'password expire', 'security alert', 'unauthorized access'];
  const foundUrgency = urgencyWords.filter(w => text.includes(w));
  if (foundUrgency.length > 0) {
    score += 40;
    findings.push(`Urgency language detected ("${foundUrgency[0]}")`);
  }

  // 2. Sender mismatch / suspicious domains
  const suspiciousDomains = ['.xyz', '.click', '.top', 'support-', 'billing-', 'security-', 'alert-'];
  if (suspiciousDomains.some(d => senderEmail.toLowerCase().includes(d))) {
    score += 50;
    findings.push(`Suspicious sender domain (${senderEmail})`);
  }

  // 3. Free email used for official brand impersonation
  const officialBrands = ['bank', 'paypal', 'netflix', 'apple', 'microsoft', 'amazon', 'google'];
  const isFreeEmail = senderEmail.includes('@gmail.com') || senderEmail.includes('@yahoo.com') || senderEmail.includes('@hotmail.com') || senderEmail.includes('@outlook.com');
  
  if (isFreeEmail && officialBrands.some(b => text.includes(b))) {
    score += 60;
    findings.push('Free email provider used for official brand');
  }
  
  // 4. Generic Greetings
  if (text.includes('dear customer') || text.includes('dear user') || text.includes('dear sir/madam')) {
    score += 20;
    findings.push('Generic non-personalized greeting');
  }

  const isPhishing = score >= 50;
  if (findings.length === 0) findings.push('No suspicious offline indicators found');

  return {
    verdict: isPhishing ? 'PHISHING' : 'LEGITIMATE',
    confidence: Math.min(score > 0 ? score : 90, 99),
    findings: findings.slice(0, 3)
  };
}

function extractEmailContent() {
  // Gmail specific DOM selectors
  // Subject: Usually in an h2 with class hP
  const subjectEl = document.querySelector('h2.hP');
  
  // Sender: Usually in a span with class gD, or we can look for email attributes
  const senderEls = document.querySelectorAll('.gD');
  let senderEl = null;
  // Get the last one in case of a thread
  if (senderEls.length > 0) senderEl = senderEls[senderEls.length - 1];

  // Body: Usually in a div with class a3s
  const bodyEls = document.querySelectorAll('.a3s');
  let bodyEl = null;
  if (bodyEls.length > 0) bodyEl = bodyEls[bodyEls.length - 1];

  if (!subjectEl || !senderEl || !bodyEl) return null;

  const subject = subjectEl.innerText.trim();
  const senderName = senderEl.innerText.trim();
  const senderEmail = senderEl.getAttribute('email') || senderEl.innerText;
  const bodyText = bodyEl.innerText.trim();
  
  // Convert to raw_email format for the backend
  const rawEmail = `From: "${senderName}" <${senderEmail}>\nTo: <recipient>\nSubject: ${subject}\nDate: ${new Date().toUTCString()}\n\n${bodyText}`;

  // Use a hash-like string to uniquely identify this email view
  const emailId = subject + senderEmail;

  return { subject, senderName, senderEmail, bodyText, rawEmail, emailId };
}

function injectBanner(analysis, rawEmail) {
  let banner = document.getElementById('inquest-ai-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'inquest-ai-banner';
    document.body.appendChild(banner);
  }

  const badgeClass = analysis.verdict === 'PHISHING' ? 'phishing' : 'legitimate';
  const findingsHtml = analysis.findings.map(f => `<li>${f}</li>`).join('');

  banner.innerHTML = `
    <div class="inquest-header">
      <span style="display:flex; align-items:center; gap:8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b872" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        InquestAI Scanner
      </span>
      <div style="display:flex; align-items:center;">
        <span class="inquest-badge ${badgeClass}">${analysis.verdict}</span>
        <button class="inquest-close-btn" id="inquest-close-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
    <ul class="inquest-findings">${findingsHtml}</ul>
    <button class="inquest-btn" id="inquest-log-btn">Log Case to Courtroom</button>
  `;

  document.getElementById('inquest-close-btn').addEventListener('click', () => {
    banner.remove();
    bannerInjected = false;
  });

  document.getElementById('inquest-log-btn').addEventListener('click', () => {
    const btn = document.getElementById('inquest-log-btn');
    btn.innerText = 'Submitting...';
    btn.disabled = true;

    chrome.runtime.sendMessage({ action: 'log_case', raw_email: rawEmail }, (response) => {
      if (response && response.success) {
        btn.innerText = 'Case Logged! View Dashboard';
        btn.style.background = '#28a745';
        btn.style.color = '#fff';
        btn.onclick = () => window.open('http://18.60.241.151/dashboard', '_blank');
        btn.disabled = false;
      } else {
        btn.innerText = 'Failed to Log';
        btn.style.background = '#dc3545';
      }
    });
  });
}

function scanLoop() {
  const emailData = extractEmailContent();
  
  if (emailData) {
    if (currentEmailId !== emailData.emailId) {
      currentEmailId = emailData.emailId;
      console.log('[InquestAI] New email opened. Scanning on-device...');
      const analysis = analyzeEmailOffline(emailData.subject, emailData.senderName, emailData.senderEmail, emailData.bodyText);
      injectBanner(analysis, emailData.rawEmail);
      bannerInjected = true;
    }
  } else {
    if (bannerInjected) {
      currentEmailId = null;
      const banner = document.getElementById('inquest-ai-banner');
      if (banner) banner.remove();
      bannerInjected = false;
    }
  }
}

// Listen for requests from the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get_analysis') {
    const emailData = extractEmailContent();
    if (emailData) {
      const analysis = analyzeEmailOffline(emailData.subject, emailData.senderName, emailData.senderEmail, emailData.bodyText);
      sendResponse({ analysis, rawEmail: emailData.rawEmail });
    } else {
      sendResponse({ analysis: null });
    }
  }
});

// Run scan loop every 1s to detect navigation inside Gmail's SPA
setInterval(scanLoop, 1000);
