'use client';

import DictionaryManager from '@/components/admin/dictionaries/DictionaryManager';

export default function DictionariesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Dictionaries</h1>
        <p className="text-muted-foreground">Manage phases, grades, languages, salutations and other platform-wide reference data.</p>
      </div>
      <DictionaryManager />
    </div>
  );
}
