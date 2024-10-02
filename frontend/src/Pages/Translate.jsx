import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

const Translate = () => {
  const [sourceLanguage, setSourceLanguage] = useState('EN');
  const [targetLanguage, setTargetLanguage] = useState('ID');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ID', name: 'Indonesian' },
    // Tambahkan bahasa lain sesuai kebutuhan
  ];

  const handleTranslate = async () => {
    const myHeaders = new Headers();
    myHeaders.append("apikey", "DWvFxtIeCH6m3L6YxmyzXqQfVvsq7YQK");

    const requestOptions = {
      method: 'POST',
      redirect: 'follow',
      headers: myHeaders,
      body: encodeURIComponent(sourceText)
    };

    try {
      const response = await fetch(`https://api.apilayer.com/language_translation/translate?source=${sourceLanguage}&target=${targetLanguage}`, requestOptions);
      const result = await response.json();
      setTranslatedText(result.translation);
    } catch (error) {
      console.log('error', error);
      setTranslatedText('An error occurred during translation.');
    }
  };

  const switchLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Language Translator</h1>
      <div className="flex items-center space-x-4 mb-4">
        <select
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
          className="w-40 p-2 border rounded"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
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
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <textarea
            placeholder="Enter text to translate"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={6}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <textarea
            placeholder="Translation will appear here"
            value={translatedText}
            readOnly
            rows={6}
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
      </div>
      <button onClick={handleTranslate} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Translate
      </button>
    </div>
  );
};

export default Translate;