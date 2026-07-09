'use client';

import { useState } from 'react';
import Button from '../../_components/Admin/Button';
import { Package, Database } from 'lucide-react';

export default function SeedButton() {
  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Database seeded successfully!');
      } else {
        alert('Failed to seed: ' + data.error);
      }
    } catch (err) {
      alert('Error seeding database: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button 
        onClick={handleSeedData}
        disabled={seeding}
        variant="secondary"
        icon={<Database size={16} />}
      >
        {seeding ? 'Seeding...' : 'Seed Mock Data'}
      </Button>
      <Button href="/admin/products/add" icon={<Package size={16} />}>
        New Product
      </Button>
    </div>
  );
}
