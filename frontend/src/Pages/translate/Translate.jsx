import React, { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';

const Translate = () => {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('id');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    const myHeaders = new Headers();
    myHeaders.append("apikey", "uSjToUVQMZJUMicM73YCSVG0NytQdYLR");

    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
      headers: myHeaders
    };

    try {
      const response = await fetch("https://api.apilayer.com/language_translation/languages", requestOptions);
      const result = await response.json();
      // console.log("API Response:", result);
      if (result.languages && Array.isArray(result.languages)) {
        setLanguages(result.languages);
      } else {
        console.error("Unexpected API response structure:", result);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleTranslate = async () => {
    // Periksa apakah ada teks yang akan diterjemahkan
    if (!sourceText.trim()) {
      setTranslatedText("Please enter text to translate.");
      return;
    }
  
    // Periksa apakah source dan target language sudah dipilih
    if (!sourceLanguage || !targetLanguage) {
      setTranslatedText("Please select both source and target languages.");
      return;
    }
  
    const myHeaders = new Headers();
    myHeaders.append("apikey", "uSjToUVQMZJUMicM73YCSVG0NytQdYLR");
    myHeaders.append("Content-Type", "application/json");
  
    const raw = JSON.stringify({
      source: sourceLanguage,
      target: targetLanguage,
      text: sourceText
    });
  
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
  
    try {
      const response = await fetch("https://api.apilayer.com/language_translation/translate", requestOptions);
      const result = await response.json();
      console.log("API Response:", result);
  
      let translatedText = '';
  
      if (response.ok && result.translations && result.translations.length > 0) {
        const translation = result.translations[0];
        
        if (typeof translation === 'string') {
          // Untuk kasus dari Inggris ke Indonesia
          translatedText = translation;
        } else if (typeof translation.translation === 'string') {
          // Untuk kasus dari Indonesia ke Inggris
          try {
            const parsedTranslation = JSON.parse(translation.translation);
            translatedText = parsedTranslation.text || "Translation not found";
          } catch (parseError) {
            // Jika parsing gagal, gunakan nilai mentah
            translatedText = translation.translation;
          }
        } else {
          translatedText = "Unexpected translation format";
        }
      } else {
        console.error("API error or unexpected response:", result);
        translatedText = "Translation error. Please try again.";
      }
  
      setTranslatedText(translatedText);
      console.log("Translated text:", translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText("An error occurred. Please try again.");
    }
  };
  
  const switchLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText('');
  };

  return (
    <div>
    <Navbar/>
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Language Translator</h1>
      <div className="flex items-center space-x-4 mb-4">
        <select
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
          className="w-40 p-2 border rounded"
        >
          {languages.map((lang) => (
            <option key={lang.language} value={lang.language}>
              {lang.language_name}
            </option>
          ))}
        </select>
        <button onClick={switchLanguages} className="p-2 border rounded">
          <ArrowRightLeft className="h-4 w-4" />
        </button>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-40 p-2 border rounded"
        >
          {languages.map((lang) => (
            <option key={lang.language} value={lang.language}>
              {lang.language_name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex space-x-4">
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="w-1/2 p-2 border rounded"
          placeholder="Enter text to translate"
          rows={5}
        />
        <textarea
          value={translatedText}
          readOnly
          className="w-1/2 p-2 border rounded bg-gray-100"
          placeholder="Translation will appear here"
          rows={5}
        />
      </div>
      <button
        onClick={handleTranslate}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Translate
      </button>
    </div>
  </div>
);
};

export default Translate;
