import React, { createContext, useState, useContext } from 'react';

const translations = {
  English: {
    dashboard: 'Dashboard',
    inquest: 'INQUEST',
    subtitle: 'AI PHISHING INVESTIGATION',
    tagline: 'Forward. We investigate. You stay safe.',
    instruction: 'Forward any suspicious email to our secure address.',
    email_label: 'OUR COURTROOM EMAIL',
    copied: 'Copied!',
    copy_email: 'Copy Email Address',
    feature1_title: 'Reads emails in real-time',
    feature1_desc: 'Instant analysis begins the moment we receive it.',
    feature2_title: 'Courtroom-style verdict',
    feature2_desc: 'Every claim is argued. Every verdict is justified.',
    feature3_title: 'Reports in your language',
    feature3_desc: 'Get clear reports in multiple languages.',
    more_languages: 'More languages coming soon...',
    need_help: 'Need Help?',
    the_verdict: 'THE VERDICT',
    guilty: 'GUILTY',
    safe: 'SAFE',
    phishing_detected: 'PHISHING DETECTED',
    email_legitimate: 'EMAIL IS LEGITIMATE',
    confidence_level: 'CONFIDENCE LEVEL',
    replay_hearing: 'Replay Hearing',
    view_hearing: 'View Hearing',
    generate_report: 'Generate Report',
    generate_new_report: 'Generate New Report',
    investigate_another: 'Investigate Another Email',
    prosecution: 'THE PROSECUTION',
    arguing_phishing: 'Arguing why this email might be',
    phishing: 'PHISHING',
    defense: 'THE DEFENSE',
    arguing_legitimate: 'Arguing why this email might be',
    legitimate: 'LEGITIMATE',
    strength: 'STRENGTH OF CASE',
    live_argument: 'LIVE ARGUMENT',
    hearing_transcript: 'HEARING TRANSCRIPT',
    court_session: 'Court is now in session. The Prosecution may present their case.',
    pros_args: [
      "Domain is a typosquat of PayPal...", 
      "Redirects to suspicious IP...", 
      "Urgency keywords detected..."
    ],
    def_args: [
      "SSL certificate is valid...", 
      "Sender has good reputation...", 
      "No malicious attachments found..."
    ],
    final_judgement: 'FINAL JUDGEMENT',
    the_court_verdict: 'THE COURT VERDICT',
    this_email_is_a: 'This email is a',
    phishing_attempt: 'PHISHING attempt',
    safe_attempt: 'SAFE email',
    confidence: 'Confidence',
    reason: 'REASON',
    verdict_reason_final: 'The court finds the prosecution has proven the intent to deceive beyond reasonable doubt based on the evidence presented.',
    verdict_reason_default: 'The sender is using a lookalike domain, the link redirects to a suspicious website, and the content intentionally creates urgency to trick you.'
  },
  Tamil: {
    dashboard: 'டாஷ்போர்டு',
    inquest: 'இன்குவெஸ்ட்',
    subtitle: 'ஏஐ பிஷிங் விசாரணை',
    tagline: 'பகிரவும். நாங்கள் விசாரிக்கிறோம். நீங்கள் பாதுகாப்பாக இருங்கள்.',
    instruction: 'சந்தேகத்திற்குரிய மின்னஞ்சல்களை எங்கள் பாதுகாப்பான முகவரிக்கு பகிரவும்.',
    email_label: 'எங்கள் நீதிமன்ற மின்னஞ்சல்',
    copied: 'நகலெடுக்கப்பட்டது!',
    copy_email: 'மின்னஞ்சல் முகவரியை நகலெடு',
    feature1_title: 'நிகழ்நேர மின்னஞ்சல் பகுப்பாய்வு',
    feature1_desc: 'மின்னஞ்சல் கிடைத்தவுடன் பகுப்பாய்வு தொடங்குகிறது.',
    feature2_title: 'நீதிமன்ற தீர்ப்பு முறை',
    feature2_desc: 'ஒவ்வொரு வாதமும் விசாரிக்கப்பட்டு, தீர்ப்பு நியாயப்படுத்தப்படுகிறது.',
    feature3_title: 'உங்கள் மொழியில் அறிக்கை',
    feature3_desc: 'பல மொழிகளில் தெளிவான அறிக்கைகளைப் பெறுங்கள்.',
    more_languages: 'மேலும் மொழிகள் விரைவில்...',
    need_help: 'உதவி தேவையா?',
    the_verdict: 'தீர்ப்பு',
    guilty: 'குற்றவாளி',
    safe: 'பாதுகாப்பானது',
    phishing_detected: 'பிஷிங் கண்டறியப்பட்டுள்ளது',
    email_legitimate: 'மின்னஞ்சல் உண்மையானது',
    confidence_level: 'நம்பிக்கை நிலை',
    replay_hearing: 'விசாரணையை மீண்டும் காண்க',
    view_hearing: 'விசாரணையைக் காண்க',
    generate_report: 'அறிக்கையை உருவாக்கு',
    generate_new_report: 'புதிய அறிக்கையை உருவாக்கு',
    investigate_another: 'மற்றொரு மின்னஞ்சலை விசாரி',
    prosecution: 'தரப்பு வாதம்',
    arguing_phishing: 'இந்த மின்னஞ்சல் ஏன்',
    phishing: 'பிஷிங்',
    defense: 'எதிர் வாதம்',
    arguing_legitimate: 'இந்த மின்னஞ்சல் ஏன்',
    legitimate: 'உண்மையானது',
    strength: 'வழக்கின் பலம்',
    live_argument: 'நேரடி வாதம்',
    hearing_transcript: 'விசாரணை பதிவு',
    court_session: 'நீதிமன்றம் இப்போது அமர்வில் உள்ளது. தரப்பு வாதம் தங்கள் வழக்கை முன்வைக்கலாம்.',
    pros_args: [
      "டொமைன் பேபாலின் டைபோஸ்குவாட்...", 
      "சந்தேகத்திற்குரிய ஐபி-க்கு திருப்புகிறது...", 
      "அவசர வார்த்தைகள் உள்ளன..."
    ],
    def_args: [
      "SSL சான்றிதழ் செல்லுபடியாகும்...", 
      "அனுப்புநருக்கு நல்ல நற்பெயர் உள்ளது...", 
      "தீங்கிழைக்கும் இணைப்புகள் எதுவும் இல்லை..."
    ],
    final_judgement: 'இறுதி தீர்ப்பு',
    the_court_verdict: 'நீதிமன்ற தீர்ப்பு',
    this_email_is_a: 'இந்த மின்னஞ்சல் ஒரு',
    phishing_attempt: 'பிஷிங் முயற்சி',
    safe_attempt: 'பாதுகாப்பான மின்னஞ்சல்',
    confidence: 'நம்பிக்கை',
    reason: 'காரணம்',
    verdict_reason_final: 'முன்வைக்கப்பட்ட ஆதாரங்களின் அடிப்படையில் ஏமாற்றும் நோக்கம் சந்தேகத்திற்கு இடமின்றி நிரூபிக்கப்பட்டுள்ளதாக நீதிமன்றம் கருதுகிறது.',
    verdict_reason_default: 'அனுப்புநர் போலியான டொமைனைப் பயன்படுத்துகிறார், இணைப்பு சந்தேகத்திற்குரிய வலைத்தளத்திற்குத் திருப்புகிறது, மற்றும் உங்களை ஏமாற்றுவதற்காக வேண்டுமென்றே அவசரத்தை உருவாக்குகிறது.'
  },
  Hindi: {
    dashboard: 'डैशबोर्ड',
    inquest: 'इन्क्वेस्ट',
    subtitle: 'एआई फ़िशिंग जाँच',
    tagline: 'फॉरवर्ड करें। हम जाँच करते हैं। आप सुरक्षित रहें।',
    instruction: 'किसी भी संदिग्ध ईमेल को हमारे सुरक्षित पते पर फॉरवर्ड करें।',
    email_label: 'हमारा कोर्टरूम ईमेल',
    copied: 'कॉपी हो गया!',
    copy_email: 'ईमेल पता कॉपी करें',
    feature1_title: 'रीयल-टाइम ईमेल पढ़ना',
    feature1_desc: 'ईमेल प्राप्त होते ही त्वरित विश्लेषण शुरू होता है।',
    feature2_title: 'कोर्टरूम शैली का फैसला',
    feature2_desc: 'हर दावे पर बहस होती है। हर फैसला न्यायसंगत होता है।',
    feature3_title: 'आपकी भाषा में रिपोर्ट',
    feature3_desc: 'कई भाषाओं में स्पष्ट रिपोर्ट प्राप्त करें।',
    more_languages: 'अधिक भाषाएँ जल्द ही आ रही हैं...',
    need_help: 'मदद चाहिए?',
    the_verdict: 'फैसला',
    guilty: 'दोषी',
    safe: 'सुरक्षित',
    phishing_detected: 'फ़िशिंग का पता चला',
    email_legitimate: 'ईमेल वैध है',
    confidence_level: 'विश्वास स्तर',
    replay_hearing: 'सुनवाई फिर से देखें',
    view_hearing: 'सुनवाई देखें',
    generate_report: 'रिपोर्ट बनाएँ',
    generate_new_report: 'नई रिपोर्ट बनाएँ',
    investigate_another: 'एक और ईमेल की जाँच करें',
    prosecution: 'अभियोजन पक्ष',
    arguing_phishing: 'बहस कि यह ईमेल क्यों',
    phishing: 'फ़िशिंग है',
    defense: 'बचाव पक्ष',
    arguing_legitimate: 'बहस कि यह ईमेल क्यों',
    legitimate: 'वैध है',
    strength: 'केस की मजबूती',
    live_argument: 'लाइव बहस',
    hearing_transcript: 'सुनवाई का ट्रांसक्रिप्ट',
    court_session: 'अदालत अब सत्र में है। अभियोजन पक्ष अपना मामला पेश कर सकता है।',
    pros_args: [
      "डोमेन PayPal का टाइपोस्क्वाट है...", 
      "संदिग्ध IP पर रीडायरेक्ट करता है...", 
      "तत्काल कीवर्ड पाए गए..."
    ],
    def_args: [
      "SSL प्रमाणपत्र वैध है...", 
      "प्रेषक की प्रतिष्ठा अच्छी है...", 
      "कोई दुर्भावनापूर्ण अनुलग्नक नहीं मिला..."
    ],
    final_judgement: 'अंतिम फैसला',
    the_court_verdict: 'अदालत का फैसला',
    this_email_is_a: 'यह ईमेल एक',
    phishing_attempt: 'फ़िशिंग प्रयास है',
    safe_attempt: 'सुरक्षित ईमेल है',
    confidence: 'विश्वास',
    reason: 'कारण',
    verdict_reason_final: 'अदालत पाती है कि अभियोजन पक्ष ने प्रस्तुत साक्ष्यों के आधार पर उचित संदेह से परे धोखा देने का इरादा साबित कर दिया है।',
    verdict_reason_default: 'प्रेषक एक मिलते-जुलते डोमेन का उपयोग कर रहा है, लिंक एक संदिग्ध वेबसाइट पर रीडायरेक्ट करता है, और सामग्री जानबूझकर आपको धोखा देने के लिए तात्कालिकता पैदा करती है।'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('English');

  const t = (key) => {
    return translations[language][key] || translations['English'][key] || key;
  };

  const tArray = (key) => {
    return translations[language][key] || translations['English'][key] || [];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tArray }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
