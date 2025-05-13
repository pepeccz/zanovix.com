'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function TestImage() {
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="p-4 border border-red-500 m-4">
      <h2 className="text-xl font-bold mb-4">Test Image Component</h2>
      
      <div className="relative w-64 h-64 border border-blue-500">
        <Image
          src="/perfil.webp"
          alt="Test image"
          fill
          className="object-cover"
          onError={(e) => {
            console.error('Image error:', e);
            setError('Error loading image');
          }}
          onLoad={() => {
            console.log('Image loaded successfully');
            setLoaded(true);
          }}
        />
      </div>
      
      <div className="mt-4">
        {error && <p className="text-red-500">Error: {error}</p>}
        {loaded && <p className="text-green-500">Image loaded successfully!</p>}
      </div>
      
      <div className="mt-4">
        <h3 className="font-bold">Regular img tag test:</h3>
        <img 
          src="/perfil.webp" 
          alt="Test with regular img tag" 
          className="w-64 h-64 object-cover border border-green-500 mt-2" 
        />
      </div>
    </div>
  );
}
