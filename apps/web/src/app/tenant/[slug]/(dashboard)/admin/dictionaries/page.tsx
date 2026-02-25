'use client';

import DictionaryManager from '@/components/admin/dictionaries/DictionaryManager';

export default function DictionariesPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Platform Dictionaries</h1>
        <p className="text-sm text-muted-foreground">Manage phases, grades, languages, salutations and other platform-wide reference data.</p>
      </div>
      <DictionaryManager />
    </div>
  );
}
