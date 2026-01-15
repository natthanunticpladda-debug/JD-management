import { useState, useEffect } from 'react';

export interface CompanyAsset {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

const STORAGE_KEY = 'jd_company_assets';

const defaultAssets: CompanyAsset[] = [
  {
    id: '1',
    name: 'Laptop',
    description: 'Company-issued laptop computer',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mobile Phone',
    description: 'Company mobile phone',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Access Card',
    description: 'Building access card',
    createdAt: new Date().toISOString(),
  },
];

export const useCompanyAssets = () => {
  const [assets, setAssets] = useState<CompanyAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const loadedAssets = JSON.parse(stored);
        // Remove duplicates based on name (case-insensitive)
        const uniqueAssets = loadedAssets.reduce((acc: CompanyAsset[], current: CompanyAsset) => {
          const exists = acc.find(item => item.name.toLowerCase() === current.name.toLowerCase());
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
        setAssets(uniqueAssets);
      } catch (error) {
        console.error('Error loading company assets:', error);
        setAssets(defaultAssets);
      }
    } else {
      setAssets(defaultAssets);
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever assets change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    }
  }, [assets, loading]);

  const addAsset = (name: string, description?: string) => {
    // Check if asset with same name already exists
    const exists = assets.some(asset => asset.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      throw new Error('ทรัพย์สินนี้มีอยู่แล้ว');
    }
    
    const newAsset: CompanyAsset = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const updateAsset = (id: string, name: string, description?: string) => {
    // Check if another asset with same name exists (excluding current asset)
    const exists = assets.some(asset => 
      asset.id !== id && asset.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      throw new Error('ทรัพย์สินนี้มีอยู่แล้ว');
    }
    
    setAssets(prev =>
      prev.map(asset =>
        asset.id === id ? { ...asset, name, description } : asset
      )
    );
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
  };
};
